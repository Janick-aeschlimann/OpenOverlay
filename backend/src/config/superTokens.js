const supertokens = require("supertokens-node");
const Session = require("supertokens-node/recipe/session");
const EmailPassword = require("supertokens-node/recipe/emailpassword");
const ThirdParty = require("supertokens-node/recipe/thirdparty");

function initSuperTokens() {
  supertokens.init({
    framework: "express",
    supertokens: {
      connectionURI: "http://184.174.36.51:3567",
      // apiKey: <YOUR_API_KEY>
    },
    appInfo: {
      appName: "OpenOverlay",
      apiDomain: "http://localhost:3000",
      websiteDomain: "http://localhost:3001",
      apiBasePath: "/auth",
      websiteBasePath: "/auth",
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
      Session.init(), // initializes session features
    ],
  });
}

module.exports = { initSuperTokens };
