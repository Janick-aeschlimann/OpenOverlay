import { cn } from "@/lib/utils";
import { Separator } from "../shadcn/ui/separator";
import { TreeView, type TreeDataItem } from "@/components/shadcn/tree-view";

export interface IHierarchysProps {
  open: boolean;
}

const data: TreeDataItem[] = [
  {
    id: "1",
    name: "Item 1",
    draggable: true,
    children: [
      {
        id: "2",
        name: "Item 1.1",
        draggable: true,
        children: [
          {
            id: "3",
            name: "Item 1.1.1",
            draggable: true,
          },
          {
            id: "4",
            name: "Item 1.1.2",
            droppable: true,
            draggable: true,
          },
        ],
      },
      {
        id: "5",
        name: "Item 1.2 (disabled)",
        disabled: true,
      },
    ],
  },
  {
    id: "6",
    name: "Item 2 (draggable)",
    draggable: true,
  },
];

const Hierarchy: React.FC<IHierarchysProps> = (props) => {
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
            data={data}
            onDocumentDrag={(source, target) => {
              console.log(source, target);
            }}
          />
        </div>
      </div>
    </>
  );
};

export default Hierarchy;
