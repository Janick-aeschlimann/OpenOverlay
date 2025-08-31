import type { CanvasTransform, Client } from "@/types/types";
import { MousePointer2, Plus } from "lucide-react";

export interface ICanvasClientProps {
  canvasTransform: CanvasTransform;
  client: Client;
}

const CanvasClient: React.FC<ICanvasClientProps> = (props) => {
  return (
    <>
      <div
        className="absolute z-30 pointer-events-none"
        style={{
          left:
            props.client.cursor.x * props.canvasTransform.scale +
            props.canvasTransform.offsetX,
          top:
            props.client.cursor.y * props.canvasTransform.scale +
            props.canvasTransform.offsetY,
        }}
      >
        {props.client.cursor.toolIndex == 0 && (
          <MousePointer2
            style={{ fill: props.client.color!, color: props.client.color! }}
          />
        )}
        {props.client.cursor.toolIndex == 1 && (
          <Plus
            className="w-8 h-8"
            style={{ fill: props.client.color!, color: props.client.color! }}
          />
        )}
        <div
          className="absolute left-5 rounded-lg flex items-center justify-center px-2 font-medium"
          style={{ backgroundColor: props.client.color! }}
        >
          <p className="text-white text-nowrap">{props.client.username!}</p>
        </div>
      </div>
    </>
  );
};

export default CanvasClient;
