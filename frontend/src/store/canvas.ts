import { CanvasSync } from "@/lib/yjsSync";
import type {
  Canvas,
  CanvasDraft,
  CanvasObject,
  CanvasTransform,
  Connection,
} from "@/types/types";
import { Circle, Eraser, MousePointer2, Slash, Square } from "lucide-react";
import { useMemo } from "react";
import { create, useStore } from "zustand";
import { persist } from "zustand/middleware";

const canvas = new Map<number, ReturnType<typeof createCanvasStore>>();

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

const getRandomColor = () => {
  const index = Math.floor(Math.random() * userColors.length);
  return userColors[index];
};

interface Tool {
  name: string;
  icon: React.ComponentType<any>; // or more specifically, `LucideIcon` if you have that type
}

interface Presence {
  cursor: {
    toolIndex: number;
    x: number;
    y: number;
  };
  color: (typeof userColors)[number];
}

export const tools: Tool[] = [
  { name: "Select", icon: MousePointer2 },
  { name: "Rectangle", icon: Square },
  { name: "Circle", icon: Circle },
  { name: "Line", icon: Slash },
  { name: "Eraser", icon: Eraser },
];

export interface CanvasStore {
  connection: Connection;
  canvas: Canvas;
  canvasObjects: CanvasObject[];
  selectedCanvasObjectId: string | null;
  canvasTransform: CanvasTransform;
  presence: Presence;
  canvasDraft: CanvasDraft | null;
  connectYjs: (overlayId: number) => Promise<CanvasSync>;
  setCanvas: (canvas: Canvas) => void;
  updateCanvas: (canvas: Canvas) => void;
  setCanvasObjects: (objects: CanvasObject[]) => void;
  updateCanvasObject: (newObject: CanvasObject) => void;
  addCanvasObject: (newObject?: CanvasObject) => void;
  deleteCanvasObject: (canvasObjectId: string) => void;
  setSelectedCanvasObjectId: (canvasObjectId: string) => void;
  setCanvasTransform: (transform: CanvasTransform) => void;
  setTool: (index: number) => void;
  setCanvasDraft: (canvasDraft: CanvasDraft | null) => void;
}

export const createCanvasStore = (overlayId: number) =>
  create<CanvasStore>()(
    persist(
      (set, get) => ({
        connection: { connected: false, error: null, canvasSync: null },
        canvas: {
          width: 1920,
          height: 1080,
          color: "#121212",
        },
        canvasObjects: [],
        selectedCanvasObjectId: null,
        canvasTransform: {
          offsetX: 0,
          offsetY: 0,
          scale: 1,
          isDragging: false,
          mouseX: 0,
          mouseY: 0,
        },
        presence: {
          cursor: {
            toolIndex: 0,
            x: 0,
            y: 0,
          },
          color: getRandomColor(),
        },
        canvasDraft: null,
        connectYjs: async (overlayId) => {
          const canvasSync = await CanvasSync.create(overlayId);
          canvasSync.syncToLocal();

          set({
            connection: {
              connected: true,
              error: null,
              canvasSync: canvasSync,
            },
          });

          const provider = canvasSync.provider;

          provider.ws?.addEventListener("close", (event: any) => {
            const connection = get().connection;
            set({
              connection: {
                ...connection,
                connected: false,
                error: event.code + " " + event.reason,
              },
            });
            if (event.code == 403) {
              provider.shouldConnect = false;
            }
          });

          return canvasSync;
        },
        setCanvas: (canvas) => set({ canvas: canvas }),
        updateCanvas: (canvas) => {
          set({ canvas: canvas });
          const connection = get().connection;
          if (connection.connected && connection.canvasSync) {
            connection.canvasSync.syncCanvasToYjs(canvas);
          }
        },
        setCanvasObjects: (objects) => set({ canvasObjects: objects }),
        updateCanvasObject: (newObject) => {
          const id = newObject.id;
          const connection = get().connection;
          if (connection.connected && connection.canvasSync) {
            set((state) => ({
              canvasObjects: state.canvasObjects.map((object) =>
                object.id === id ? newObject : object
              ),
            }));
            connection.canvasSync.syncUpdateToYjs(newObject);
          }
        },
        addCanvasObject: (newObject) => {
          const connection = get().connection;
          if (connection.connected && connection.canvasSync) {
            let object: CanvasObject;
            const id = crypto.randomUUID();

            if (newObject) {
              object = { ...newObject, id: id };
            } else {
              object = {
                id: id,
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                rotation: 0,
              };
            }
            set((state) => ({
              canvasObjects: [...state.canvasObjects, object],
            }));
            connection.canvasSync.syncNewToYjs(object);
          }
        },
        deleteCanvasObject: (canvasObjectId) => {
          const connection = get().connection;
          if (connection.connected && connection.canvasSync) {
            set((state) => ({
              canvasObjects: state.canvasObjects.filter(
                (object) => object.id !== canvasObjectId
              ),
            }));
            connection.canvasSync.syncDeleteToYjs(canvasObjectId);
          }
        },
        setSelectedCanvasObjectId: (canvasObjectId) =>
          set({ selectedCanvasObjectId: canvasObjectId }),
        setCanvasTransform: (transform) => {
          const { mouseX, mouseY } = get().canvasTransform;
          if (mouseX !== transform.mouseX || mouseY !== transform.mouseY) {
            const connection = get().connection;
            if (connection.connected && connection.canvasSync) {
              connection.canvasSync.syncCursorToYjs(transform);
            }
          }
          set({ canvasTransform: transform });
        },
        setTool: (index) => {
          const presence = get().presence;
          set({
            presence: {
              ...presence,
              cursor: { ...presence.cursor, toolIndex: index },
            },
          });
        },
        setCanvasDraft: (canvasDraft) => {
          set({ canvasDraft: canvasDraft });
        },
      }),
      {
        name: `overlay-${overlayId}`,
        partialize: (state) => ({
          canvasTransform: state.canvasTransform,
        }),
      }
    )
  );

export const useCanvasStore = (overlayId: number) => {
  const store = useMemo(() => getCanvasStore(overlayId), [overlayId]);
  return {
    connection: useStore(store, (s) => s.connection),
    canvas: useStore(store, (s) => s.canvas),
    canvasObjects: useStore(store, (s) => s.canvasObjects),
    selectedCanvasObjectId: useStore(store, (s) => s.selectedCanvasObjectId),
    canvasTransform: useStore(store, (s) => s.canvasTransform),
    presence: useStore(store, (s) => s.presence),
    canvasDraft: useStore(store, (s) => s.canvasDraft),
    connectYjs: useStore(store, (s) => s.connectYjs),
    setCanvas: useStore(store, (s) => s.setCanvas),
    updateCanvas: useStore(store, (s) => s.updateCanvas),
    setCanvasObjects: useStore(store, (s) => s.setCanvasObjects),
    updateCanvasObject: useStore(store, (s) => s.updateCanvasObject),
    addCanvasObject: useStore(store, (s) => s.addCanvasObject),
    deleteCanvasObject: useStore(store, (s) => s.deleteCanvasObject),
    setSelectedCanvasObjectId: useStore(
      store,
      (s) => s.setSelectedCanvasObjectId
    ),
    setCanvasTransform: useStore(store, (s) => s.setCanvasTransform),
    setTool: useStore(store, (s) => s.setTool),
    setCanvasDraft: useStore(store, (s) => s.setCanvasDraft),
  };
};

export const getCanvasStore = (overlayId: number) => {
  if (!canvas.has(overlayId)) {
    canvas.set(overlayId, createCanvasStore(overlayId));
  }
  return canvas.get(overlayId)!;
};
