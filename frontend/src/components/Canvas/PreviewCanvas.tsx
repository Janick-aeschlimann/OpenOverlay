import type { CanvasObject } from "@/types/types";
import { useEffect, useRef, useState } from "react";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";
import { componentRegistry } from "./Components/ComponentRegistry";

const PreviewCanvas: React.FC = () => {
  const [objects, setObjects] = useState<CanvasObject[]>();

  const providerRef = useRef<WebsocketProvider>(null);

  const mapCanvasObject = (y: Y.Map<any>): CanvasObject => {
    if (y) {
      return {
        id: y.get("id"),
        x: y.get("x"),
        y: y.get("y"),
        z: y.get("z"),
        width: y.get("width"),
        height: y.get("height"),
        rotation: y.get("rotation"),
        type: y.get("type"),
        props: y.get("props"),
      };
    }
    return {} as CanvasObject;
  };

  useEffect(() => {
    setupYjs();
  }, []);

  const setupYjs = () => {
    if (providerRef.current) {
      providerRef.current.destroy();
    }
    const ydoc = new Y.Doc();
    const provider = new WebsocketProvider(
      `${import.meta.env.VITE_WS_URL}`,
      `overlay/0`,
      ydoc
    );

    providerRef.current = provider;

    console.log(provider);
    provider.ws?.addEventListener("close", (event: any) => {
      console.log(event);
    });

    const yarray = ydoc.getArray<Y.Map<any>>("objects");

    yarray.observeDeep(() => {
      setObjects(
        yarray
          .toArray()
          .map(mapCanvasObject)
          .sort((a, b) => b.z - a.z)
      );
    });
  };

  return (
    <>
      <div className="bg-transparent relative w-screen h-screen overflow-hidden">
        <div className="bg-transparent w-screen h-screen overflow-hidden absolute">
          {objects?.map((object) => (
            <div
              className="absolute"
              key={object.id}
              style={{
                left: object.x,
                top: object.y,
                width: object.width,
                height: object.height,
              }}
            >
              {(() => {
                const Component = componentRegistry[object.type]?.render;
                return (
                  <>
                    {Component && (
                      <Component obj={object} transform={{ scale: 1 }} />
                    )}
                  </>
                );
              })()}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default PreviewCanvas;
