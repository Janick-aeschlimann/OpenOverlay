import type { CanvasTransform } from "@/types/types";
import { MousePointer2 } from "lucide-react";

export interface ICanvasClientProps {
  canvasTransform: CanvasTransform;
  cursor: { x: number; y: number };
  user: { userId: string; username: string; color: string };
}

const CanvasClient: React.FC<ICanvasClientProps> = (props) => {
  return (
    <>
      <div
        className="absolute z-50"
        style={{
          left:
            props.cursor.x * props.canvasTransform.scale +
            props.canvasTransform.offsetX,
          top:
            props.cursor.y * props.canvasTransform.scale +
            props.canvasTransform.offsetY,
        }}
      >
        <MousePointer2
          style={{ fill: props.user.color, color: props.user.color }}
        />
        <p style={{ color: props.user.color }}>{props.user.username}</p>
      </div>
    </>
  );
};

export default CanvasClient;
