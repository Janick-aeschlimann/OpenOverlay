import type { CanvasSync } from "@/lib/yjsSync";

export interface AuthUser {
  userId: string;
  username: string;
  email: string;
  profile_picture: string;
  created_at: Date;
}

export interface Workspace {
  workspaceId: number;
  name: string;
  slug: string;
  logo: string | null;
  ownerId: string;
  access: string;
}

export interface Canvas {
  width: number;
  height: number;
  color: string;
}

export interface CanvasObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface CanvasDraft {
  x: number;
  y: number;
  width: number;
  height: number;
  type: "rectangle" | "ellipsis" | "line";
}

export interface CanvasTransform {
  offsetX: number;
  offsetY: number;
  scale: number;
  isDragging: boolean;
}

export interface Connection {
  connected: boolean;
  error: string | null;
  canvasSync: CanvasSync | null;
}

export interface Client {
  clientID: number;
  userId: string | null;
  username: string | null;
  color: string | null;
  cursor: {
    toolIndex: number;
    x: number;
    y: number;
  };
}
