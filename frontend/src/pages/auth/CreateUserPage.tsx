import { Button } from "@/components/shadcn/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { setUsername } from "@/services/AuthService";
import { useAuthStore } from "@/store/auth";
import { GalleryVerticalEnd } from "lucide-react";
import { useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

const CreateUserPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore().user;

  useEffect(() => {
    const checkSession = async () => {
      if (user) {
        navigate("/");
      }
    };
    checkSession();
  });

  const handleSetUsername = (e: FormEvent) => {
    e.preventDefault();
    const username = (document.getElementById("username") as HTMLInputElement)
      .value;
    setUsername(username);
  };

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
          <form onSubmit={handleSetUsername}>
            <Card className="w-full max-w-sm">
              <CardHeader>
                <CardTitle>Set Username</CardTitle>
                <CardDescription>Enter your Username below</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="username"
                      placeholder="Username"
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-2">
                <Button type="submit" className="w-full">
                  Set Username
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateUserPage;
