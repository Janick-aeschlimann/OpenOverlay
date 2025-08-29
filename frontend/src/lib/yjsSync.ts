import {
  createCanvasStore,
  getCanvasStore,
  type Presence,
} from "@/store/canvas";
import type { Canvas, CanvasObject, HierarchyItem } from "@/types/types";
import { WebsocketProvider } from "y-websocket";
import Session from "supertokens-web-js/recipe/session";
import * as Y from "yjs";
import { useAuthStore } from "@/store/auth";

export class CanvasSync {
  public provider: WebsocketProvider;
  public ydoc: Y.Doc;
  public yarray: Y.Array<Y.Map<any>>;
  public ycanvas: Y.Map<any>;
  public yhierarchy: Y.Array<Y.Map<any>>;
  public undoManager: Y.UndoManager;
  public canvasStore: ReturnType<typeof createCanvasStore>;

  constructor(
    provider: WebsocketProvider,
    ydoc: Y.Doc,
    canvasStore: ReturnType<typeof createCanvasStore>
  ) {
    this.provider = provider;
    this.ydoc = ydoc;
    this.yarray = ydoc.getArray<Y.Map<any>>("objects");
    this.ycanvas = ydoc.getMap<Y.Map<any>>("canvas");
    this.yhierarchy = ydoc.getArray<Y.Map<any>>("Hierarchy");
    this.undoManager = new Y.UndoManager(this.yarray, { captureTimeout: 1000 });
    this.canvasStore = canvasStore;

    const state = this.canvasStore.getState();
    state.setCanvasObjects(this.yarray.toArray().map(this.mapCanvasObject));
  }

  static async create(canvasId: number): Promise<CanvasSync> {
    const accessToken = (await Session.getAccessToken()) || "";
    const ydoc = new Y.Doc();

    const provider = new WebsocketProvider(
      `${import.meta.env.VITE_WS_URL}/overlay`,
      `${canvasId}`,
      ydoc,
      { params: { yauth: accessToken } }
    );

    const canvasStore = getCanvasStore(canvasId);

    return new CanvasSync(provider, ydoc, canvasStore);
  }

  syncToLocal = () => {
    this.yarray.observeDeep(() => {
      const state = this.canvasStore.getState();
      state.setCanvasObjects(
        this.yarray
          .toArray()
          .map(this.mapCanvasObject)
          .sort((a, b) => b.z - a.z)
      );
    });

    this.ycanvas.observeDeep(() => {
      const state = this.canvasStore.getState();
      state.setCanvas(this.ycanvas.toJSON() as Canvas);
    });

    this.yhierarchy.observeDeep(() => {
      const state = this.canvasStore.getState();
      state.setHierarchy(
        this.yhierarchy.toArray().map((ymap) => this.mapHierarchyNode(ymap))
      );
    });

    const awareness = this.provider.awareness;

    awareness.on("change", () => {
      const state = this.canvasStore.getState();
      const states = Array.from(awareness.getStates().entries());

      state.setClients(
        states
          .filter(([clientId]) => clientId != awareness.clientID)
          .map((c) => {
            const user = c[1].user;
            const cursor = c[1].cursor;
            return {
              clientID: c[0],
              userId: user?.userId,
              username: user?.username,
              color: user?.color,
              cursor: {
                toolIndex: cursor?.toolIndex || 0,
                x: cursor?.x,
                y: cursor?.y,
              },
            };
          })
      );
    });
  };

  syncUpdateToYjs = (object: CanvasObject) => {
    const yCanvasObject = this.yarray
      .toArray()
      .find((yobject) => yobject.get("id") == object.id);
    Object.keys(object).forEach((key) => {
      if (object[key as keyof CanvasObject] !== yCanvasObject?.get(key)) {
        yCanvasObject?.set(key, object[key as keyof CanvasObject]);
      }
    });
  };

  syncDepthValuesToYjs = (nodes: { id: string; z: number }[]) => {
    nodes.forEach((node) => {
      const object = this.yarray
        .toArray()
        .find((obj) => obj.get("id") == node.id);
      if (object) {
        object.set("z", node.z);
      }
    });
  };

  syncNewToYjs = (object: CanvasObject) => {
    const yCanvasObject = this.yarray
      .toArray()
      .find((yobject) => yobject.get("id") == object.id);
    if (yCanvasObject) {
      return false;
    }
    const newYObject = this.mapYCanvasObject(object);
    this.yarray.push([newYObject]);
    this.yhierarchy.push([
      this.mapHierarchyNodeToYjs({ id: object.id, name: object.id }),
    ]);
  };

