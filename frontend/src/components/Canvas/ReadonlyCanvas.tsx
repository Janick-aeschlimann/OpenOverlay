import type { CanvasObject } from "@/types/types";
import { useEffect, useState } from "react";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";

const ReadonlyCanvas: React.FC = () => {
  const [objects, setObjects] = useState<CanvasObject[]>();

  const mapCanvasObject = (y: Y.Map<any>): CanvasObject => {
    if (y) {
      return {
        id: y.get("id"),
        x: y.get("x"),
        y: y.get("y"),
        width: y.get("width"),
        height: y.get("height"),
        rotation: y.get("rotation"),
      };
    }
    return {} as CanvasObject;
  };

  useEffect(() => {
    const ydoc = new Y.Doc();
    const provider = new WebsocketProvider(
      `${import.meta.env.VITE_WS_URL}`,
      `overlay/1/view`,
      ydoc,
      {
        params: {
          token:
            "facca0ea30c97787a0c80d92b493d22c449f977f3769b07b090a469446ece5ffc6399f3cc43ba3c6d531324e1384bcab5c33f60c5ec7818eec6e5414a51db8d6",
        },
      }
    );

    console.log(provider);
    provider.ws?.addEventListener("close", (event: any) => {
      console.log(event);
    });

    const yarray = ydoc.getArray<Y.Map<any>>("objects");

    yarray.observeDeep(() => {
      setObjects(yarray.toArray().map(mapCanvasObject));
    });
  }, []);
  return (
    <>
      {objects?.map((object) => (
        <div
          className="absolute bg-white"
          style={{
            left: object.x,
            top: object.y,
            width: object.width,
            height: object.height,
          }}
        ></div>
      ))}
    </>
  );
};

export default ReadonlyCanvas;
