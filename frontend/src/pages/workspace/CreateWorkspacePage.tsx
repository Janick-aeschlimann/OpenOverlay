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
import SlugInput from "@/components/SlugInput";
import { PostAPI } from "@/services/RequestService";
import { useWorkspaceStore } from "@/store/workspace";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

const CreateWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [error, setError] = useState<null | string>(null);
  const { fetchWorkspaces } = useWorkspaceStore();

  const createWorkspace = async (e: FormEvent) => {
    e.preventDefault();
    const name = (document.getElementById("name") as HTMLInputElement).value;
    const slug = (document.getElementById("slug") as HTMLInputElement).value;
    const logo = null;

    const body = { name: name, slug: slug, logo: logo };
    const response = await PostAPI("/workspace/create", body);
    if (response.success) {
      fetchWorkspaces();
      navigate(`/workspace/${slug}`);
    } else {
      setError(response.error);
    }
  };

  return (
    <>
      <div className="bg-muted flex h-full flex-col items-center justify-center">
        <form onSubmit={createWorkspace} onChange={() => setError(null)}>
          <Card className="w-xl">
            <CardHeader>
              <CardTitle>Create Workspace</CardTitle>
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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                ></Input>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Slug</Label>
                <SlugInput name={name} id="slug"></SlugInput>
                <p className="text-red-500 pl-3">{error}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Logo</Label>
                <Input
                  type="file"
                  id="slug"
                  name="slug"
                  placeholder="new-workspace"
                ></Input>
              </div>
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

export default CreateWorkspace;
