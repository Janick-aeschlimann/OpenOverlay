import type { CanvasSync } from "@/lib/yjsSync";
import type { CanvasObject, CanvasTransform } from "@/types/types";
import { create } from "zustand";

export const useCanvasStore = create<{
  canvasObjects: CanvasObject[];
  selectedCanvasObjectId: string | null;
  canvasTransform: CanvasTransform;
  setCanvasObjects: (objects: CanvasObject[]) => void;
  updateCanvasObject: (canvasSync: CanvasSync, newObject: CanvasObject) => void;
  addCanvasObject: (canvasSync: CanvasSync, newObject?: CanvasObject) => void;
  deleteCanvasObject: (canvasSync: CanvasSync, canvasObjectId: string) => void;
  setSelectedCanvasObjectId: (canvasObjectId: string) => void;
  setCanvasTransform: (
    canvasSync: CanvasSync | null,
    transform: CanvasTransform
  ) => void;
}>((set, get) => ({
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
}));
