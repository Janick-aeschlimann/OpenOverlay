import { Input } from "@/components/shadcn/ui/input";
import type { ComponentDefinition } from "./ComponentRegistry";
import { Label } from "@radix-ui/react-label";
import { Textarea } from "@/components/shadcn/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";
import "@/styles/fonts.css";

const fontFamilies = [
  { label: "Roboto", value: "Roboto, sans-serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Times New Roman", value: "'Times New Roman', serif" },
  { label: "Courier New", value: "'Courier New', monospace" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },
  { label: "Comic Sans MS", value: "'Comic Sans MS', cursive" },
  { label: "Impact", value: "Impact, sans-serif" },
  { label: "Lucida Console", value: "'Lucida Console', monospace" },
];

export const TextComponent: ComponentDefinition = {
  render: ({ obj, transform, onChange }) => {
    return (
      <div
        style={{
          overflow: "hidden",
          height: "100%",
          width: "100%",
          fontSize: obj.props?.fontSize * transform.scale,
          fontWeight: obj.props?.fontWeight,
          fontFamily: obj.props?.fontFamily,
          color: obj.props?.color,
          padding: transform.scale * 15 + "px",
        }}
      >
        <textarea
          style={{
            maxWidth: "100%",
            resize: "none",
            width: "100%",
            height: "100%",
            outline: "none",
            border: "none",
            overflow: "hidden",
          }}
          onChange={(e) => {
            onChange?.({ text: e.target.value });
          }}
          value={obj.props?.text}
        ></textarea>
      </div>
    );
  },
  editor: ({ props, onChange }) => (
    <>
      <div className="flex flex-col justify-between gap-2 items-start">
        <Label>Text</Label>
        <Textarea
          value={props?.text}
          onChange={(e) => onChange({ text: e.target.value })}
        />
      </div>
      <div className="flex flex-row justify-between gap-2 items-center">
        <Label className=" text-nowrap">Font Size</Label>
        <Input
          type="number"
          value={props?.fontSize}
          onChange={(e) =>
            onChange({ fontSize: parseInt(e.target.value) || 0 })
          }
        />
      </div>
      <div className="flex flex-row justify-between gap-2 items-center">
        <Label>Font Weight</Label>
        <Select
          value={props?.fontWeight ?? 400}
          onValueChange={(value) => onChange({ fontWeight: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Font Weight" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Font Weight</SelectLabel>
              <SelectItem value="100">Thin</SelectItem>
              <SelectItem value="200">Extra Light</SelectItem>
              <SelectItem value="300">Light</SelectItem>
              <SelectItem value="400">Normal</SelectItem>
              <SelectItem value="500">Medium</SelectItem>
              <SelectItem value="600">Semi Bold</SelectItem>
              <SelectItem value="700">Bold</SelectItem>
              <SelectItem value="800">Extra Bold</SelectItem>
              <SelectItem value="900">Black</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-row justify-between gap-2 items-center">
        <Label>Font Family</Label>
        <Select
          value={props?.fontFamily ?? "Arial, sans-serif"}
          onValueChange={(value) => onChange({ fontFamily: value })}
        >
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Select Font Family" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Font Family</SelectLabel>
              {fontFamilies.map((font) => (
                <SelectItem
                  key={font.value}
                  value={font.value}
                  style={{ fontFamily: font.value }}
                >
                  {font.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-row justify-between gap-2 items-center">
        <Label>Color</Label>
        <Input
          type="color"
          value={props?.color}
          onChange={(e) => onChange({ color: e.target.value })}
        />
      </div>
    </>
  ),
  defaultProps: {
    text: "Text",
    fontSize: 32,
    fontWeight: "400",
    fontFamily: "Roboto, sans-serif",
    color: "#ffffff",
  },
};
