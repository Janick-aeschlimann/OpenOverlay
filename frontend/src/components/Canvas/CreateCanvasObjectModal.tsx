import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/shadcn/ui/command";
import { useCanvasStore } from "@/store/canvas";
import { Circle, Image, Square } from "lucide-react";
import { componentRegistry } from "./Components/ComponentRegistry";
import type { CanvasObject } from "@/types/types";

export interface ICreateCanvasModalProps {
  overlayId: number;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const CreateCanvasObjectModal: React.FC<ICreateCanvasModalProps> = (props) => {
  const { addCanvasObject } = useCanvasStore(props.overlayId);

  const createCanvasObject = (type: string) => {
    if (componentRegistry[type]) {
      const newCanvasObject: CanvasObject = {
        id: "",
        x: 0,
        y: 0,
        width: 200,
        height: 200,
        rotation: 0,
        type: type,
        props: componentRegistry[type].defaultProps,
      };
      addCanvasObject(newCanvasObject);
      props.setIsOpen(false);
    }
  };

  return (
    <>
      <CommandDialog
        open={props.isOpen}
        onOpenChange={props.setIsOpen}
        className="rounded-lg border shadow-md md:min-w-[450px]"
      >
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Components">
            <CommandItem onSelect={() => createCanvasObject("rectangle")}>
              <Square />
              <span>Rectangle</span>
            </CommandItem>
            <CommandItem onSelect={() => createCanvasObject("ellipse")}>
              <Circle />
              <span>Ellipse</span>
            </CommandItem>
            <CommandItem onSelect={() => createCanvasObject("image")}>
              <Image />
              <span>Image</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default CreateCanvasObjectModal;
