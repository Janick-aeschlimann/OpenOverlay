import { useEffect, useRef, useState } from "react";
import { Button } from "./shadcn/ui/button";
import { useAuthStore } from "@/store/auth";
import { MousePointer2, Plus } from "lucide-react";
import { useParams } from "react-router-dom";
import CanvasObjectComponent from "./CanvasObject";
import type { YMap } from "node_modules/yjs/dist/src/types/YMap";
import { useCanvasStore } from "@/store/canvas";
import { CanvasSync } from "@/lib/yjsSync";
import type { CanvasObject } from "@/types/types";

const Canvas: React.FC = () => {
  const [count, setCount] = useState(0);

  const {
    canvasObjects,
    updateCanvasObject,
    addCanvasObject,
    deleteCanvasObject,
  } = useCanvasStore();

  const [clients, setClients] = useState<any[]>([]);
  const user = useAuthStore().user;

  const [error, setError] = useState<string | null>(null);

  const ymapRef = useRef<YMap<unknown>>(null);
  const canvasSyncRef = useRef<CanvasSync>(null);

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

  const throttle = <T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): T => {
    let lastCall = 0;
    return function (...args: Parameters<T>) {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    } as T;
  };

  const updateCursor = (event: PointerEvent) => {
    canvasSyncRef.current?.provider.awareness.setLocalStateField("cursor", {
      x: event.clientX,
      y: event.clientY,
    });
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

      document.addEventListener("pointermove", throttle(updateCursor, 0));

      awareness.on("change", () => {
        const states = Array.from(awareness.getStates().entries());
        setClients(
          states
            .filter(([clientId]) => clientId != awareness.clientID)
            .map((c) => c[1])
        );
      });

      const ymap = canvasSync.ydoc.getMap("counter");
      ymapRef.current = ymap;

      const updateCount = () => {
        setCount(ymap.get("value") as number);
      };

      ymap.observe(updateCount);
      updateCount();

      document.addEventListener("keydown", (event: KeyboardEvent) => {
        console.log(event);
        if (event.code == "Delete") {
          const state = useCanvasStore.getState();
          if (state.selectedCanvasObjectId) {
            deleteCanvasObject(canvasSync, state.selectedCanvasObjectId);
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

  const increment = () => {
    const ymap = ymapRef.current;
    ymap?.set("value", ((ymap?.get("value") as number) || 0) + 1);
  };

  return (
    <>
      <div className="h-full flex flex-col gap-2 items-center justify-center overflow-hidden select-none">
        <Button onClick={increment}>Increment</Button>
        <p>Count: {count}</p>
        {error ? <p className="text-red-500">{error}</p> : null}
        {clients.map((client, index) => (
          <div
            key={index}
            className="absolute z-50"
            style={{ left: client.cursor?.x || 0, top: client.cursor?.y || 0 }}
          >
            <MousePointer2
              style={{ fill: client.user?.color, color: client.user?.color }}
            />
            <p style={{ color: client.user?.color }}>{client.user?.username}</p>
          </div>
        ))}
        {canvasObjects.map((object) => (
          <CanvasObjectComponent
            key={object.id}
            object={object}
            setCanvasObject={(object: CanvasObject) => {
              if (canvasSyncRef.current) {
                updateCanvasObject(canvasSyncRef.current, object);
              }
            }}
          ></CanvasObjectComponent>
        ))}
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
      </div>
    </>
  );
};

export default Canvas;
