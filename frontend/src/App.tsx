import { Route, Routes } from "react-router-dom";
import Home from "./pages/HomePage";
import Navbar from "./components/Navbar";

import SuperTokens, { SuperTokensWrapper } from "supertokens-auth-react";
import EmailPassword from "supertokens-auth-react/recipe/emailpassword";
import Session, { SessionAuth } from "supertokens-auth-react/recipe/session";

import { getSuperTokensRoutesForReactRouterDom } from "supertokens-auth-react/ui";
import { EmailPasswordPreBuiltUI } from "supertokens-auth-react/recipe/emailpassword/prebuiltui";
import * as reactRouterDom from "react-router-dom";
import ThirdParty, { Google } from "supertokens-auth-react/recipe/thirdparty";
import { ThirdPartyPreBuiltUI } from "supertokens-auth-react/recipe/thirdparty/prebuiltui";
import { ThemeProvider } from "./components/ThemeProvider";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";

SuperTokens.init({
  appInfo: {
    // learn more about this on https://supertokens.com/docs/references/frontend-sdks/reference#sdk-configuration
    appName: "OpenOverlay",
    apiDomain: "http://localhost:3000",
    websiteDomain: "http://localhost:3001",
    apiBasePath: "/auth",
    websiteBasePath: "/auth",
  },
  recipeList: [
    ThirdParty.init({
      signInAndUpFeature: {
        providers: [Google.init()],
      },
    }),
    EmailPassword.init(),
    Session.init(),
  ],
});

function App() {
  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <SuperTokensWrapper>
          <h1>OpenOverlay</h1>
          <Navbar />
          <Routes>
            {getSuperTokensRoutesForReactRouterDom(reactRouterDom, [
              EmailPasswordPreBuiltUI,
              ThirdPartyPreBuiltUI,
            ])}
            <Route
              path="/"
              element={
                <SessionAuth>
                  <Home />
                </SessionAuth>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
          </Routes>
        </SuperTokensWrapper>
      </ThemeProvider>
    </>
  );
}

export default App;
