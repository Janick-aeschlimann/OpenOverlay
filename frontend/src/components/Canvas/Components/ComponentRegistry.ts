import type { CanvasObject } from "@/types/types";
import type { ReactNode } from "react";
import { RectangleComponent } from "./RectangleComponent";
import { EllipseComponent } from "./EllipseComponent";
import { ImageComponent } from "./ImageComponent";
import { TextComponent } from "./TextComponent";
import { EmbedComponent } from "./EmbedComponent";

export interface ComponentDefinition {
  render: (props: {
    obj: CanvasObject;
    transform: { scale: number };
  }) => ReactNode;
  editor: React.FC<{ props: any; onChange: (newProps: any) => void }>;
  defaultProps: any;
}

export const componentRegistry: Record<string, ComponentDefinition> = {
  rectangle: RectangleComponent,
  ellipse: EllipseComponent,
  image: ImageComponent,
  text: TextComponent,
  embed: EmbedComponent,
};

export interface Rectangle extends CanvasObject {
  type: "rectangle";
  props: {
    color: string;
    borderRadius: number;
  };
}

export interface Ellipse extends CanvasObject {
  type: "ellipse";
  props: {
    color: string;
  };
}

export interface Image extends CanvasObject {
  type: "image";
  props: {
    url: string;
    borderRadius: number;
    objectFit: string;
    opacity: number;
  };
}

export interface Text extends CanvasObject {
  type: "text";
  props: {
    text: string;
    fontSize: number;
    color: string;
  };
}
