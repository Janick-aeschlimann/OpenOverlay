import { SignUpForm } from "@/components/shadcn/signup-form";
import { GalleryVerticalEnd } from "lucide-react";

const SignUpPage: React.FC = () => {
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
          <SignUpForm />
        </div>
      </div>
    </>
  );
};

export default SignUpPage;
