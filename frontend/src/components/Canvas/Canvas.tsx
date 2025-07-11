import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth";
import { useParams } from "react-router-dom";
import CanvasObjectComponent from "@/components/Canvas/CanvasObject";
import { getCanvasStore, useCanvasStore } from "@/store/canvas";
import type { CanvasDraft, CanvasObject } from "@/types/types";
import CanvasClient from "@/components/Canvas/CanvasClient";
import { cn } from "@/lib/utils";
import CanvasDraftComponent from "./CanvasDraft";

export interface ICanvasProps {
  className?: string;
}

const Canvas: React.FC<ICanvasProps> = (props) => {
  const overlayId = parseInt(useParams().id!);

  const {
    connection,
    canvas,
    canvasObjects,
    canvasTransform,
    presence,
    canvasDraft,
    clients,
    connectYjs,
    updateCanvasObject,
    addCanvasObject,
    deleteCanvasObject,
    setCanvasTransform,
    setTool,
    setCanvasDraft,
    setPresence,
  } = useCanvasStore(overlayId);

  const canvasStore = getCanvasStore(overlayId);

  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const user = useAuthStore().user;

  useEffect(() => {
    const connect = async () => {
      const canvasSync = await connectYjs(overlayId);

      document.addEventListener("keydown", (event: KeyboardEvent) => {
        if (event.code == "Delete") {
          const state = canvasStore.getState();
          if (state.selectedCanvasObjectId) {
            deleteCanvasObject(state.selectedCanvasObjectId);
            canvasSync.undoManager.stopCapturing();
          }
        }
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
      const connection = canvasStore.getState().connection;
      connection.canvasSync?.destroy();
    };
  }, []);

  useEffect(() => {
    const state = canvasStore.getState();
    state.connection.canvasSync?.provider.awareness.setLocalStateField("user", {
      userId: user?.userId,
      username: user?.username,
      color: state.presence.color,
    });
  }, [user]);

  const handleMouseMove = (event: MouseEvent) => {
    if (lastPos.current) {
      const transform = canvasStore.getState().canvasTransform;

      const dx = lastPos.current.x - event.clientX;
      const dy = lastPos.current.y - event.clientY;

      const offsetX = transform.offsetX - dx;
      const offsetY = transform.offsetY - dy;

      setCanvasTransform({
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

    const transform = getCanvasStore(overlayId).getState().canvasTransform;

    setCanvasTransform({
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
    const transform = canvasStore.getState().canvasTransform;

    const scaleFactor = 1.1;
    const scale = Math.max(
      Math.min(
        event.deltaY < 0
          ? transform.scale * scaleFactor
          : transform.scale / scaleFactor,
        3
      ),
      0.1
    );

    const { screenX, screenY } = mouseToScreen(event.clientX, event.clientY);

    const worldX = (screenX - transform.offsetX) / transform.scale;
    const worldY = (screenY - transform.offsetY) / transform.scale;

    const offsetX = screenX - worldX * scale;
    const offsetY = screenY - worldY * scale;

    setCanvasTransform({
      ...transform,
      scale: scale,
      offsetX: offsetX,
      offsetY: offsetY,
    });
  };

  const screenToWorld = (screenX: number, screenY: number) => {
    const transform = canvasStore.getState().canvasTransform;

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
    const presence = canvasStore.getState().presence;

    const { worldX, worldY } = mouseToWorld(event.clientX, event.clientY);

    setPresence({
      ...presence,
      cursor: {
        ...presence.cursor,
        x: worldX,
        y: worldY,
      },
    });
  };

  const creatorMouseDown = (event: React.MouseEvent) => {
    const canvas = document.getElementById("canvas");
    if (event.button == 0 && canvas) {
      const state = canvasStore.getState();

      const newCanvasDraft: CanvasDraft = {
        x: state.presence.cursor.x,
        y: state.presence.cursor.y,
        width: 0,
        height: 0,
        type: "rectangle",
      };

      setCanvasDraft(newCanvasDraft);

      lastPos.current = { x: event.clientX, y: event.clientY };

      canvas.addEventListener("pointermove", creatorMouseMove);
      canvas.addEventListener("pointerup", creatorMouseUp);
    }
  };

  const creatorMouseMove = (event: MouseEvent) => {
    const canvasDraft = canvasStore.getState().canvasDraft;

    if (lastPos.current && canvasDraft) {
      const dx = (event.clientX - lastPos.current.x) / canvasTransform.scale;
      const dy = (event.clientY - lastPos.current.y) / canvasTransform.scale;

      const width = canvasDraft.width + dx;
      const height = canvasDraft.height + dy;

      setCanvasDraft({ ...canvasDraft, width: width, height: height });
      lastPos.current = { x: event.clientX, y: event.clientY };
    }
  };

  const creatorMouseUp = () => {
    const canvas = document.getElementById("canvas");
    if (canvas) {
      setTool(0);
      canvas.removeEventListener("pointermove", creatorMouseMove);
      canvas.removeEventListener("pointerup", creatorMouseUp);

      const canvasDraft = canvasStore.getState().canvasDraft;
      if (canvasDraft) {
        const newCanvasObject: CanvasObject = {
          id: "",
          x: canvasDraft.x,
          y: canvasDraft.y,
          width: canvasDraft.width,
          height: canvasDraft.height,
          rotation: 0,
        };
        addCanvasObject(newCanvasObject);
      }
      setCanvasDraft(null);
    }
  };

  return (
    <>
      <div
        id="canvas"
        className={cn(
          "bg-[#171717] overflow-hidden relative h-full w-full",
          props.className
        )}
        onPointerDown={handleMouseDown}
        onPointerMove={updateCursorMove}
        onWheel={handleMouseWheel}
      >
        <div
          className="absolute h-full w-full bg-transparent z-40"
          style={{
            pointerEvents:
              presence.cursor.toolIndex != 0 || canvasTransform.isDragging
                ? "auto"
                : "none",
            cursor: canvasTransform.isDragging
              ? "grab"
              : presence.cursor.toolIndex == 0
              ? "default"
              : "crosshair",
          }}
          onMouseDown={creatorMouseDown}
        ></div>
        {clients.map((client, index) => {
          if (client.userId && client.username && client.color) {
            return (
              <CanvasClient
                key={index}
                client={client}
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
              updateCanvasObject(object);
            }}
            overlayId={overlayId}
          ></CanvasObjectComponent>
        ))}
        <div
          className="absolute z-[0] bg-[#202020] border-neutral-700 border-1 rounded-md shadow-[0px_0px_40px_10px_rgba(0,_0,_0,_0.2)]"
          style={{
            left: 0 * canvasTransform.scale + canvasTransform.offsetX,
            top: 0 * canvasTransform.scale + canvasTransform.offsetY,
            width: canvas.width * canvasTransform.scale,
            height: canvas.height * canvasTransform.scale,
          }}
        ></div>
        <CanvasDraftComponent
          canvasDraft={canvasDraft}
          canvasTransform={canvasTransform}
        />
        <div className="absolute left-2 bottom-1 flex flex-row gap-5 text-neutral-300 font-semibold z-50">
          <span>
            Mouse: {Math.round(presence.cursor.x)} /{" "}
            {Math.round(presence.cursor.y)}
          </span>
          <span>
            Offset: {Math.round(canvasTransform.offsetX)} /{" "}
            {Math.round(canvasTransform.offsetY)}
          </span>
          <span>Scale: {canvasTransform.scale.toFixed(2)}</span>
          {connection.error && (
            <span className="text-red-500">{connection.error}</span>
          )}
        </div>
      </div>
    </>
  );
};

export default Canvas;
