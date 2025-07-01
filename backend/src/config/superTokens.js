import supertokens from "supertokens-node";
import Session from "supertokens-node/recipe/session";
import EmailPassword from "supertokens-node/recipe/emailpassword";
import ThirdParty from "supertokens-node/recipe/thirdparty";
import Dashboard from "supertokens-node/recipe/dashboard";

export function initSuperTokens() {
  supertokens.init({
    framework: "express",
    supertokens: {
      connectionURI: process.env.SUPERTOKENS_URL,
      // apiKey: <YOUR_API_KEY>
    },
    appInfo: {
      appName: "OpenOverlay",
      apiDomain: process.env.API_URL,
      websiteDomain: process.env.FRONTEND_URL,
      apiBasePath: "/auth",
    },
    recipeList: [
      ThirdParty.init({
        signInAndUpFeature: {
          providers: [
            {
              config: {
                thirdPartyId: "google",
                clients: [
                  {
                    clientId:
                      "1060725074195-kmeum4crr01uirfl2op9kd5acmi9jutn.apps.googleusercontent.com",
                    clientSecret: "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",
                  },
                ],
              },
            },
          ],
        },
        disableMFA: true,
      }),
      EmailPassword.init(), // initializes signin / sign up features
      Session.init({ cookieSecure: true }), // initializes session features
      Dashboard.init(),
    ],
  });
}
