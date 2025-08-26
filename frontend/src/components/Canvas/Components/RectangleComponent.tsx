import { Input } from "@/components/shadcn/ui/input";
import type { ComponentDefinition } from "./ComponentRegistry";
import { Label } from "@radix-ui/react-label";
import { Slider } from "@/components/shadcn/ui/slider";

export const RectangleComponent: ComponentDefinition = {
  render: ({ obj, transform }) => {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: obj.props?.color,
          borderRadius: `${obj.props?.borderRadius * transform.scale}px`,
          opacity: obj.props?.opacity / 100,
        }}
      />
    );
  },
  editor: ({ props, onChange }) => (
    <>
      <div className="flex flex-row justify-between gap-2 items-center">
        <Label>Color</Label>
        <Input
          type="color"
          value={props?.color}
          onChange={(e) => onChange({ color: e.target.value })}
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
        <Label>Opacity</Label>
        <Slider
          value={[props?.opacity ?? 100]}
          onValueChange={(value) => onChange({ opacity: value[0] })}
          max={100}
          step={1}
        />
        <p>{props?.opacity ?? 100}%</p>
      </div>
    </>
  ),
  defaultProps: {
    color: "#525252",
    borderRadius: 8,
    opacity: 100,
  },
};
