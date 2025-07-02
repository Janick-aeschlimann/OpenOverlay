import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import type { YMap } from "node_modules/yjs/dist/src/types/YMap";
import { Button } from "./shadcn/ui/button";
import { useAuthStore } from "@/store/auth";
import { MousePointer2 } from "lucide-react";
import { useParams } from "react-router-dom";

const Canvas: React.FC = () => {
  const [count, setCount] = useState(0);
  const [clients, setClients] = useState<any[]>([]);
  const user = useAuthStore().user;

  const [error, setError] = useState<string | null>(null);

  const id = useParams().id;

  const ymapRef = useRef<YMap<unknown>>(null);
  const providerRef = useRef<WebsocketProvider>(null);

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

  // Function to get a random color
  const getRandomColor = () => {
    const index = Math.floor(Math.random() * userColors.length);
    return userColors[index];
  };

  useEffect(() => {
    const ydoc = new Y.Doc();
    const provider = new WebsocketProvider(
      import.meta.env.VITE_WS_URL,
      id?.toString() || "",
      ydoc
    );

    provider.ws?.addEventListener("close", (event) => {
      setError(event.code + " " + event.reason);
      provider.shouldConnect = false;
    });

    const awareness = provider.awareness;

    providerRef.current = provider;

    document.addEventListener("pointermove", (event) => {
      awareness.setLocalStateField("cursor", {
        x: event.clientX,
        y: event.clientY,
      });
    });

    awareness.on("change", () => {
      const states = Array.from(awareness.getStates().entries());
      setClients(
        states
          .filter(([clientId]) => clientId != awareness.clientID)
          .map((c) => c[1])
      );
    });

    const ymap = ydoc.getMap("counter");
    ymapRef.current = ymap;

    if (!ymap.has("value")) {
      ymap.set("value", 0);
    }

    const updateCount = () => {
      setCount(ymap.get("value") as number);
    };

    provider.on("status", (event) => {
      if (event.status === "connected") {
        if (!ymap.has("value")) {
          ymap.set("value", 0);
        }
        updateCount();
        ymap.observe(updateCount);
      }
    });

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
      color: getRandomColor(),
    });
  }, [user]);

  const increment = () => {
    const ymap = ymapRef.current;
    ymap?.set("value", ((ymap?.get("value") as number) || 0) + 1);
  };

  return (
    <>
      <div className="h-full flex flex-col gap-2 items-center justify-center overflow-hidden">
        <Button onClick={increment}>Increment</Button>
        <p>Count: {count}</p>
        {error ? <p className="text-red-500">{error}</p> : null}
        {clients.map((client) => (
          <div
            className="absolute"
            style={{ left: client.cursor?.x || 0, top: client.cursor?.y || 0 }}
          >
            <MousePointer2
              style={{ fill: client.user.color, color: client.user.color }}
            />
            <p style={{ color: client.user.color }}>{client.user.username}</p>
          </div>
        ))}
      </div>
    </>
  );
};

export default Canvas;
