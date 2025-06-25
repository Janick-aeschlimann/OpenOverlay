import { Route, Routes, useNavigate } from "react-router-dom";
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
import { getUser } from "./services/AuthService";
import CreateUserPage from "./pages/auth/CreateUserPage";

function App() {
  const user = useAuthStore().user;
  const navigate = useNavigate();

  const initSuperTokens = () => {
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
            const action = event.action;
            console.log(action);
            switch (action) {
              case "SESSION_CREATED": {
                const user = await getUser(() => {
                  navigate("/auth/user/create");
                });
                if (user) {
                  navigate("/");
                }
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
  };

  initSuperTokens();

  useEffect(() => {
    if (!user) {
      getUser(() => {
        navigate("/auth/user/create");
      });
    }
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
            <Route
              path="/auth/user/create"
              element={
                <ProtectedRoute>
                  <CreateUserPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </ThemeProvider>
    </>
  );
}

export default App;
