import { Label } from "@radix-ui/react-label";
import { Separator } from "../shadcn/ui/separator";
import { Input } from "../shadcn/ui/input";
import { useCanvasStore } from "@/store/canvas";
import { useEffect, useState } from "react";
import { type CanvasObject } from "@/types/types";
import { cn } from "@/lib/utils";
import { componentRegistry } from "./Components/ComponentRegistry";

export interface IPropertiesProps {
  overlayId: number;
}

const Properties: React.FC<IPropertiesProps> = (props) => {
  const {
    selectedCanvasObjectId,
    canvasObjects,
    updateCanvasObject,
    updateCanvasObjectProps,
  } = useCanvasStore(props.overlayId);

  const [canvasObject, setCanvasObject] = useState<CanvasObject | null>(null);

  useEffect(() => {
    const object = canvasObjects.find(
      (object) => object.id == selectedCanvasObjectId
    );
    setCanvasObject(object ?? null);
  }, [selectedCanvasObjectId, canvasObjects]);

  return (
    <>
      <div
        className={cn(
          "absolute w-100 h-full flex flex-row py-10 transition-all duration-500",
          selectedCanvasObjectId ? "right-10 ease-out" : "-right-full ease-in"
        )}
      >
        <div className="w-full h-full rounded-[16px] border-2 border-[#505050] bg-[#1e1e1ebb] backdrop-blur-xl z-50 flex flex-col items-start justify-start gap-3 p-5 shadow-[0px_0px_30px_10px_rgba(0,_0,_0,_0.25)]">
          <h1 className="text-2xl font-semibold">Inspector</h1>
          <Separator className="border-1" />
          {canvasObject && (
            <>
              <div className="bg-background p-4 rounded-xl">
                <h1 className="text-lg font-medium">Transform</h1>
                <div className="flex flex-col gap-3 pl-5">
                  <div className="flex flex-col gap-1">
                    <Label>Position</Label>
                    <div className="flex flex-row items-center gap-2">
                      <Label>x</Label>
                      <Input
                        id="x"
                        type="number"
                        placeholder="x"
                        value={canvasObject?.x}
                        onChange={(e) =>
                          updateCanvasObject(canvasObject.id, {
                            x: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                      <Label>y</Label>
                      <Input
                        id="y"
                        type="number"
                        placeholder="y"
                        value={canvasObject?.y}
                        onChange={(e) =>
                          updateCanvasObject(canvasObject.id, {
                            y: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label>Scale</Label>
                    <div className="flex flex-row items-center gap-2">
                      <Label>width</Label>
                      <Input
                        type="number"
                        id="width"
                        placeholder="width"
                        value={canvasObject?.width}
                        onChange={(e) =>
                          updateCanvasObject(canvasObject.id, {
                            width: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                      <Label>height</Label>
                      <Input
                        type="number"
                        id="height"
                        placeholder="height"
                        value={canvasObject?.height}
                        onChange={(e) =>
                          updateCanvasObject(canvasObject.id, {
                            height: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-background p-4 rounded-xl w-full">
                <h1 className="text-lg font-medium">Properties</h1>
                <div className="flex flex-col gap-2 pt-2">
                  {canvasObject &&
                    (() => {
                      const Editor =
                        componentRegistry[canvasObject.type]?.editor;
                      return (
                        <Editor
                          props={canvasObject.props}
                          onChange={(newProps) => {
                            updateCanvasObjectProps(canvasObject.id, newProps);
                          }}
                        />
                      );
                    })()}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Properties;
