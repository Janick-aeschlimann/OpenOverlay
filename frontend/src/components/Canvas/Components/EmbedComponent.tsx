import { Input } from "@/components/shadcn/ui/input";
import type { ComponentDefinition } from "./ComponentRegistry";
import { Label } from "@radix-ui/react-label";
import { Slider } from "@/components/shadcn/ui/slider";

export const EmbedComponent: ComponentDefinition = {
  render: ({ obj, transform }) => {
    return (
      <iframe
        src={obj.props?.src}
        style={{
          width: obj.width / ((obj.props?.scale ?? 100) / 100),
          height: obj.height / ((obj.props?.scale ?? 100) / 100),
          backgroundColor: obj.props?.color,
          borderRadius: `${obj.props?.borderRadius}px`,
          opacity: obj.props?.opacity / 100,
          pointerEvents: "none",
          scale: transform.scale * ((obj.props?.scale ?? 100) / 100),
          transformOrigin: "top left",
          overflow: "hidden",
        }}
        scrolling="no"
      />
    );
  },
  editor: ({ props, onChange }) => (
    <>
      <div className="flex flex-row justify-between gap-2 items-center">
        <Label className="text-nowrap">src</Label>
        <Input
          type="text"
          value={props?.src}
          onChange={(e) => onChange({ src: e.target.value })}
        />
      </div>
      <div className="flex flex-row justify-between gap-2 items-center">
        <Label className="text-nowrap">Border Radius</Label>
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
          {...props}
        />
        <p>{props?.opacity ?? 100}%</p>
      </div>
      <div className="flex flex-row justify-between gap-2 items-center">
        <Label className="text-nowrap">Scale</Label>
        <Input
          type="number"
          value={props?.scale ?? 100}
          onChange={(e) => onChange({ scale: parseInt(e.target.value) || 0 })}
        />
        <p>%</p>
      </div>
    </>
  ),
  defaultProps: {
    src: "",
    borderRadius: 8,
    opacity: 100,
    scale: 100,
  },
};
