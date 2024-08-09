import p5 from "p5";
import CanvasOperations from "./operations";
import Stroke from "./stroke";
import Canvas from "./canvas";

// user
// canvas-id
// user currently painting
//anonymous collaborative artwork
//every save goes to data base

export default class CanvasDisplay {
  private p: p5;
  private static instance: CanvasDisplay;
  static getInstance() {
    if (!this.instance) {
      this.instance = new CanvasDisplay("g-0");
    }
    return this.instance;
  }

  private constructor(id: string) {
    this.p = new p5((p: p5) => {
      const container = document.getElementById(id);
      if (container) {
        p.setup = () => {
          const width = 350;
          const heightRatio = 0.69;
          const scaleFaction = 0.3125;
          p.createCanvas(width, width * heightRatio).parent(container);
          p.background(200, 200, 200);
          p.scale(scaleFaction);
        };
      }
    });
  }

  // liveDisplay(stroke: Stroke) {
  //   const canvas = Canvas.getInstance();
  //   canvas.spray(this.p, stroke);
  // }
}
