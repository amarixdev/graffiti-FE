export class PaintStrokes extends Array {
  private originalStrokes: Array<Stroke> = new Array();
  private newStrokes: Array<Array<Stroke>> = new Array();
  private overlapsRemoved: number = 0;
  private duplicatesRemoved: number = 0;
  setOriginal(paintStrokes: Array<Stroke>): void {
    this.originalStrokes = this.removeDuplicates(paintStrokes);
  }

  insertNew(paintStrokes: Array<Stroke>): void {
    this.newStrokes.push(this.removeDuplicates(paintStrokes));
  }

  get(): Array<Stroke> {
    this.originalStrokes = this.removeOverlaps();
    const result = [...this.originalStrokes, ...this.newStrokes.flat()];
    this.debugLogger(result);

    return result;
  }

  reset(): void {
    this.originalStrokes = new Array();
    this.newStrokes = new Array();
  }

  private debugLogger(result: Stroke[]) {
    console.log("strokes removed: " + this.overlapsRemoved);
    console.log("strokes add: " + this.newStrokes.flat().length);
    console.log("total: " + result.length);

    console.log("duplicates removed:" + this.duplicatesRemoved);
  }

  private removeDuplicates(paintStrokes: Array<Stroke>): Array<Stroke> {
    const pre = paintStrokes.length;
    const seen = new Set();
    const uniqueTags = paintStrokes.filter((stroke) => {
      const key = `${stroke.x},${stroke.y}`;
      if (seen.has(key)) {
        return false;
      } else {
        seen.add(key);
        return true;
      }
    });
    const post = uniqueTags.length;
    this.duplicatesRemoved += pre - post;
    return uniqueTags;
  }

  private removeOverlaps(): Array<Stroke> {
    return this.originalStrokes.filter((os: Stroke) => {
      return !this.newStrokes.flat().some((ns: Stroke) => {
        const isClose =
          Math.abs(os.x - ns.x) <= 4 && Math.abs(os.y - ns.y) <= 4;
        if (isClose) {
          this.overlapsRemoved++;
        }
        return isClose;
      });
    });
  }
}

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
