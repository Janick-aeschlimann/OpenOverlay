import type { CanvasDraft, CanvasTransform } from "@/types/types";

export interface ICanvasDraftComponentProps {
  canvasDraft: CanvasDraft | null;
  canvasTransform: CanvasTransform;
}

const CanvasDraftComponent: React.FC<ICanvasDraftComponentProps> = (props) => {
  return (
    <>
      <div
        className="absolute bg-white z-20"
        style={{
          left:
            (props.canvasDraft?.x || 0) * props.canvasTransform.scale +
            props.canvasTransform.offsetX,
          top:
            (props.canvasDraft?.y || 0) * props.canvasTransform.scale +
            props.canvasTransform.offsetY,
          width: (props.canvasDraft?.width || 0) * props.canvasTransform.scale,
          height:
            (props.canvasDraft?.height || 0) * props.canvasTransform.scale,
        }}
      ></div>
    </>
  );
};

export default CanvasDraftComponent;
