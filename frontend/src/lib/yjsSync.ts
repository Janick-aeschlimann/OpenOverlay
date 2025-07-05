import { useCanvasStore } from "@/store/canvas";
import type { CanvasObject } from "@/types/types";
import { WebsocketProvider } from "y-websocket";
import Session from "supertokens-web-js/recipe/session";
import * as Y from "yjs";

export class CanvasSync {
  public provider: WebsocketProvider;
  public ydoc: Y.Doc;
  public yarray: Y.Array<Y.Map<any>>;

  constructor(provider: WebsocketProvider, ydoc: Y.Doc) {
    this.provider = provider;
    this.ydoc = ydoc;
    this.yarray = ydoc.getArray<Y.Map<any>>("objects");

    const state = useCanvasStore.getState();
    state.setCanvasObjects(this.yarray.toArray().map(this.mapCanvasObject));
  }

  static async create(canvasId: string): Promise<CanvasSync> {
    const accessToken = (await Session.getAccessToken()) || "";
    const ydoc = new Y.Doc();

    const provider = new WebsocketProvider(
      import.meta.env.VITE_WS_URL,
      canvasId.toString() || "",
      ydoc,
      { params: { yauth: accessToken } }
    );

    return new CanvasSync(provider, ydoc);
  }

  syncToLocal = () => {
    this.yarray.observeDeep(() => {
      const state = useCanvasStore.getState();
      state.setCanvasObjects(this.yarray.toArray().map(this.mapCanvasObject));
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
