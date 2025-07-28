import { Input } from "@/components/shadcn/ui/input";
import type { ComponentDefinition } from "./ComponentRegistry";
import { Label } from "@radix-ui/react-label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";

export const ImageComponent: ComponentDefinition = {
  render: (obj) => {
    return (
      <div
        style={{
          borderRadius: `${obj.props?.borderRadius}px`,
          overflow: "hidden",
          height: "100%",
          width: "100%",
        }}
      >
        <img
          className="pointer-events-none"
          src={obj.props?.url}
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: obj.props?.color,
            objectFit: obj.props?.objectFit,
          }}
        />
      </div>
    );
  },
  editor: ({ props, onChange }) => (
    <>
      <div className="flex flex-row justify-between gap-2 items-center">
        <Label>URL</Label>
        <Input
          type="text"
          value={props?.url}
          onChange={(e) => onChange({ url: e.target.value })}
        />
      </div>
      <div className="flex flex-row justify-between gap-2 items-center">
        <Label className=" text-nowrap">Border Radius</Label>
        <Input
          type="number"
          value={props?.borderRadius}
          onChange={(e) =>
            onChange({ borderRadius: parseInt(e.target.value) || 0 })
          }
        />
      </div>
      <div className="flex flex-row justify-between gap-2 items-center">
        <Label>Object Fit</Label>
        <Select
          value={props?.objectFit}
          onValueChange={(value) => onChange({ objectFit: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Object Fit" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Object Fit</SelectLabel>
              <SelectItem value="fill">Fill</SelectItem>
              <SelectItem value="contain">Contain</SelectItem>
              <SelectItem value="cover">Cover</SelectItem>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="scale-down">Scale Down</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </>
  ),
  defaultProps: {
    url: "",
    borderRadius: 8,
    objectFit: "scale-down",
  },
};
