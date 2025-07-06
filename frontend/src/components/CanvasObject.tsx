import { useCanvasStore } from "@/store/canvas";
import type { CanvasObject, CanvasTransform } from "@/types/types";
import { useRef } from "react";
import * as Y from "yjs";

export interface ICanvasObjectProps {
  object: CanvasObject;
  canvasTransform: CanvasTransform;
  setCanvasObject: (object: CanvasObject) => void;
  undoManager?: Y.UndoManager;
}

const CanvasObjectComponent: React.FC<ICanvasObjectProps> = (props) => {
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const minWidth = 100;
  const minHeight = 100;

  const { selectedCanvasObjectId, setSelectedCanvasObjectId } =
    useCanvasStore();

  const handleMouseMove = (event: MouseEvent) => {
    if (lastPos.current) {
      const dx =
        (event.clientX - lastPos.current.x) / props.canvasTransform.scale;
      const dy =
        (event.clientY - lastPos.current.y) / props.canvasTransform.scale;

      const x = props.object.x + dx;
      const y = props.object.y + dy;

      props.setCanvasObject({
        ...props.object,
        x: x,
        y: y,
      });
    }
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    if (event.button == 0) {
      setSelectedCanvasObjectId(props.object.id);
      lastPos.current = { x: event.clientX, y: event.clientY };
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
  };

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseMove);
    props.undoManager?.stopCapturing();
  };

  const handleResizeTop = (event: MouseEvent) => {
    if (lastPos.current) {
      const dy =
        (event.clientY - lastPos.current.y) / props.canvasTransform.scale;

      const height = props.object.height - dy;
      const y = props.object.y + dy;

      props.setCanvasObject({
        ...props.object,
        height: height > minHeight ? height : minHeight,
        y: y,
      });
    }
  };

  const handleResizeBottom = (event: MouseEvent) => {
    if (lastPos.current) {
      const dy =
        (event.clientY - lastPos.current.y) / props.canvasTransform.scale;

      const height = props.object.height + dy;

      props.setCanvasObject({
        ...props.object,
        height: height > minHeight ? height : minHeight,
      });
    }
  };

  const handleResizeRight = (event: MouseEvent) => {
    if (lastPos.current) {
      const dx =
        (event.clientX - lastPos.current.x) / props.canvasTransform.scale;

      const width = props.object.width + dx;

      props.setCanvasObject({
        ...props.object,
        width: width > minWidth ? width : minWidth,
      });
    }
  };

  const handleResizeLeft = (event: MouseEvent) => {
    if (lastPos.current) {
      const dx =
        (event.clientX - lastPos.current.x) / props.canvasTransform.scale;

      const width = props.object.width - dx;
      const x = props.object.x + dx;

      props.setCanvasObject({
        ...props.object,
        width: width > minWidth ? width : minWidth,
        x: x,
      });
    }
  };

  const handleResizeTopLeft = (event: MouseEvent) => {
    if (lastPos.current) {
      const dx =
        (event.clientX - lastPos.current.x) / props.canvasTransform.scale;
      const dy =
        (event.clientY - lastPos.current.y) / props.canvasTransform.scale;

      const height = props.object.height - dy;
      const width = props.object.width - dx;
      const x = props.object.x + dx;
      const y = props.object.y + dy;

      props.setCanvasObject({
        ...props.object,
        height: height > minHeight ? height : minHeight,
        width: width > minWidth ? width : minWidth,
        x: x,
        y: y,
      });
    }
  };

  const handleResizeTopRight = (event: MouseEvent) => {
    if (lastPos.current) {
      const dx =
        (event.clientX - lastPos.current.x) / props.canvasTransform.scale;
      const dy =
        (event.clientY - lastPos.current.y) / props.canvasTransform.scale;

      const height = props.object.height - dy;
      const width = props.object.width + dx;
      const y = props.object.y + dy;

      props.setCanvasObject({
        ...props.object,
        height: height > minHeight ? height : minHeight,
        width: width > minWidth ? width : minWidth,
        y: y,
      });
    }
  };

  const handleResizeBottomRight = (event: MouseEvent) => {
    if (lastPos.current) {
      const dx =
        (event.clientX - lastPos.current.x) / props.canvasTransform.scale;
      const dy =
        (event.clientY - lastPos.current.y) / props.canvasTransform.scale;

      const height = props.object.height + dy;
      const width = props.object.width + dx;

      props.setCanvasObject({
        ...props.object,
        height: height > minHeight ? height : minHeight,
        width: width > minWidth ? width : minWidth,
      });
    }
  };

  const handleResizeBottomLeft = (event: MouseEvent) => {
    if (lastPos.current) {
      const dx =
        (event.clientX - lastPos.current.x) / props.canvasTransform.scale;
      const dy =
        (event.clientY - lastPos.current.y) / props.canvasTransform.scale;

      const height = props.object.height + dy;
      const width = props.object.width - dx;
      const x = props.object.x + dx;

      props.setCanvasObject({
        ...props.object,
        height: height > minHeight ? height : minHeight,
        width: width > minWidth ? width : minWidth,
        x: x,
      });
    }
  };

  const handleResizeMouseUp = (resizeHandler: (event: MouseEvent) => void) => {
    document.removeEventListener("mousemove", resizeHandler);
    document.removeEventListener("mouseup", handleMouseMove);
    props.undoManager?.stopCapturing();
  };

  const handleResizeMouseDown = (event: React.MouseEvent) => {
    let resizeHandler: (event: MouseEvent) => void;

    if (event.button == 0) {
      switch ((event.target as HTMLElement).id) {
        case "top":
          resizeHandler = handleResizeTop;
          break;
        case "right":
          resizeHandler = handleResizeRight;
          break;
        case "bottom":
          resizeHandler = handleResizeBottom;
          break;
        case "left":
          resizeHandler = handleResizeLeft;
          break;
        case "top-left":
          resizeHandler = handleResizeTopLeft;
          break;
        case "top-right":
          resizeHandler = handleResizeTopRight;
          break;
        case "bottom-right":
          resizeHandler = handleResizeBottomRight;
          break;
        case "bottom-left":
          resizeHandler = handleResizeBottomLeft;
          break;
        default:
          resizeHandler = () => {};
          break;
      }

      lastPos.current = { x: event.clientX, y: event.clientY };
      document.addEventListener("mousemove", resizeHandler);
      document.addEventListener("mouseup", () =>
        handleResizeMouseUp(resizeHandler)
      );
    }
  };

  return (
    <>
      <div
        className="absolute"
        style={{
          left:
            props.object.x * props.canvasTransform.scale +
            props.canvasTransform.offsetX,
          top:
            props.object.y * props.canvasTransform.scale +
            props.canvasTransform.offsetY,
          width: props.object.width * props.canvasTransform.scale,
          height: props.object.height * props.canvasTransform.scale,
        }}
      >
        <div
          className="absolute h-full z-10 w-full border-2 border-transparent rounded-xl pointer-events-none"
          style={{
            borderColor:
              selectedCanvasObjectId == props.object.id ? "white" : "",
          }}
        ></div>

        <div
          className="absolute bg-neutral-600 w-full h-full hover:cursor-move rounded-xl"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        ></div>

        <div
          id="top-left"
          className="absolute z-20 w-2 h-2 -left-0.5 -top-0.5 rounded-full cursor-nw-resize"
          onMouseDown={handleResizeMouseDown}
        ></div>
        <div
          id="top-right"
          className="absolute z-20 w-2 h-2 -right-0.5 -top-0.5 rounded-full cursor-ne-resize"
          onMouseDown={handleResizeMouseDown}
        ></div>
        <div
          id="bottom-right"
          className="absolute z-20 w-2 h-2 -right-0.5 -bottom-0.5 rounded-full cursor-se-resize"
          onMouseDown={handleResizeMouseDown}
        ></div>
        <div
          id="bottom-left"
          className="absolute z-20 w-2 h-2 -left-0.5 -bottom-0.5 rounded-full cursor-sw-resize"
          onMouseDown={handleResizeMouseDown}
        ></div>

        <div
          id="top"
          className="absolute z-10 top-0 left-0 w-full h-[3px] hover:cursor-n-resize"
          onMouseDown={handleResizeMouseDown}
        ></div>
        <div
          id="right"
          className="absolute z-10 top-0 right-0 h-full w-[3px] hover:cursor-e-resize"
          onMouseDown={handleResizeMouseDown}
        ></div>
        <div
          id="bottom"
          className="absolute z-10 bottom-0 left-0 w-full h-[3px] hover:cursor-s-resize"
          onMouseDown={handleResizeMouseDown}
        ></div>
        <div
          id="left"
          className="absolute z-10 top-0 left-0 h-full w-[3px] hover:cursor-w-resize"
          onMouseDown={handleResizeMouseDown}
        ></div>
      </div>
    </>
  );
};

export default CanvasObjectComponent;