  syncDeleteToYjs = (children: HierarchyItem[]) => {
    children.forEach((node) => {
      const index = this.yarray
        .toArray()
        .findIndex((yobject) => yobject.get("id") == node.id);
      if (index !== -1) {
        this.yarray.delete(index, 1);
      }
    });

    children.forEach((node) => {
      const ymap = this.getParentYMap(this.yhierarchy, node.id);
      if (ymap) {
        const children = ymap.get("children") as Y.Array<Y.Map<any>>;
        const index = children
          .toArray()
          .findIndex((child) => child.get("id") == node.id);
        children.delete(index, 1);
      }
      if (ymap == null) {
        const index = this.yhierarchy
          .toArray()
          .findIndex((child) => child.get("id") == node.id);
        if (index != -1) {
          this.yhierarchy.delete(index, 1);
        }
      }
    });

    const hierarchyIndex = this.yhierarchy
      .toArray()
      .findIndex((node) => node.get("id") == children[0].id);
    if (hierarchyIndex !== -1) {
      this.yhierarchy.delete(hierarchyIndex, 1);
    }
  };

  syncCursorToYjs = (presence: Presence) => {
    this.provider.awareness.setLocalStateField("cursor", {
      toolIndex: presence.cursor.toolIndex,
      x: presence.cursor.x,
      y: presence.cursor.y,
    });
  };

  syncUserToYjs = () => {
    const user = useAuthStore.getState().user;
    const state = this.canvasStore.getState();

    if (user) {
      this.provider.awareness.setLocalStateField("user", {
        userId: user.userId,
        username: user.username,
        color: state.presence.color,
      });
    }
  };

  syncCanvasToYjs = (canvas: Canvas) => {
    this.ycanvas.set("width", canvas.width);
    this.ycanvas.set("height", canvas.height);
    this.ycanvas.set("color", canvas.color);
  };

  syncHierarchyToYjs = (hierarchy: HierarchyItem) => {
    const hierarchyItems = hierarchy.children?.map((node) =>
      this.mapHierarchyNodeToYjs(node)
    );
    if (hierarchyItems) {
      this.yhierarchy.delete(0, this.yhierarchy.length);
      this.yhierarchy.insert(0, hierarchyItems);
    }
  };

  private getParentYMap = (
    yhierarchy: Y.Array<Y.Map<any>>,
    id: string,
    parent: Y.Map<any> | null = null
  ): Y.Map<any> | null => {
    for (const child of yhierarchy.toArray()) {
      if (id == child.get("id")) {
        return parent;
      }
      const children = child.get("children") as Y.Array<Y.Map<any>>;

      if (children.length > 0) {
        parent = child;
        const result = this.getParentYMap(children, id, parent);
        if (result != null) {
          return result;
        }
      }
      parent = null;
    }

    return parent;
  };

  private mapCanvasObject = (y: Y.Map<any>): CanvasObject => {
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

  private mapHierarchyNode = (y: Y.Map<any>): HierarchyItem => {
    if (y) {
      const id = y.get("id");
      const children = y.get("children") as Y.Array<Y.Map<any>>;
      return {
        id: id,
        name: id,
        children: children
          .toArray()
          .map((child) => this.mapHierarchyNode(child)),
      };
    }
    return {} as HierarchyItem;
  };

  private mapHierarchyNodeToYjs = (node: HierarchyItem): Y.Map<any> => {
    const children =
      node.children?.map((child) => this.mapHierarchyNodeToYjs(child)) ?? [];
    const ychildren = new Y.Array<any>();
    ychildren.insert(0, children);

    const yNode = new Y.Map<any>();
    yNode.set("id", node.id);
    yNode.set("name", node.name);
    yNode.set("children", ychildren);
    return yNode;
  };

  private mapYCanvasObject = (object: CanvasObject): Y.Map<any> => {
    const yCanvasObject = new Y.Map<any>();
    console.log(object.z);
    yCanvasObject.set("id", object.id);
    yCanvasObject.set("x", object.x);
    yCanvasObject.set("y", object.y);
    yCanvasObject.set("z", object.z);
    yCanvasObject.set("width", object.width);
    yCanvasObject.set("height", object.height);
    yCanvasObject.set("rotation", object.rotation);
    yCanvasObject.set("type", object.type);
    yCanvasObject.set("props", object.props);

    return yCanvasObject;
  };

  destroy = () => {
    this.provider.awareness.destroy();
    this.provider.destroy();
    this.ydoc.destroy();
  };
}
