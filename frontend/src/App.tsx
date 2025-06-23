import { Route, Routes } from "react-router-dom";
import Home from "./pages/HomePage";

import { ThemeProvider } from "./components/ThemeProvider";
import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignUpPage";
import NavbarWrapper from "./components/PageWrapper/NavbarWrapper";

import SuperTokens from "supertokens-web-js";
import Session from "supertokens-web-js/recipe/session";
import EmailPassword from "supertokens-web-js/recipe/emailpassword";
import ThirdParty from "supertokens-web-js/recipe/thirdparty";

import { useAuthStore } from "@/store/auth";
import { useEffect } from "react";
import GoogleCallback from "./pages/auth/callback/GoogleCallback";
import DefaultWrapper from "./components/PageWrapper/DefaultWrapper";
import ProtectedRoute from "./components/ProtectedRoute";

SuperTokens.init({
  appInfo: {
    appName: "OpenOverlay",
    apiDomain: "http://localhost:3000",
    apiBasePath: "/auth",
  },
  recipeList: [
    ThirdParty.init(),
    EmailPassword.init(),
    Session.init({
      onHandleEvent: async (event) => {
        console.log(event);
        const action = event.action;

        switch (action) {
          case "SESSION_CREATED": {
            const userId = await Session.getUserId();
            console.log(userId);
            useAuthStore.getState().setAuth(userId);
            break;
          }
          case "SIGN_OUT": {
            useAuthStore.getState().clearAuth();
            break;
          }
        }
      },
    }),
  ],
});

function App() {
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    const getUser = async () => {
      if (await Session.doesSessionExist()) {
        const userId = await Session.getUserId();
        setAuth(userId);
      }
    };
    getUser();
  }, []);

  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Routes>
          {/* NavbarWrapper */}
          <Route element={<NavbarWrapper />}>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
          </Route>
          {/* DefaultWrapper */}
          <Route element={<DefaultWrapper />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/auth/callback/google" element={<GoogleCallback />} />
          </Route>
        </Routes>
      </ThemeProvider>
    </>
  );
}

export default App;
