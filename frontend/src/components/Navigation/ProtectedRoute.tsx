import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import Session from "supertokens-web-js/recipe/session";

export interface IProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<IProtectedRouteProps> = (props) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const sessionExists = await Session.doesSessionExist();
      setIsAuthenticated(sessionExists);
    };
    checkSession();
  }, []);

  if (isAuthenticated == null) {
    return <></>;
  }
  return (
    <>{isAuthenticated ? <>{props.children}</> : <Navigate to={"/login"} />}</>
  );
};

export default ProtectedRoute;
