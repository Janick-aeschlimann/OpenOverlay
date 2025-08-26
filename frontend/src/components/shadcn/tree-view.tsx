import React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronRight } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Separator } from "./ui/separator";
import { type HierarchyItem } from "@/types/types";

const treeVariants = cva(
  "group hover:before:opacity-100 before:absolute before:rounded-lg before:left-0 px-2 before:w-full before:opacity-0 before:bg-accent/70 before:h-[2rem] before:-z-10"
);

const selectedTreeVariants = cva(
  "before:opacity-100 before:bg-accent/70 text-accent-foreground"
);

const dragOverVariants = cva(
  "before:opacity-100 before:bg-primary/20 text-primary-foreground"
);

const icon = null;
const selectedIcon = null;
const openIcon = null;

// interface TreeDataItem {
//   id: string;
//   name: string;
//   icon?: any;
//   selectedIcon?: any;
//   openIcon?: any;
//   children?: TreeDataItem[];
//   actions?: React.ReactNode;
//   onClick?: () => void;
//   draggable?: boolean;
//   droppable?: boolean;
//   disabled?: boolean;
// }

type TreeProps = React.HTMLAttributes<HTMLDivElement> & {
  selectedObjectId: string | null;
  data: HierarchyItem;
  parent: HierarchyItem;
  initialSelectedItemId?: string;
  onSelectChange?: (item: HierarchyItem | undefined) => void;
  expandAll?: boolean;
  defaultNodeIcon?: any;
  defaultLeafIcon?: any;
  onDocumentDrag?: (
    sourceItem: HierarchyItem,
    targetItem: HierarchyItem,
    index: number
  ) => void;
};

const TreeView = React.forwardRef<HTMLDivElement, TreeProps>(
  (
    {
      selectedObjectId,
      data,
      parent,
      initialSelectedItemId,
      onSelectChange,
      expandAll,
      defaultLeafIcon,
      defaultNodeIcon,
      className,
      onDocumentDrag,
      ...props
    },
    ref
  ) => {
    const [draggedItem, setDraggedItem] = React.useState<HierarchyItem | null>(
      null
    );

    const handleSelectChange = React.useCallback(
      (item: HierarchyItem | undefined) => {
        if (onSelectChange) {
          onSelectChange(item);
        }
      },
      [onSelectChange]
    );

    const handleDragStart = React.useCallback((item: HierarchyItem) => {
      setDraggedItem(item);
    }, []);

    const handleDrop = React.useCallback(
      (parentItem: HierarchyItem, index: number) => {
        if (draggedItem && onDocumentDrag && draggedItem.id !== parentItem.id) {
          onDocumentDrag(draggedItem, parentItem, index);
        }
        setDraggedItem(null);
        handleSelectChange(draggedItem ?? undefined);
        if (!expandedItemIds.find((id) => id == parentItem.id)) {
          expandedItemIds.push(parentItem.id);
        }
      },
      [draggedItem, onDocumentDrag]
    );

    const expandedItemIds = React.useMemo(() => {
      if (!initialSelectedItemId) {
        return [] as string[];
      }

      const ids: string[] = [];

      function walkTreeItems(
        items: HierarchyItem[] | HierarchyItem,
        targetId: string
      ) {
        if (items instanceof Array) {
          for (let i = 0; i < items.length; i++) {
            ids.push(items[i]!.id);
            if (walkTreeItems(items[i]!, targetId) && !expandAll) {
              return true;
            }
            if (!expandAll) ids.pop();
          }
        } else if (!expandAll && items.id === targetId) {
          return true;
        } else if (items.children) {
          return walkTreeItems(items.children, targetId);
        }
      }

      walkTreeItems(data, initialSelectedItemId);
      return ids;
    }, [data, expandAll, initialSelectedItemId]);

    return (
      <div className={cn("overflow-hidden relative p-2", className)}>
        <TreeItem
          data={data.children ?? []}
          parent={parent}
          ref={ref}
          selectedObjectId={selectedObjectId}
          handleSelectChange={handleSelectChange}
          expandedItemIds={expandedItemIds}
          defaultLeafIcon={defaultLeafIcon}
          defaultNodeIcon={defaultNodeIcon}
          handleDragStart={handleDragStart}
          handleDrop={handleDrop}
          draggedItem={draggedItem}
          {...props}
        />
      </div>
    );
  }
);
TreeView.displayName = "TreeView";

