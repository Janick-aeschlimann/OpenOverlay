import * as uws from "uws";
import * as env from "lib0/environment";
import * as logging from "lib0/logging";
import * as error from "lib0/error";
import * as json from "lib0/json";
import { registerYWebsocketServer } from "../src/ws.js";
import * as promise from "lib0/promise";

import { createRemoteJWKSet, jwtVerify } from "jose";

const JWKS = createRemoteJWKSet(new URL(env.ensureConf("auth-public-key-url")));

// const wsServerPrivateKey = await ecdsa.importKeyJwk(json.parse(env.ensureConf('auth-private-key')))

class YWebsocketServer {
  /**
   * @param {uws.TemplatedApp} app
   */
  constructor(app) {
    this.app = app;
  }

  async destroy() {
    this.app.close();
  }
}

/**
 * @param {Object} opts
 * @param {number} opts.port
 * @param {import('./storage.js').AbstractStorage} opts.store
 * @param {string} [opts.redisPrefix]
 * @param {string} opts.checkPermCallbackUrl
 * @param {(room:string,docname:string,client:import('./api.js').Api)=>void} [opts.initDocCallback] -
 * this is called when a doc is accessed, but it doesn't exist. You could populate the doc here.
 * However, this function could be called several times, until some content exists. So you need to
 * handle concurrent calls.
 */
export const createYWebsocketServer = async ({
  redisPrefix = "y",
  port,
  store,
  checkPermCallbackUrl,
  initDocCallback = () => {},
}) => {
  checkPermCallbackUrl += checkPermCallbackUrl.slice(-1) !== "/" ? "/" : "";
  const app = uws.App({});
  await registerYWebsocketServer(
    app,
    "/:room",
    store,
    async (req) => {
      const room = req.getParameter(0);
      const headerWsProtocol = req.getHeader("sec-websocket-protocol");
      const [, , token] = /(^|,)yauth-(((?!,).)*)/.exec(headerWsProtocol) ?? [
        null,
        null,
        req.getQuery("yauth"),
      ];
      if (token == null) {
        throw new Error("Missing Token");
      }
      // verify that the user has a valid token
      const { payload: userToken } = await jwtVerify(token, JWKS);
      if (userToken.sub == null) {
        throw new Error("Missing userid in user token!");
      }
      const permUrl = new URL(`${room}/${userToken.sub}`, checkPermCallbackUrl);
      try {
        const perm = await fetch(permUrl).then((req) => req.json());
        return {
          hasWriteAccess: perm.yaccess === "rw",
          room,
          userid: perm.yuserid || "",
        };
      } catch (e) {
        console.error("Failed to pull permissions from", { permUrl });
        throw e;
      }
    },
    async (req) => {
      const room = req.getParameter(0);
      const headerWsProtocol = req.getHeader("sec-websocket-protocol");
      const [, , token] = /(^|,)token-(((?!,).)*)/.exec(headerWsProtocol) ?? [
        null,
        null,
        req.getQuery("token"),
      ];
      if (token == null) {
        throw new Error("Missing Token");
      }
      try {
        const response = await fetch(
          `http://backend:7001/api/rendersource/token/${token}`
        );

        if (response.ok) {
          const renderSource = await response.json();
          if (renderSource.overlayId == parseInt(room)) {
            return { room: room, renderSourceId: renderSource.renderSourceId };
          } else {
            throw new Error("Forbidden");
          }
        } else {
          throw new Error("Invalid Token");
        }
      } catch (e) {
        console.error("Failed to pull renderSource");
        throw e;
      }
    },
    { redisPrefix, initDocCallback }
  );

  await promise.create((resolve, reject) => {
    app.listen(port, (token) => {
      if (token) {
        logging.print(logging.GREEN, "[y-redis] Listening to port ", port);
        resolve();
      } else {
        const err = error.create("[y-redis] Failed to lisen to port " + port);
        reject(err);
        throw err;
      }
    });
  });
  return new YWebsocketServer(app);
};
