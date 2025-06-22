import { Route, Routes } from "react-router-dom";
import Home from "./pages/HomePage";
import Navbar from "./components/Navbar";

import { ThemeProvider } from "./components/ThemeProvider";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import PageWrapper from "./components/PageWrapper";

import SuperTokens from "supertokens-web-js";
import Session from "supertokens-web-js/recipe/session";
import EmailPassword from "supertokens-web-js/recipe/emailpassword";
import ThirdParty from "supertokens-web-js/recipe/thirdparty";

SuperTokens.init({
  appInfo: {
    appName: "OpenOverlay",
    apiDomain: "http://localhost:3000",
    apiBasePath: "/auth",
  },
  recipeList: [ThirdParty.init(), EmailPassword.init(), Session.init()],
});

function App() {
  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Navbar />
        <PageWrapper>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
          </Routes>
        </PageWrapper>
      </ThemeProvider>
    </>
  );
}

export default App;
