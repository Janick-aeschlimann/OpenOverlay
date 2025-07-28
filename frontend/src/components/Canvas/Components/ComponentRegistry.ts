import type { CanvasObject } from "@/types/types";
import type { ReactNode } from "react";
import { RectangleComponent } from "./RectangleComponent";
import { EllipseComponent } from "./EllipseComponent";
import { ImageComponent } from "./ImageComponent";

export interface ComponentDefinition {
  render: (obj: CanvasObject) => ReactNode;
  editor: React.FC<{ props: any; onChange: (newProps: any) => void }>;
  defaultProps: any;
}

export const componentRegistry: Record<string, ComponentDefinition> = {
  rectangle: RectangleComponent,
  ellipse: EllipseComponent,
  image: ImageComponent,
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
  type: "ellipse";
  props: {
    url: string;
    borderRadius: number;
    objectFit: string;
  };
}
