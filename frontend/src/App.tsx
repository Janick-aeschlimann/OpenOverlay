import { Navigate, Route, Routes } from "react-router-dom";

import { ThemeProvider } from "./components/ThemeProvider";
import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignUpPage";

import Session from "supertokens-web-js/recipe/session";
import { useEffect } from "react";
import GoogleCallback from "./pages/auth/callback/GoogleCallback";
import DefaultWrapper from "./components/PageWrapper/DefaultWrapper";
import CreateUserPage from "./pages/auth/CreateUserPage";
import ProtectedRoute from "./components/Navigation/ProtectedRoute";
import Sidebar from "./components/Navigation/Sidebar";
import Dashboard from "./pages/main/DashboardPage";
import Workspaces from "./pages/main/WorkspacesPage";
import WorkspaceOverview from "./pages/workspace/WorkspaceOverviewPage";
import CreateWorkspace from "./pages/workspace/CreateWorkspacePage";
import OverlayEditor from "./pages/Editor/OverlayEditorPage";
import CreateRenderSource from "./pages/workspace/CreateRenderSourcePage";
import { useWorkspaceStore } from "./store/workspace";
import AuthWrapper from "./components/PageWrapper/AuthWrapper";
import CreateOverlay from "./pages/workspace/CreateOverlayPage";

function App() {
  const { fetchWorkspaces, setWorkspaceSlug, getLastWorkspace } =
    useWorkspaceStore();

  useEffect(() => {
    const initWorkspace = async () => {
      if (await Session.doesSessionExist()) {
        await fetchWorkspaces();
        if (location.pathname.startsWith("/workspace/")) {
          setWorkspaceSlug(location.pathname.split("/")[2]);
        } else {
          getLastWorkspace();
        }
      }
    };
    initWorkspace();
  }, []);

  return (
    <>
      <AuthWrapper>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <Routes>
            {/* NavbarWrapper */}
            <Route path="/" element={<Navigate to={"/dashboard"} />} />
            <Route
              path="/dashboard"
              element={
                <Sidebar title="Dashboard">
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                </Sidebar>
              }
            />
            <Route
              path="/workspaces"
              element={
                <Sidebar title="Workspaces">
                  <ProtectedRoute>
                    <Workspaces />
                  </ProtectedRoute>
                </Sidebar>
              }
            />
            <Route
              path="/workspace/:slug"
              element={
                <Sidebar title="Workspaces">
                  <ProtectedRoute>
                    <WorkspaceOverview />
                  </ProtectedRoute>
                </Sidebar>
              }
            />

            {/* DefaultWrapper */}
            <Route element={<DefaultWrapper />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route
                path="/auth/callback/google"
                element={<GoogleCallback />}
              />
              <Route
                path="/auth/user/create"
                element={
                  <ProtectedRoute>
                    <CreateUserPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workspace/new"
                element={
                  <ProtectedRoute>
                    <CreateWorkspace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workspace/:slug/rendersource/new"
                element={
                  <ProtectedRoute>
                    <CreateRenderSource />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workspace/:slug/overlay/new"
                element={
                  <ProtectedRoute>
                    <CreateOverlay />
                  </ProtectedRoute>
                }
              />
              <Route
                path="workspace/:slug/overlay/:id"
                element={
                  // <ProtectedRoute>
                  <OverlayEditor />
                  // </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </ThemeProvider>
      </AuthWrapper>
    </>
  );
}

export default App;
