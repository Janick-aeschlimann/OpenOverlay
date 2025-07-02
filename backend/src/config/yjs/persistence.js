import * as Y from "yjs";
import { setPersistence } from "./util.js";
import { LeveldbPersistence } from "y-leveldb";

const persistence = new LeveldbPersistence("./data/yjs-db");

setPersistence({
  bindState: async (docName, ydoc) => {
    const persistedYdoc = await persistence.getYDoc(docName);
    const state = Y.encodeStateAsUpdate(persistedYdoc);
    Y.applyUpdate(ydoc, state);
    ydoc.on("update", async (update) => {
      await persistence.storeUpdate(docName, update);
    });
  },
  writeState: async (docName, ydoc) => {
    // already persisted on each update
    return;
  },
  provider: persistence,
});
