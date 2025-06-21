const supertokens = require("supertokens-node");
const Session = require("supertokens-node/recipe/session");
const EmailPassword = require("supertokens-node/recipe/emailpassword");

function initSuperTokens() {
  supertokens.init({
    framework: "express",
    supertokens: {
      connectionURI: "http://184.174.36.51:3567",
      // apiKey: <YOUR_API_KEY>
    },
    appInfo: {
      appName: "MyApp",
      apiDomain: "http://localhost:3000",
      websiteDomain: "http://localhost:4200",
    },
    recipeList: [
      EmailPassword.init(), // initializes signin / sign up features
      Session.init(), // initializes session features
    ],
  });
}

module.exports = { initSuperTokens };
