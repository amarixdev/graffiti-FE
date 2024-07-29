export default class Stroke {
  x: number;
  y: number;
  px: number;
  py: number;
  color: string;
  size: number;

  constructor(
    x: number,
    y: number,
    px: number,
    py: number,
    color: string,
    size: number
  ) {
    this.x = x;
    this.y = y;
    this.px = px;
    this.py = py;
    this.color = color;
    this.size = size;
  }
}
