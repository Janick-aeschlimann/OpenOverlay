import OverlaySelectionDropdown from "@/components/OverlaySelectionDropdown";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { GetAPI, PatchAPI } from "@/services/RequestService";
import type { RenderSource } from "@/types/types";
import { Label } from "@radix-ui/react-label";
import { Check, Pen } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { create } from "zustand";

const useRenderSourceStore = create<{
  renderSource: RenderSource | null;
  setRenderSource: (renderSource: RenderSource) => void;
  updateRenderSource: (renderSource: Partial<RenderSource>) => void;
}>((set) => ({
  renderSource: null,
  setRenderSource: (renderSource) => set({ renderSource: renderSource }),
  updateRenderSource: async (renderSource) =>
    set((state) => ({
      renderSource: state.renderSource
        ? { ...state.renderSource, ...renderSource }
        : null,
    })),
}));

const EditRenderSource: React.FC = () => {
  const renderSourceId = useParams().renderSourceId;

  const { renderSource, setRenderSource, updateRenderSource } =
    useRenderSourceStore();
  const [newOverlayId, setNewOverlayId] = useState<number | null>(null);
  const [nameEditing, setNameEditing] = useState(false);

  const navigate = useNavigate();

  const update = async (renderSource: Partial<RenderSource>) => {
    const response = await PatchAPI(
      `/rendersource/${renderSourceId}`,
      renderSource
    );
    if (response.success) {
      console.log("success");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await GetAPI(`/rendersource/${renderSourceId}`);
      if (response.success) {
        console.log(response.data);
        setRenderSource(response.data);
        setNewOverlayId(response.data.overlayId);
      } else {
        navigate(-1);
      }
    };
    fetchData();
  }, [renderSourceId]);

  return (
    <>
      <div className="h-full flex items-center justify-center flex-col">
        <div className="w-[80%] h-[70%] flex flex-col gap-5">
          <div className="flex flex-row items-center gap-2">
            {nameEditing ? (
              <>
                <Input
                  className="w-min"
                  value={renderSource?.name}
                  onChange={(event) => {
                    if (renderSource) {
                      updateRenderSource({ name: event.target.value });
                    }
                  }}
                />
                <Button
                  className="cursor-pointer"
                  size={"icon"}
                  variant={"outline"}
                  onClick={() => {
                    if (renderSource?.name) {
                      setNameEditing(false);
                      update({ name: renderSource.name });
                    }
                  }}
                >
                  <Check />
                </Button>
              </>
            ) : (
              <>
                <h1 className="font-semibold text-xl">
                  {renderSource?.name || ""}
                </h1>
                <Pen
                  onClick={() => setNameEditing(true)}
                  className="w-5 h-5 hover:fill-white cursor-pointer"
                />
              </>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              value={`${window.location.origin}/render/${renderSource?.token}`}
              readOnly
            />
          </div>
          <div className="flex flex-row gap-5 items-end">
            <div className="flex flex-col gap-2 mb-10 mr-23">
              <h1 className="text-lg font-semibold">Canvas</h1>
              <div
                className="relative h-[200px]"
                style={{
                  width: Math.min(
                    600,
                    ((renderSource?.width || 1920) /
                      (renderSource?.height || 1080)) *
                      200
                  ),
                }}
              >
                <div className="flex items-center justify-center w-full h-full bg-[#202020] border-neutral-700 border-1 rounded-md shadow-[0px_0px_40px_10px_rgba(0,_0,_0,_0.2)]">
                  <div className="flex flex-row justify-center gap-2 items-center absolute w-full">
                    <Label htmlFor="width">Framerate</Label>
                    <Input
                      value={renderSource?.frameRate}
                      onChange={(event) =>
                        updateRenderSource({
                          frameRate: parseInt(event.target.value),
                        })
                      }
                      id="framerate"
                      type="number"
                      className="w-20"
                    />
                  </div>
                </div>
                <div className="flex flex-row justify-center gap-2 items-center absolute -bottom-12 w-full">
                  <Label htmlFor="width">Width</Label>
                  <Input
                    value={renderSource?.width}
                    onChange={(event) =>
                      updateRenderSource({
                        width: parseInt(event.target.value),
                      })
                    }
                    id="width"
                    type="number"
                    className="w-20"
                  />
                </div>
                <div className="flex flex-col justify-center gap-2 items-center absolute top-0 -right-23 h-full">
                  <Label htmlFor="height">Height</Label>
                  <Input
                    onChange={(event) =>
                      updateRenderSource({
                        height: parseInt(event.target.value),
                      })
                    }
                    value={renderSource?.height}
                    id="height"
                    type="number"
                    className="w-20"
                  />
                </div>
              </div>
            </div>
            <Button
              className="cursor-pointer"
              onClick={() => {
                if (renderSource) {
                  update({
                    width: renderSource.width,
                    height: renderSource.height,
                    frameRate: renderSource.frameRate,
                  });
                }
              }}
            >
              Update
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-lg font-semibold">Transition</h1>
            <div className="flex flex-row justify-between items-center gap-4">
              <div className="flex flex-col gap-1">
                <p>Current</p>
                <OverlaySelectionDropdown
                  value={renderSource?.overlayId}
                  disabled
                />
              </div>
              <div className=" w-full border-t-2 border-white mt-7"></div>
              <div className="flex flex-col gap-1">
                <p>New</p>
                <OverlaySelectionDropdown
                  value={newOverlayId}
                  onChange={(overlayId) => {
                    setNewOverlayId(overlayId);
                  }}
                />
              </div>
            </div>
            <div className="flex flex-row justify-center">
              <Button
                className="cursor-pointer"
                disabled={renderSource?.overlayId == newOverlayId}
                onClick={() => update({ overlayId: newOverlayId })}
              >
                Transition
              </Button>{" "}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditRenderSource;
