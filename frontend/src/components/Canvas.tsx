import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import type { YMap } from "node_modules/yjs/dist/src/types/YMap";
import { Button } from "./shadcn/ui/button";
import { useAuthStore } from "@/store/auth";

interface Cursor {
  x: number;
  y: number;
}

const Canvas: React.FC = () => {
  const [count, setCount] = useState(0);
  const [cursor, setCursor] = useState<Cursor>({ x: 0, y: 0 });
  const user = useAuthStore().user;

  const ymapRef = useRef<YMap<unknown>>(null);
  const providerRef = useRef<WebsocketProvider>(null);

  useEffect(() => {
    const ydoc = new Y.Doc();
    const provider = new WebsocketProvider(
      "ws://localhost:3000",
      "my-shared-room",
      ydoc
    );

    const awareness = provider.awareness;

    providerRef.current = provider;

    document.addEventListener("pointermove", (event) => {
      awareness.setLocalStateField("cursor", {
        x: event.clientX,
        y: event.clientY,
      });
    });

    awareness.on("change", (changes) => {
      const states = Array.from(awareness.getStates().entries());
      for (const [clientID, state] of states) {
        if (clientID === awareness.clientID) continue; // nicht du selbst
        setCursor(state.cursor);
        console.log(state.user);
      }
    });

    const ymap = ydoc.getMap("counter");
    ymapRef.current = ymap;

    if (!ymap.has("value")) {
      ymap.set("value", 0);
    }

    const updateCount = () => {
      setCount(ymap.get("value") as number);
    };

    ymap.observe(updateCount);
    updateCount();

    return () => {
      ymap.unobserve(updateCount);
      provider.destroy();
      ydoc.destroy();
    };
  }, []);

  useEffect(() => {
    providerRef.current?.awareness.setLocalStateField("user", {
      userId: user?.userId,
      username: user?.username,
    });
  }, [user]);

  const increment = () => {
    const ymap = ymapRef.current;
    ymap?.set("value", ((ymap?.get("value") as number) || 0) + 1);
  };

  return (
    <>
      <div className="h-full flex flex-col gap-2 items-center justify-center">
        <Button onClick={increment}>Increment</Button>
        <p>Count: {count}</p>
        <div
          className={`w-10 h-10 bg-red-500 absolute`}
          style={{ left: cursor?.x || 0, top: cursor?.y || 0 }}
        ></div>
      </div>
    </>
  );
};

export default Canvas;
