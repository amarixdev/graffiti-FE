import p5 from "p5";
import { Socket } from "socket.io-client";
import Stroke from "./stroke";

export default class Canvas {
  #socket: Socket;
  #p: p5;
  #canvasDimensions: number = 800;
  //the artist tag
  #tag: Array<Stroke> = new Array();

  constructor(socket: Socket) {
    this.#socket = socket;
    this.#p = new p5(this.#init);
  }

  //broadcast live paint stroke from websocket server data
  broadcast(data: Stroke) {
    this.#p.noStroke();
    this.#p.fill(255);
    this.#p.ellipse(data.x, data.y, 30, 30);
  }

  loadCanvas(data: Array<Stroke>) {
    data.forEach((stroke) => {
      this.#p.noStroke();
      this.#p.fill(255);
      this.#p.ellipse(stroke.x, stroke.y, 30, 30);
    });
  }

  save() {
    this.#socket.emit("save", this.#tag);
  }

  load() {
    this.#socket.emit("load");
  }

  #init = (p: p5) => {
    //setup canvas (will eventually switch to 3js)
    p.setup = () => {
      p.createCanvas(this.#canvasDimensions, this.#canvasDimensions);
      p.background(51);
    };

    //handlePainting
    p.mouseDragged = () => {
      const color = {
        r: 70,
        g: 45,
        b: 138,
      };
      const strokeWidth = 30;

      p.noStroke();
      p.fill(color.r, color.g, color.b);
      p.ellipse(p.mouseX, p.mouseY, strokeWidth, strokeWidth);

      const colorString = `rgb(${color.r}, ${color.g}, ${color.b})`;

      const strokeMessage: Stroke = {
        x: p.mouseX,
        y: p.mouseY,
        color: colorString,
        size: strokeWidth,
      };
      //send paint stroke to server
      this.#socket.emit("stroke", strokeMessage);
      //create tag to save work
      this.#tag.push(strokeMessage);
    };
  };
}
