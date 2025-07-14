import { Button } from "@/components/shadcn/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { Textarea } from "@/components/shadcn/ui/textarea";
import { PostAPI } from "@/services/RequestService";
import { useWorkspaceStore } from "@/store/workspace";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

const CreateOverlay: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<null | string>(null);
  const { activeWorkspace } = useWorkspaceStore();

  const CreateOverlay = async (e: FormEvent) => {
    e.preventDefault();
    const name = (document.getElementById("name") as HTMLInputElement).value;
    const description = (
      document.getElementById("description") as HTMLInputElement
    ).value;

    const body = {
      name: name,
      description: description,
    };
    if (activeWorkspace) {
      const response = await PostAPI(
        `/workspace/${activeWorkspace.workspaceId}/overlay/create`,
        body
      );
      if (response.success) {
        navigate(-1);
      } else {
        setError(response.error);
      }
    }
  };

  return (
    <>
      <div className="bg-muted flex h-full flex-col items-center justify-center">
        <form onSubmit={CreateOverlay} onChange={() => setError(null)}>
          <Card className="w-xl">
            <CardHeader>
              <CardTitle>Create Overlay</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  required
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="off"
                  placeholder="new Workspace"
                ></Input>
              </div>
              <div className="flex flex-row gap-2 w-full">
                <div className="flex flex-col gap-2 flex-1">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description"></Textarea>
                </div>
              </div>
              {error && <span>{error}</span>}
            </CardContent>
            <CardFooter className="flex flex-row gap-2">
              <Button type="submit" className="cursor-pointer">
                Create
              </Button>
              <Button
                className="cursor-pointer"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Go Back
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </>
  );
};

export default CreateOverlay;
