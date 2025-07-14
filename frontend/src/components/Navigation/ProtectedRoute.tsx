import { useAuthStore } from "@/store/auth";
import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";

export interface IProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<IProtectedRouteProps> = (props) => {
  const { isLoading, isLoggedIn } = useAuthStore();

  if (isLoading) {
    return <></>;
  }
  return <>{isLoggedIn ? <>{props.children}</> : <Navigate to={"/login"} />}</>;
};

export default ProtectedRoute;