type TreeItemProps = Omit<TreeProps, "data"> & {
  data: HierarchyItem[] | HierarchyItem;
  parent: HierarchyItem;
  handleSelectChange: (item: HierarchyItem | undefined) => void;
  expandedItemIds: string[];
  defaultNodeIcon?: any;
  defaultLeafIcon?: any;
  handleDragStart?: (item: HierarchyItem) => void;
  handleDrop?: (item: HierarchyItem, index: number) => void;
  draggedItem: HierarchyItem | null;
};

const DropZoneBetween = ({
  handleDrop,
  parentItem,
  index,
}: {
  handleDrop?: (item: HierarchyItem, index: number) => void;
  parentItem: HierarchyItem;
  index: number;
}) => {
  const [isDragOver, setIsDragOver] = React.useState<boolean>(false);
  return (
    <div
      className="py-1"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        handleDrop?.(parentItem, index);
      }}
    >
      <Separator
        style={{
          height: "3px",
          backgroundColor: isDragOver ? "white" : "transparent",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

const TreeItem = React.forwardRef<HTMLDivElement, TreeItemProps>(
  (
    {
      className,
      data,
      parent,
      selectedObjectId,
      handleSelectChange,
      expandedItemIds,
      defaultNodeIcon,
      defaultLeafIcon,
      handleDragStart,
      handleDrop,
      draggedItem,
      ...props
    },
    ref
  ) => {
    if (!(data instanceof Array)) {
      data = [data];
    }

    return (
      <div ref={ref} role="tree" className={className} {...props}>
        <ul>
          <DropZoneBetween
            parentItem={parent}
            index={0}
            handleDrop={handleDrop}
          />
          {data.map((item, index) => (
            <li key={item.id}>
              {item.children && item.children.length > 0 ? (
                <>
                  <TreeNode
                    item={item}
                    parent={parent}
                    selectedObjectId={selectedObjectId}
                    expandedItemIds={expandedItemIds}
                    handleSelectChange={handleSelectChange}
                    defaultNodeIcon={defaultNodeIcon}
                    defaultLeafIcon={defaultLeafIcon}
                    handleDragStart={handleDragStart}
                    handleDrop={handleDrop}
                    draggedItem={draggedItem}
                  />
                  <DropZoneBetween
                    parentItem={parent}
                    index={index + 1}
                    handleDrop={handleDrop}
                  />
                </>
              ) : (
                <>
                  <TreeLeaf
                    item={item}
                    selectedObjectId={selectedObjectId}
                    handleSelectChange={handleSelectChange}
                    defaultLeafIcon={defaultLeafIcon}
                    handleDragStart={handleDragStart}
                    handleDrop={handleDrop}
                    draggedItem={draggedItem}
                  />
                  <DropZoneBetween
                    parentItem={parent}
                    index={index + 1}
                    handleDrop={handleDrop}
                  />
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }
);
TreeItem.displayName = "TreeItem";

const TreeNode = ({
  item,
  handleSelectChange,
  expandedItemIds,
  selectedObjectId,
  defaultNodeIcon,
  defaultLeafIcon,
  handleDragStart,
  handleDrop,
  draggedItem,
}: {
  item: HierarchyItem;
  parent: HierarchyItem;
  handleSelectChange: (item: HierarchyItem | undefined) => void;
  expandedItemIds: string[];
  selectedObjectId: string | null;
  defaultNodeIcon?: any;
  defaultLeafIcon?: any;
  handleDragStart?: (item: HierarchyItem) => void;
  handleDrop?: (item: HierarchyItem, index: number) => void;
  draggedItem: HierarchyItem | null;
}) => {
  const [value, setValue] = React.useState(
    expandedItemIds.includes(item.id) ? [item.id] : []
  );
  const [isDragOver, setIsDragOver] = React.useState(false);

  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", item.id);
    handleDragStart?.(item);
    setValue([]);
  };

  const onDragOver = (e: React.DragEvent) => {
    if (draggedItem && draggedItem.id !== item.id) {
      e.preventDefault();
      setIsDragOver(true);
    }
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleDrop?.(item, -1);
  };

  return (
    <AccordionPrimitive.Root
      type="multiple"
      value={value}
      onValueChange={(s) => setValue(s)}
    >
      <AccordionPrimitive.Item value={item.id}>
        <AccordionTrigger
          className={cn(
            treeVariants(),
            selectedObjectId === item.id && selectedTreeVariants(),
            isDragOver && dragOverVariants()
          )}
          onClick={() => {
            handleSelectChange(item);
          }}
          draggable={true}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <TreeIcon
            isSelected={selectedObjectId === item.id}
            isOpen={value.includes(item.id)}
            default={defaultNodeIcon}
          />
          <span className="text-sm truncate pointer-events-none">
            {item.name}
          </span>
        </AccordionTrigger>
        <AccordionContent className="ml-4 pl-1 border-l">
          <TreeItem
            parent={item}
            data={item.children ? item.children : item}
            selectedObjectId={selectedObjectId}
            handleSelectChange={handleSelectChange}
            expandedItemIds={expandedItemIds}
            defaultLeafIcon={defaultLeafIcon}
            defaultNodeIcon={defaultNodeIcon}
            handleDragStart={handleDragStart}
            handleDrop={handleDrop}
            draggedItem={draggedItem}
          />
        </AccordionContent>
      </AccordionPrimitive.Item>
    </AccordionPrimitive.Root>
  );
};

const TreeLeaf = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    item: HierarchyItem;
    selectedObjectId: string | null;
    handleSelectChange: (item: HierarchyItem | undefined) => void;
    defaultLeafIcon?: any;
    handleDragStart?: (item: HierarchyItem) => void;
    handleDrop?: (item: HierarchyItem, index: number) => void;
    draggedItem: HierarchyItem | null;
  }
>(
  (
    {
      className,
      item,
      selectedObjectId,
      handleSelectChange,
      defaultLeafIcon,
      handleDragStart,
      handleDrop,
      draggedItem,
      ...props
    },
    ref
  ) => {
    const [isDragOver, setIsDragOver] = React.useState(false);

    const onDragStart = (e: React.DragEvent) => {
      e.dataTransfer.setData("text/plain", item.id);
      handleDragStart?.(item);
    };

    const onDragOver = (e: React.DragEvent) => {
      if (draggedItem && draggedItem.id !== item.id) {
        e.preventDefault();
        setIsDragOver(true);
      }
    };

    const onDragLeave = () => {
      setIsDragOver(false);
    };

    const onDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleDrop?.(item, -1);
    };

    return (
      <div
        ref={ref}
        className={cn(
          "ml-5 flex text-left items-center py-1 cursor-pointer before:right-1",
          treeVariants(),
          className,
          selectedObjectId === item.id && selectedTreeVariants(),
          isDragOver && dragOverVariants()
        )}
        onClick={() => {
          handleSelectChange(item);
        }}
        draggable={true}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        {...props}
      >
        <TreeIcon
          isSelected={selectedObjectId === item.id}
          default={defaultLeafIcon}
        />
        <span className="flex-grow text-sm truncate pointer-events-none">
          {item.name}
        </span>
      </div>
    );
  }
);
TreeLeaf.displayName = "TreeLeaf";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header>
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 w-full items-center py-1 transition-all first:[&[data-state=open]>svg]:rotate-90",
        className
      )}
      {...props}
    >
      <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200 text-accent-foreground/50 mr-1" />
      {children}
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      "overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
      className
    )}
    {...props}
  >
    <div className="pt-0">{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

const TreeIcon = ({
  isOpen,
  isSelected,
  default: defaultIcon,
}: {
  isOpen?: boolean;
  isSelected?: boolean;
  default?: any;
}) => {
  let Icon = defaultIcon;
  if (isSelected && selectedIcon) {
    Icon = selectedIcon;
  } else if (isOpen && openIcon) {
    Icon = openIcon;
  } else if (icon) {
    Icon = icon;
  }
  return Icon ? (
    <Icon className="h-4 w-4 shrink-0 mr-2 pointer-events-none" />
  ) : (
    <></>
  );
};

// const TreeActions = ({
//   children,
//   isSelected,
// }: {
//   children: React.ReactNode;
//   isSelected: boolean;
// }) => {
//   return (
//     <div
//       className={cn(
//         isSelected ? "block" : "hidden",
//         "absolute right-3 group-hover:block"
//       )}
//     >
//       {children}
//     </div>
//   );
// };

export { TreeView };
