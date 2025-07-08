import type { CanvasSync } from "@/lib/yjsSync";
import type { CanvasDraft, CanvasObject, CanvasTransform } from "@/types/types";
import { Circle, Eraser, MousePointer2, Slash, Square } from "lucide-react";
import { useMemo } from "react";
import { create, useStore } from "zustand";
import { persist } from "zustand/middleware";

const canavs = new Map<number, ReturnType<typeof createCanvasStore>>();

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
  canvasObjects: CanvasObject[];
  selectedCanvasObjectId: string | null;
  canvasTransform: CanvasTransform;
  presence: Presence;
  canvasDraft: CanvasDraft | null;
  setCanvasObjects: (objects: CanvasObject[]) => void;
  updateCanvasObject: (canvasSync: CanvasSync, newObject: CanvasObject) => void;
  addCanvasObject: (canvasSync: CanvasSync, newObject?: CanvasObject) => void;
  deleteCanvasObject: (canvasSync: CanvasSync, canvasObjectId: string) => void;
  setSelectedCanvasObjectId: (canvasObjectId: string) => void;
  setCanvasTransform: (
    canvasSync: CanvasSync | null,
    transform: CanvasTransform
  ) => void;
  setTool: (index: number) => void;
  setCanvasDraft: (canvasDraft: CanvasDraft | null) => void;
}

export const createCanvasStore = (overlayId: number) =>
  create<CanvasStore>()(
    persist(
      (set, get) => ({
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
        setCanvasObjects: (objects) => set({ canvasObjects: objects }),
        updateCanvasObject: (canvasSync, newObject) => {
          const id = newObject.id;
          set((state) => ({
            canvasObjects: state.canvasObjects.map((object) =>
              object.id === id ? newObject : object
            ),
          }));
          canvasSync.syncUpdateToYjs(newObject);
        },
        addCanvasObject: (canvasSync, newObject) => {
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
          canvasSync.syncNewToYjs(object);
        },
        deleteCanvasObject: (canvasSync, canvasObjectId) => {
          set((state) => ({
            canvasObjects: state.canvasObjects.filter(
              (object) => object.id !== canvasObjectId
            ),
          }));
          canvasSync.syncDeleteToYjs(canvasObjectId);
        },
        setSelectedCanvasObjectId: (canvasObjectId) =>
          set({ selectedCanvasObjectId: canvasObjectId }),
        setCanvasTransform: (canvasSync, transform) => {
          const { mouseX, mouseY } = get().canvasTransform;
          if (mouseX !== transform.mouseX || mouseY !== transform.mouseY) {
            canvasSync?.syncCursorToYjs(transform);
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
    canvasObjects: useStore(store, (s) => s.canvasObjects),
    selectedCanvasObjectId: useStore(store, (s) => s.selectedCanvasObjectId),
    canvasTransform: useStore(store, (s) => s.canvasTransform),
    presence: useStore(store, (s) => s.presence),
    canvasDraft: useStore(store, (s) => s.canvasDraft),
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
  if (!canavs.has(overlayId)) {
    canavs.set(overlayId, createCanvasStore(overlayId));
  }
  return canavs.get(overlayId)!;
};
