import p5 from "p5";
import { Socket } from "socket.io-client";
import { BrushStroke } from "./util/types";

export default class Sketch {
  #socket: Socket;
  #p: p5;
  constructor(socket: Socket) {
    this.#socket = socket;
    this.#p = new p5(this.#init);
  }

  broadcast(data: BrushStroke) {
    console.log(data);
    this.#p.noStroke();
    this.#p.fill(255);
    this.#p.ellipse(data.xPos, data.yPos, 30, 30);
  }

  #init = (p: p5) => {
    p.setup = () => {
      p.createCanvas(800, 800);
      p.background(51);
    };

    //handlePainting
    p.mouseDragged = () => {
      p.noStroke();
      p.fill(100);
      p.ellipse(p.mouseX, p.mouseY, 30, 30);

      const message: BrushStroke = { xPos: p.mouseX, yPos: p.mouseY };
      this.#socket.emit("stroke", message);
    };
  };
}
