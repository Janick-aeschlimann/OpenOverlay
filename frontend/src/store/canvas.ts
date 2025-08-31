import { CanvasSync } from "@/lib/yjsSync";
import type {
  Canvas,
  CanvasDraft,
  CanvasObject,
  CanvasTransform,
  Client,
  Connection,
  HierarchyItem,
} from "@/types/types";
import {
  Circle,
  Eraser,
  MousePointer2,
  Slash,
  Square,
  Type,
} from "lucide-react";
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

export interface Tool {
  name: string;
  icon: React.ComponentType<any>; // or more specifically, `LucideIcon` if you have that type
}

export interface Presence {
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
  { name: "Text", icon: Type },
  { name: "Eraser", icon: Eraser },
];

export interface CanvasStore {
  connection: Connection;
  canvas: Canvas;
  canvasObjects: CanvasObject[];
  hierarchy: HierarchyItem;
  selectedCanvasObjectId: string | null;
  nestedSelectedCanvasObjectIds: string[];
  canvasTransform: CanvasTransform;
  presence: Presence;
  canvasDraft: CanvasDraft | null;
  clients: Client[];
  clipboard: CanvasObject[];
  connectYjs: (overlayId: number) => Promise<CanvasSync>;
  setCanvas: (canvas: Canvas) => void;
  updateCanvas: (canvas: Canvas) => void;
  setCanvasObjects: (objects: CanvasObject[]) => void;
  updateCanvasObject: (id: string, newObject: Partial<CanvasObject>) => void;
  updateCanvasObjectProps: (id: string, props: any) => void;
  addCanvasObject: (newObject: CanvasObject) => string | null;
  deleteSelection: () => void;
  setSelectedCanvasObjectId: (canvasObjectId: string | null) => void;
  setCanvasTransform: (transform: CanvasTransform) => void;
  setTool: (index: number) => void;
  setCanvasDraft: (canvasDraft: CanvasDraft | null) => void;
  setPresence: (presence: Presence) => void;
  setClients: (clients: Client[]) => void;
  updateClient: (client: Client) => void;
  setHierarchy: (hierarchy: HierarchyItem[]) => void;
  updateDepthValues: () => void;
  moveHierarchyItem: (
    sourceId: string,
    targetParentId: string,
    targetIndex: number
  ) => void;
  moveSelection: (dx: number, dy: number) => void;
  copySelectionToClipboard: () => void;
  pasteClipboard: () => void;
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
        hierarchy: { id: "root", name: "root", children: [] },
        selectedCanvasObjectId: null,
        nestedSelectedCanvasObjectIds: [],
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
        clients: [],
        clipboard: [],
        connectYjs: async (overlayId) => {
          const canvasSync = await CanvasSync.create(overlayId);
          canvasSync.syncToLocal();
          canvasSync.syncUserToYjs();

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
        setCanvasObjects: (objects) => {
          set({ canvasObjects: objects });
        },
        updateCanvasObject: (id, newObject) => {
          const connection = get().connection;
          const oldObject = get().canvasObjects.find(
            (object) => object.id == id
          );
          if (connection.connected && connection.canvasSync && oldObject) {
            set((state) => ({
              canvasObjects: state.canvasObjects.map((object) =>
                object.id == id ? { ...oldObject, ...newObject } : object
              ),
            }));
            connection.canvasSync.syncUpdateToYjs({
              ...oldObject,
              ...newObject,
            });
          }
        },
        updateCanvasObjectProps: (id, props) => {
          const connection = get().connection;
          const oldObject = get().canvasObjects.find(
            (object) => object.id == id
          );
          if (connection.connected && connection.canvasSync && oldObject) {
            set((state) => ({
              canvasObjects: state.canvasObjects.map((object) =>
                object.id == id
                  ? { ...oldObject, props: { ...oldObject.props, ...props } }
                  : object
              ),
            }));
            connection.canvasSync.syncUpdateToYjs({
              ...oldObject,
              props: { ...oldObject.props, ...props },
            });
          }
        },
        addCanvasObject: (newObject) => {
          const connection = get().connection;
          if (connection.connected && connection.canvasSync) {
            const id = generateNameForObjectOfType(
              get().canvasObjects,
              newObject
            );
            const object = { ...newObject, id: id };
            const hierarchyItem: HierarchyItem = { id: id, name: id };

            set((state) => ({
              canvasObjects: [...state.canvasObjects, object],
              hierarchy: {
                ...state.hierarchy,
                children: [hierarchyItem, ...(state.hierarchy.children ?? [])],
              },
            }));

            connection.canvasSync.syncNewToYjs(object);

            return id;
          }
          return null;
        },
        deleteSelection: () => {
          const connection = get().connection;
          if (connection.connected && connection.canvasSync) {
            const canvasObjectId = get().selectedCanvasObjectId;
            if (canvasObjectId) {
              const { node } = findNodeAndParent(
                get().hierarchy,
                canvasObjectId
              );

              const parentNode = { id: canvasObjectId, name: canvasObjectId };

              const children = node
                ? [...getAllChildrenNodes(node), parentNode]
                : [parentNode];

              set((state) => ({
                canvasObjects: state.canvasObjects.filter(
                  (object) => !children.find((child) => child.id == object.id)
                ),
              }));
              connection.canvasSync.syncDeleteToYjs(children);
              get().setSelectedCanvasObjectId(null);
            }
          }
        },
        setSelectedCanvasObjectId: (canvasObjectId) => {
          set({ selectedCanvasObjectId: canvasObjectId });
          if (canvasObjectId == null) {
            set({ nestedSelectedCanvasObjectIds: [] });
          } else {
            const { node } = findNodeAndParent(get().hierarchy, canvasObjectId);
            if (node) {
              const children = getAllChildrenNodes(node);
              set({
                nestedSelectedCanvasObjectIds: children.map(
                  (child) => child.id
                ),
              });
            }
          }
        },
        setCanvasTransform: (transform) => {
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
        setPresence: (presence) => {
          set({ presence: presence });
          const connection = get().connection;
          if (connection.connected && connection.canvasSync) {
            connection.canvasSync.syncCursorToYjs(presence);
          }
        },
        setClients: (clients) => set({ clients: clients }),
        updateClient: (client) => {
          const clients = get().clients;
          const oldClient = get().clients.find(
            (client) => client.clientID == client.clientID
          );
          if (oldClient) {
            set({
              clients: clients.map((c) =>
                c.clientID == client.clientID ? client : c
              ),
            });
          } else {
            set({ clients: [...clients, client] });
          }
        },
        setHierarchy: (hierarchy) => {
          set((state) => ({
            hierarchy: { ...state.hierarchy, children: hierarchy },
          }));

          get().updateDepthValues();
        },
        updateDepthValues: () => {
          const zValues = getZPosition(get().hierarchy.children ?? []);
          set((state) => ({
            canvasObjects: state.canvasObjects
              .map((object) => ({
                ...object,
                z: zValues.find((node) => node.id == object.id)?.z ?? 0,
              }))
              .sort((a, b) => b.z - a.z),
          }));

          get().connection.canvasSync?.syncDepthValuesToYjs(zValues);
        },
        moveHierarchyItem: (
          sourceId: string,
          targetParentId: string,
          targetIndex: number
        ) => {
          const newHierarchy = moveNode(
            get().hierarchy,
            sourceId,
            targetParentId,
            targetIndex
          );

          set({ hierarchy: newHierarchy });
          get().connection.canvasSync?.syncHierarchyToYjs(newHierarchy);
        },
        moveSelection: (dx, dy) => {
          const selectedCanvasObjectId = get().selectedCanvasObjectId;
          if (selectedCanvasObjectId) {
            const { node } = findNodeAndParent(
              get().hierarchy,
              selectedCanvasObjectId
            );

            const selectedNode = {
              id: selectedCanvasObjectId,
              name: selectedCanvasObjectId,
            };

            const children = node
              ? [...getAllChildrenNodes(node), selectedNode]
              : [selectedNode];

            const canvasTransform = get().canvasTransform;
            const sdx = dx / canvasTransform.scale;
            const sdy = dy / canvasTransform.scale;

            for (const obj of children) {
              const object = get().canvasObjects.find(
                (object) => object.id == obj.id
              );
              if (object) {
                get().updateCanvasObject(object.id, {
                  ...object,
                  x: sdx + object.x,
                  y: sdy + object.y,
                });
              }
            }
          }
        },
        copySelectionToClipboard: () => {
          const selectedCanvasObjectId = get().selectedCanvasObjectId;
          const nestedSelectedCanvasObjectIds =
            get().nestedSelectedCanvasObjectIds;
          if (selectedCanvasObjectId) {
            const canvasObjects = get().canvasObjects;
            const object = canvasObjects.find(
              (obj) => obj.id == selectedCanvasObjectId
            );
            const nestedObjects = nestedSelectedCanvasObjectIds
              .map((id) => canvasObjects.find((obj) => obj.id == id))
              .filter((val) => val != undefined);
            if (object) {
              set({ clipboard: [object, ...nestedObjects] });
            }
          }
        },
        pasteClipboard: () => {
          const clipboardObjects = get().clipboard;

          if (clipboardObjects.length > 0) {
            const presence = get().presence;

            const pasteObject: CanvasObject = {
              ...clipboardObjects[0],
              x: presence.cursor.x - clipboardObjects[0].width / 2,
              y: presence.cursor.y - clipboardObjects[0].height / 2,
            };

            const nestedPaseObjects: CanvasObject[] = clipboardObjects
              .slice(1)
              .map((obj) => ({
                ...obj,
                x: pasteObject.x + (obj.x - clipboardObjects[0].x),
                y: pasteObject.y + (obj.y - clipboardObjects[0].y),
              }));

            const id = get().addCanvasObject(pasteObject);
            for (const object of nestedPaseObjects) {
              get().addCanvasObject(object);
            }

            get().setSelectedCanvasObjectId(id);
          }
        },
      }),
      {
        name: `overlay-${overlayId}`,
        partialize: (state) => ({
          canvasTransform: state.canvasTransform,
          presence: state.presence,
        }),
      }
    )
  );

