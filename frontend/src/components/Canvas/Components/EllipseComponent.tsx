import { Input } from "@/components/shadcn/ui/input";
import type { ComponentDefinition } from "./ComponentRegistry";
import { Label } from "@radix-ui/react-label";

export const EllipseComponent: ComponentDefinition = {
  render: (obj) => (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "100%",
        backgroundColor: obj.props?.color,
      }}
    />
  ),
  editor: ({ props, onChange }) => (
    <div className="flex flex-row justify-between items-center gap-2">
      <Label>Color</Label>
      <Input
        type="color"
        value={props.color}
        onChange={(e) => onChange({ color: e.target.value })}
      />
    </div>
  ),
  defaultProps: {
    color: "#525252",
  },
};
