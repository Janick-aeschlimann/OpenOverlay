import type { CanvasObject } from "@/types/types";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";
import { create } from "zustand";
import { componentRegistry } from "./Components/ComponentRegistry";

const useSceneStore = create<{
  currentScene: number;
  switchScene: () => void;
}>((set) => ({
  currentScene: 1,
  switchScene: () =>
    set((state: any) => {
      console.log(state);
      return { currentScene: state.currentScene == 1 ? 2 : 1 };
    }),
}));

const ReadonlyCanvas: React.FC = () => {
  const [objects1, setObjects1] = useState<CanvasObject[]>();
  const [objects2, setObjects2] = useState<CanvasObject[]>();

  const providerRef = useRef<WebsocketProvider>(null);

  const { token } = useParams();

  const { currentScene, switchScene } = useSceneStore();

  const mapCanvasObject = (y: Y.Map<any>): CanvasObject => {
    if (y) {
      return {
        id: y.get("id"),
        x: y.get("x"),
        y: y.get("y"),
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
    const ws = new WebSocket(
      `${import.meta.env.VITE_WS_URL}/rendersource/${token}`
    );
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log(message);
      if (message.type == "init") {
        initRenderSource(message.overlayId);
      }
      if (message.type == "switch-overlay") {
        switchOverlay(message.newOverlayId);
      }
    };
  }, []);

  const setupYjs = (overlayId: number, scene: number) => {
    if (providerRef.current) {
      providerRef.current.destroy();
    }
    const ydoc = new Y.Doc();
    const provider = new WebsocketProvider(
      `${import.meta.env.VITE_WS_URL}`,
      `overlay/${overlayId}/view`,
      ydoc,
      {
        params: {
          token: token!,
        },
      }
    );

    providerRef.current = provider;

    console.log(provider);
    provider.ws?.addEventListener("close", (event: any) => {
      console.log(event);
    });

    const yarray = ydoc.getArray<Y.Map<any>>("objects");

    yarray.observeDeep(() => {
      if (scene == 1) {
        setObjects1(yarray.toArray().map(mapCanvasObject));
      } else {
        setObjects2(yarray.toArray().map(mapCanvasObject));
      }
    });
  };

  const switchOverlay = (overlayId: number) => {
    const state = useSceneStore.getState();
    const scene = state.currentScene == 1 ? 2 : 1;
    setupYjs(overlayId, scene);
    setTimeout(() => {
      switchScene();
    }, 1000);
  };

  const initRenderSource = (overlayId: number) => {
    setupYjs(overlayId, 1);
  };

  return (
    <>
      <div className="relative w-screen h-screen overflow-hidden">
        <div
          className="bg-transparent w-screen h-screen overflow-hidden absolute"
          style={{
            opacity: currentScene == 1 ? 1 : 0,
            transition: "opacity 2s ease",
          }}
        >
          {objects1?.map((object) => (
            <div
              className="absolute"
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
        <div
          className="bg-transparent w-screen h-screen overflow-hidden absolute"
          style={{
            opacity: currentScene == 2 ? 1 : 0,
            transition: "opacity 2s ease",
          }}
        >
          {objects2?.map((object) => (
            <div
              className="absolute"
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

export default ReadonlyCanvas;
