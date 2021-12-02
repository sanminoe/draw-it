export interface Point {
  x: number;
  y: number;
  width?: number;
  height?: number;
  color?: string;
  size?: number;
  filled?: boolean;
}

export interface Shape {
  tool: string;
  points: Point[];
}
