import type { CanvasDraft, CanvasTransform } from "@/types/types";
import { componentRegistry } from "./Components/ComponentRegistry";

export interface ICanvasDraftComponentProps {
  canvasDraft: CanvasDraft | null;
  canvasTransform: CanvasTransform;
}

const CanvasDraftComponent: React.FC<ICanvasDraftComponentProps> = (props) => {
  return (
    <>
      <div
        className="absolute z-20 w-full h-full rounded-md"
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
      >
        <div className="w-full h-full">
          {props.canvasDraft &&
            (() => {
              const Render = componentRegistry[props.canvasDraft?.type].render;
              const defaultProps =
                componentRegistry[props.canvasDraft?.type].defaultProps;
              return (
                <>
                  {Render && (
                    <Render
                      obj={{
                        ...props.canvasDraft,
                        props: defaultProps,
                        id: "",
                        z: 0,
                        rotation: 0,
                      }}
                      transform={{ scale: props.canvasTransform.scale }}
                    />
                  )}
                </>
              );
            })()}
        </div>
      </div>
    </>
  );
};

export default CanvasDraftComponent;
