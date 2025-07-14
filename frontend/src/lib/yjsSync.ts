import {
  createCanvasStore,
  getCanvasStore,
  type Presence,
} from "@/store/canvas";
import type { Canvas, CanvasObject } from "@/types/types";
import { WebsocketProvider } from "y-websocket";
import Session from "supertokens-web-js/recipe/session";
import * as Y from "yjs";

export class CanvasSync {
  public provider: WebsocketProvider;
  public ydoc: Y.Doc;
  public yarray: Y.Array<Y.Map<any>>;
  public ycanvas: Y.Map<any>;
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
    this.undoManager = new Y.UndoManager(this.yarray, { captureTimeout: 1000 });
    this.canvasStore = canvasStore;

    const state = this.canvasStore.getState();
    state.setCanvasObjects(this.yarray.toArray().map(this.mapCanvasObject));
  }

  static async create(canvasId: number): Promise<CanvasSync> {
    const accessToken = (await Session.getAccessToken()) || "";
    const ydoc = new Y.Doc();

    const provider = new WebsocketProvider(
      `${import.meta.env.VITE_WS_URL}`,
      `overlay/${canvasId}/edit`,
      ydoc,
      { params: { yauth: accessToken } }
    );

    const canvasStore = getCanvasStore(canvasId);

    return new CanvasSync(provider, ydoc, canvasStore);
  }

  syncToLocal = () => {
    this.yarray.observeDeep(() => {
      const state = this.canvasStore.getState();
      state.setCanvasObjects(this.yarray.toArray().map(this.mapCanvasObject));
    });

    this.ycanvas.observeDeep(() => {
      const state = this.canvasStore.getState();
      state.setCanvas(this.ycanvas.toJSON() as Canvas);
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
    yCanvasObject?.forEach((value, key) => {
      if (object[key as keyof CanvasObject] !== value) {
        yCanvasObject.set(key, object[key as keyof CanvasObject]);
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
  };

  syncDeleteToYjs = (canvasObjectId: string) => {
    const index = this.yarray
      .toArray()
      .findIndex((yobject) => yobject.get("id") == canvasObjectId);
    this.yarray.delete(index, 1);
  };

  syncCursorToYjs = (presence: Presence) => {
    this.provider.awareness.setLocalStateField("cursor", {
      toolIndex: presence.cursor.toolIndex,
      x: presence.cursor.x,
      y: presence.cursor.y,
    });
  };

  syncCanvasToYjs = (canvas: Canvas) => {
    this.ycanvas.set("width", canvas.width);
    this.ycanvas.set("height", canvas.height);
    this.ycanvas.set("color", canvas.color);
  };

  private mapCanvasObject = (y: Y.Map<any>): CanvasObject => {
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

  private mapYCanvasObject = (object: CanvasObject): Y.Map<any> => {
    const yCanvasObject = new Y.Map<any>();

    yCanvasObject.set("id", object.id);
    yCanvasObject.set("x", object.x);
    yCanvasObject.set("y", object.y);
    yCanvasObject.set("width", object.width);
    yCanvasObject.set("height", object.height);
    yCanvasObject.set("rotation", object.rotation);

    return yCanvasObject;
  };

  destroy = () => {
    this.provider.awareness.destroy();
    this.provider.destroy();
    this.ydoc.destroy();
  };
}
