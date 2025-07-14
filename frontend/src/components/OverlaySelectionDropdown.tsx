import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { Button } from "./shadcn/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./shadcn/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./shadcn/ui/command";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { GetAPI } from "@/services/RequestService";
import { useWorkspaceStore } from "@/store/workspace";

interface OverlaySelectionDropdownProps {
  onChange?: (overlayId: number | null) => void;
}

const OverlaySelectionDropdown: React.FC<OverlaySelectionDropdownProps> = (
  props
) => {
  const [open, setOpen] = React.useState(false);
  const [overlayId, setOverlayId] = React.useState<number | null>(null);

  const [overlays, setOverlays] = useState<Array<any>>([]);
  const { activeWorkspace } = useWorkspaceStore();

  const fetchOverlays = async () => {
    const response = await GetAPI(
      `/workspace/${activeWorkspace?.workspaceId}/overlay`
    );
    if (response.success) {
      console.log(response.data);
      setOverlays(response.data);
    }
  };

  useEffect(() => {
    if (activeWorkspace) {
      fetchOverlays();
    }
  }, [activeWorkspace]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {overlayId
            ? overlays.find((overlay) => overlay.overlayId === overlayId)?.name
            : "Select Overlay..."}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search Overlay..." />
          <CommandList>
            <CommandEmpty>No Overlays found.</CommandEmpty>
            <CommandGroup>
              {overlays.map((overlay) => (
                <CommandItem
                  key={overlay.overlayId}
                  value={overlay.overlayId}
                  onSelect={() => {
                    setOverlayId(
                      overlay.overlayId == overlayId ? null : overlay.overlayId
                    );
                    props.onChange?.(
                      overlay.overlayId == overlayId ? null : overlay.overlayId
                    );
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      overlayId === overlay.overlayId
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {overlay.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default OverlaySelectionDropdown;