const generateNameForObjectOfType = (
  objects: CanvasObject[],
  object: CanvasObject
): string => {
  const type = object.type;

  let i = 0;

  while (i < 20) {
    const id =
      type.substring(0, 1).toUpperCase() +
      type.substring(1) +
      (i > 0 ? ` (${i})` : "");

    if (!objects.find((obj) => obj.id == id)) {
      return id;
    }
    i++;
  }
  return crypto.randomUUID();
};

const getZPosition = (
  nodes: HierarchyItem[],
  depth = 0
): { id: string; z: number }[] => {
  const result: { id: string; z: number }[] = [];
  nodes.forEach((node) => {
    result.push({ id: node.id, z: depth });

    if (node.children && node.children.length > 0) {
      result.push(...getZPosition(node.children, depth + 1));
    }
    depth++;
  });
  return result;
};

const getAllChildrenNodes = (node: HierarchyItem): HierarchyItem[] => {
  const nodes: HierarchyItem[] = [];

  node.children?.forEach((child) => {
    nodes.push(child);
    if (child.children) {
      nodes.push(...getAllChildrenNodes(child));
    }
  });

  return nodes;
};

const findNodeAndParent = (
  root: HierarchyItem,
  id: string,
  parent: HierarchyItem | null = null
): { node: HierarchyItem | null; parent: HierarchyItem | null } => {
  if (root.id === id) {
    return { node: root, parent };
  }

  if (root.children) {
    for (const child of root.children) {
      const result = findNodeAndParent(child, id, root);
      if (result?.node) return result;
    }
  }

  return { node: null, parent: null };
};

