import { GalleryVerticalEnd } from "lucide-react";
import { LoginForm } from "@/components/shadcn/login-form";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Session from "supertokens-web-js/recipe/session";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      if (await Session.doesSessionExist()) {
        navigate("/");
      }
    };
    checkSession();
  }, []);

  return (
    <>
      <div className="bg-muted flex h-full flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <a
            href="#"
            className="flex items-center gap-2 self-center font-medium"
          >
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            OpenOverlay
          </a>
          <LoginForm />
        </div>
      </div>
    </>
  );
};

export default LoginPage;
