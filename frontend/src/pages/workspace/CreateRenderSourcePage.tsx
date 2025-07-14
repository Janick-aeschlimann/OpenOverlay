import OverlaySelectionDropdown from "@/components/OverlaySelectionDropdown";
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
import { PostAPI } from "@/services/RequestService";
import { useWorkspaceStore } from "@/store/workspace";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

const CreateRenderSource: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<null | string>(null);
  const [overlayId, setOverlayId] = useState<null | number>(null);
  const { activeWorkspace } = useWorkspaceStore();

  const CreateRenderSource = async (e: FormEvent) => {
    e.preventDefault();
    const name = (document.getElementById("name") as HTMLInputElement).value;
    const width = (document.getElementById("width") as HTMLInputElement).value;
    const height = (document.getElementById("height") as HTMLInputElement)
      .value;
    const frameRate = (document.getElementById("framerate") as HTMLInputElement)
      .value;

    const body = {
      name: name,
      overlayId: overlayId,
      width: width,
      height: height,
      frameRate: frameRate,
    };
    if (activeWorkspace) {
      const response = await PostAPI(
        `/workspace/${activeWorkspace.workspaceId}/rendersource/create`,
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
        <form onSubmit={CreateRenderSource} onChange={() => setError(null)}>
          <Card className="w-xl">
            <CardHeader>
              <CardTitle>Create Render Source</CardTitle>
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
              <div className="flex flex-col gap-2">
                <Label>Overlay</Label>
                <OverlaySelectionDropdown
                  onChange={(overlayId) => setOverlayId(overlayId)}
                />
              </div>
              <div className="flex flex-row gap-2 w-full">
                <div className="flex flex-col gap-2 flex-1">
                  <Label htmlFor="width">Width</Label>
                  <Input
                    type="number"
                    id="width"
                    name="width"
                    defaultValue={1920}
                  ></Input>
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <Label htmlFor="height">Height</Label>
                  <Input
                    type="number"
                    id="height"
                    name="height"
                    defaultValue={1080}
                  ></Input>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="framerate">Framerate</Label>
                <Input
                  type="number"
                  id="framerate"
                  name="framerate"
                  defaultValue={60}
                ></Input>
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

export default CreateRenderSource;
