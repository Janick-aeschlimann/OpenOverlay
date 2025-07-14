import { useAuthStore } from "@/store/auth";
import { useEffect, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export interface IAuthWrapperProps {
  children: ReactNode;
}

const AuthWrapper: React.FC<IAuthWrapperProps> = (props) => {
  const { loadUserProfile, isLoading, isLoggedIn, user } = useAuthStore();

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    if (
      !isLoading &&
      isLoggedIn &&
      user === null &&
      location.pathname !== "/auth/user/create"
    ) {
      navigate("/auth/user/create");
    }
  }, [isLoading, user]);

  return props.children;
};

export default AuthWrapper;
