import { cn } from "@/lib/utils";
import { tools, useCanvasStore } from "@/store/canvas";
export interface IToolbarProps {
  overlayId: number;
  className?: string;
}

const Toolbar: React.FC<IToolbarProps> = (props) => {
  const { presence, setTool } = useCanvasStore(props.overlayId);

  return (
    <>
      <div
        className={cn(
          "rounded-[16px] border-2 border-[#505050] bg-[#1e1e1e] z-50 flex flex-col items-center justify-start gap-3 p-1",
          props.className
        )}
      >
        {tools.map((tool, index) => (
          <div
            className="w-10 h-10 rounded-[12px] flex items-center justify-center cursor-pointer"
            key={index}
            style={{
              backgroundColor:
                index == presence.cursor.toolIndex ? "#0080FF" : "",
            }}
            onClick={() => {
              setTool(index);
            }}
          >
            <tool.icon
              fill={
                index == presence.cursor.toolIndex
                  ? "transparent"
                  : "transparent"
              }
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default Toolbar;
