import SuperTokens from "supertokens-web-js";
import Session from "supertokens-web-js/recipe/session";
import EmailPassword from "supertokens-web-js/recipe/emailpassword";
import ThirdParty from "supertokens-web-js/recipe/thirdparty";

export const initSuperTokens = () => {
  SuperTokens.init({
    appInfo: {
      appName: "OpenOverlay",
      apiDomain: import.meta.env.VITE_API_URL,
      apiBasePath: "/auth",
    },
    recipeList: [ThirdParty.init(), EmailPassword.init(), Session.init()],
  });
};
