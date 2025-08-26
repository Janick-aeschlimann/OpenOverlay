import { cn } from "@/lib/utils";
import { Separator } from "../shadcn/ui/separator";
import { TreeView } from "@/components/shadcn/tree-view";
import { useCanvasStore } from "@/store/canvas";

export interface IHierarchysProps {
  open: boolean;
  overlayId: number;
}

const Hierarchy: React.FC<IHierarchysProps> = (props) => {
  const {
    hierarchy,
    moveHierarchyItem,
    setSelectedCanvasObjectId,
    selectedCanvasObjectId,
  } = useCanvasStore(props.overlayId);

  return (
    <>
      <div
        className={cn(
          "h-full flex flex-row transition-all duration-500 overflow-hidden",
          props.open ? "w-[25%]" : "w-0"
        )}
      >
        <div className="w-full h-full bg-[#1d1d1d] border-r-1 border-[#505050] backdrop-blur-xl z-[51] flex flex-col items-start justify-start gap-3 p-5 ">
          <h1 className="text-2xl font-semibold">Hierarchy</h1>
          <Separator className="border-1" />
          <TreeView
            className="w-full"
            parent={{ id: "root", name: "root" }}
            data={hierarchy}
            onSelectChange={(item) =>
              setSelectedCanvasObjectId(item?.id ?? null)
            }
            selectedObjectId={selectedCanvasObjectId}
            onDocumentDrag={(source, target, index) => {
              console.log(`${source.id} -> ${target.id} [${index}]`);
              moveHierarchyItem(source.id, target.id, index);
            }}
          />
        </div>
      </div>
    </>
  );
};

export default Hierarchy;
