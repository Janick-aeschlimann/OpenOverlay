import { useEffect, useRef, useState } from "react";
import { Button } from "../shadcn/ui/button";
import { useAuthStore } from "@/store/auth";
import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import CanvasObjectComponent from "@/components/Canvas/CanvasObject";
import { useCanvasStore } from "@/store/canvas";
import { CanvasSync } from "@/lib/yjsSync";
import type { CanvasObject } from "@/types/types";
import CanvasClient from "@/components/Canvas/CanvasClient";

const Canvas: React.FC = () => {
  const {
    canvasObjects,
    canvasTransform,
    updateCanvasObject,
    addCanvasObject,
    deleteCanvasObject,
    setCanvasTransform,
  } = useCanvasStore();
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const [clients, setClients] = useState<any[]>([]);
  const user = useAuthStore().user;

  const [error, setError] = useState<string | null>(null);

  const canvasSyncRef = useRef<CanvasSync>(null);

  const navigate = useNavigate();
  const canvasId = useParams().id;

  const userColors = [
    "#FF4C4C", // Vivid Red
    "#FF9F1C", // Orange
    "#FFD23F", // Bright Yellow
    "#3DFA7E", // Neon Green
    "#2EC4B6", // Aqua Teal
    "#00CFFF", // Cyan
    "#4F9DFF", // Sky Blue
    "#845EC2", // Soft Purple
    "#D65DB1", // Pink-Magenta
    "#FF6F91", // Watermelon Pink
    "#FF3CAC", // Hot Pink
    "#F5A623", // Warm Amber
    "#00FFAB", // Mint Neon
  ];

  // Function to get a random color
  const getRandomColor = () => {
    const index = Math.floor(Math.random() * userColors.length);
    return userColors[index];
  };

  useEffect(() => {
    const connect = async () => {
      const canvasSync = await CanvasSync.create(canvasId || "1");
      canvasSync.syncToLocal();
      canvasSyncRef.current = canvasSync;

      const provider = canvasSync.provider;

      provider.ws?.addEventListener("close", (event: any) => {
        if (event.code == 403) {
          setError(event.code + " " + event.reason);
          provider.shouldConnect = false;
        }
      });

      const awareness = provider.awareness;

      awareness.on("change", () => {
        const states = Array.from(awareness.getStates().entries());
        setClients(
          states
            .filter(([clientId]) => clientId != awareness.clientID)
            .map((c) => c[1])
        );
      });

      document.addEventListener("keydown", (event: KeyboardEvent) => {
        if (event.code == "Delete") {
          const state = useCanvasStore.getState();
          if (state.selectedCanvasObjectId) {
            deleteCanvasObject(canvasSync, state.selectedCanvasObjectId);
            canvasSync.undoManager.stopCapturing();
          }
        }
        console.log(event);
        if ((event.key == "z" || event.key == "Z") && event.ctrlKey) {
          if (event.shiftKey) {
            canvasSync.undoManager.redo();
          } else {
            canvasSync.undoManager.undo();
          }
        }
      });
    };

    connect();

    return () => {
      canvasSyncRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    canvasSyncRef.current?.provider.awareness.setLocalStateField("user", {
      userId: user?.userId,
      username: user?.username,
      color: getRandomColor(),
    });
  }, [user]);

  const handleMouseMove = (event: MouseEvent) => {
    if (lastPos.current) {
      const transform = useCanvasStore.getState().canvasTransform;

      const dx = lastPos.current.x - event.clientX;
      const dy = lastPos.current.y - event.clientY;

      const offsetX = transform.offsetX - dx;
      const offsetY = transform.offsetY - dy;

      setCanvasTransform(canvasSyncRef.current, {
        ...transform,
        offsetX: offsetX,
        offsetY: offsetY,
        isDragging: true,
      });
      lastPos.current = { x: event.clientX, y: event.clientY };
    }
  };

  const handleMouseUp = () => {
    const canvas = document.getElementById("canvas");
    canvas?.removeEventListener("pointermove", handleMouseMove);
    canvas?.removeEventListener("pointerup", handleMouseUp);

    const transform = useCanvasStore.getState().canvasTransform;

    setCanvasTransform(canvasSyncRef.current, {
      ...transform,
      isDragging: false,
    });
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    const canvas = document.getElementById("canvas");
    if (event.button == 1 && canvas) {
      lastPos.current = { x: event.clientX, y: event.clientY };
      canvas.addEventListener("pointermove", handleMouseMove);
      canvas.addEventListener("pointerup", handleMouseUp);
    }
  };

  const handleMouseWheel = (event: React.WheelEvent) => {
    const transform = useCanvasStore.getState().canvasTransform;

    const scaleFactor = 1.1;
    const scale =
      event.deltaY < 0
        ? transform.scale * scaleFactor
        : transform.scale / scaleFactor;

    const { screenX, screenY } = mouseToScreen(event.clientX, event.clientY);

    const worldX = (screenX - transform.offsetX) / transform.scale;
    const worldY = (screenY - transform.offsetY) / transform.scale;

    console.log("oldWorld: " + worldX + ", " + worldY);

    const offsetX = screenX - worldX * scale;
    const offsetY = screenY - worldY * scale;

    setCanvasTransform(canvasSyncRef.current, {
      ...transform,
      scale: scale,
      offsetX: offsetX,
      offsetY: offsetY,
    });
  };

  const screenToWorld = (screenX: number, screenY: number) => {
    const transform = useCanvasStore.getState().canvasTransform;

    const worldX = (screenX - transform.offsetX) / transform.scale;
    const worldY = (screenY - transform.offsetY) / transform.scale;

    return { worldX: worldX, worldY: worldY };
  };

  const mouseToScreen = (x: number, y: number) => {
    const canvas = document.getElementById("canvas");

    if (canvas) {
      const rect = canvas.getBoundingClientRect();

      const screenX = x - rect.left;
      const screenY = y - rect.top;

      return { screenX: screenX, screenY: screenY };
    } else {
      return { screenX: x, screenY: y };
    }
  };

  const mouseToWorld = (x: number, y: number) => {
    const { screenX, screenY } = mouseToScreen(x, y);
    const { worldX, worldY } = screenToWorld(screenX, screenY);
    return { worldX: worldX, worldY: worldY };
  };

  const updateCursorMove = (event: React.PointerEvent) => {
    const transform = useCanvasStore.getState().canvasTransform;

    const { worldX, worldY } = mouseToWorld(event.clientX, event.clientY);

    setCanvasTransform(canvasSyncRef.current, {
      ...transform,
      mouseX: worldX,
      mouseY: worldY,
    });
  };

  return (
    <>
      <div className="h-full flex flex-col gap-2 items-center justify-center overflow-hidden select-none">
        {error ? <p className="text-red-500">{error}</p> : null}

        <div
          id="canvas"
          className="bg-neutral-800 rounded-xl overflow-hidden relative"
          style={{
            cursor: canvasTransform.isDragging ? "grab" : "default",
            width: "calc(100% - 50px)",
            height: "calc(100% - 150px)",
          }}
          onPointerDown={handleMouseDown}
          onPointerMove={updateCursorMove}
          onWheel={handleMouseWheel}
        >
          {clients.map((client, index) => {
            if (client.user && client.cursor) {
              return (
                <CanvasClient
                  key={index}
                  cursor={client.cursor}
                  user={client.user}
                  canvasTransform={canvasTransform}
                ></CanvasClient>
              );
            }
          })}
          {canvasObjects.map((object) => (
            <CanvasObjectComponent
              key={object.id}
              object={object}
              canvasTransform={canvasTransform}
              setCanvasObject={(object: CanvasObject) => {
                if (canvasSyncRef.current) {
                  updateCanvasObject(canvasSyncRef.current, object);
                }
              }}
              undoManager={canvasSyncRef.current?.undoManager}
            ></CanvasObjectComponent>
          ))}
          <div className="absolute left-2 bottom-1 flex flex-row gap-5 text-neutral-300 font-semibold">
            <span>
              Mouse: {Math.round(canvasTransform.mouseX)} /{" "}
              {Math.round(canvasTransform.mouseY)}
            </span>
            <span>
              Offset: {Math.round(canvasTransform.offsetX)} /{" "}
              {Math.round(canvasTransform.offsetY)}
            </span>
            <span>Scale: {canvasTransform.scale.toFixed(2)}</span>
          </div>
        </div>
        <Button
          className="absolute top-3 right-3 cursor-pointer"
          size={"icon"}
          onClick={() => {
            if (canvasSyncRef.current) {
              addCanvasObject(canvasSyncRef.current);
            }
          }}
        >
          <Plus />
        </Button>
        <Button
          className="absolute top-3 left-3 cursor-pointer"
          size={"default"}
          onClick={() => {
            navigate(-1);
          }}
        >
          <ArrowLeft />
          Back
        </Button>
      </div>
    </>
  );
};

export default Canvas;