const moveNode = (
  root: HierarchyItem,
  sourceId: string,
  targetParentId: string,
  targetIndex: number
): HierarchyItem => {
  const { node, parent } = findNodeAndParent(root, sourceId);
  if (!node || !parent) {
    throw new Error("source not found");
  }

  const { node: newParent } = findNodeAndParent(root, targetParentId);
  if (!newParent) {
    throw new Error("target not found");
  }

  parent.children = parent.children!.filter((c) => c.id !== node.id);
  newParent.children = insertAt(newParent.children ?? [], targetIndex, node);

  return root;
};

function insertAt<T>(arr: T[], index: number, item: T) {
  const copy = [...arr];
  if (index == -1) {
    copy.push(item);
  } else {
    copy.splice(index, 0, item);
  }
  return copy;
}

export const useCanvasStore = (overlayId: number) => {
  const store = useMemo(() => getCanvasStore(overlayId), [overlayId]);
  return {
    connection: useStore(store, (s) => s.connection),
    canvas: useStore(store, (s) => s.canvas),
    canvasObjects: useStore(store, (s) => s.canvasObjects),
    hierarchy: useStore(store, (s) => s.hierarchy),
    selectedCanvasObjectId: useStore(store, (s) => s.selectedCanvasObjectId),
    nestedSelectedCanvasObjectIds: useStore(
      store,
      (s) => s.nestedSelectedCanvasObjectIds
    ),
    canvasTransform: useStore(store, (s) => s.canvasTransform),
    presence: useStore(store, (s) => s.presence),
    canvasDraft: useStore(store, (s) => s.canvasDraft),
    clients: useStore(store, (s) => s.clients),
    connectYjs: useStore(store, (s) => s.connectYjs),
    setCanvas: useStore(store, (s) => s.setCanvas),
    updateCanvas: useStore(store, (s) => s.updateCanvas),
    setCanvasObjects: useStore(store, (s) => s.setCanvasObjects),
    updateCanvasObject: useStore(store, (s) => s.updateCanvasObject),
    updateCanvasObjectProps: useStore(store, (s) => s.updateCanvasObjectProps),
    addCanvasObject: useStore(store, (s) => s.addCanvasObject),
    deleteSelection: useStore(store, (s) => s.deleteSelection),
    setSelectedCanvasObjectId: useStore(
      store,
      (s) => s.setSelectedCanvasObjectId
    ),
    setCanvasTransform: useStore(store, (s) => s.setCanvasTransform),
    setTool: useStore(store, (s) => s.setTool),
    setCanvasDraft: useStore(store, (s) => s.setCanvasDraft),
    setPresence: useStore(store, (s) => s.setPresence),
    setClients: useStore(store, (s) => s.setClients),
    updateClient: useStore(store, (s) => s.updateClient),
    setHierarchy: useStore(store, (s) => s.setHierarchy),
    moveHierarchyItem: useStore(store, (s) => s.moveHierarchyItem),
    moveSelection: useStore(store, (s) => s.moveSelection),
    copySelectionToClipboard: useStore(
      store,
      (s) => s.copySelectionToClipboard
    ),
    pasteClipboard: useStore(store, (s) => s.pasteClipboard),
  };
};

export const getCanvasStore = (overlayId: number) => {
  if (!canvas.has(overlayId)) {
    canvas.set(overlayId, createCanvasStore(overlayId));
  }
  return canvas.get(overlayId)!;
};
