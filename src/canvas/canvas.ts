import p5 from "p5";
import { Socket } from "socket.io-client";
import Stroke from "./stroke";
import HelperFunctions from "../util/functions";

export default class Canvas {
  #socket: Socket;
  #p: p5;
  #tag: Array<Stroke> = new Array();
  #color: Array<number> = [0, 0, 0];
  #weight: number = 5;

  constructor(socket: Socket) {
    this.#socket = socket;
    this.#p = new p5(this.#init);
  }

  setColor(rgb: Array<number>) {
    this.#color = rgb;
  }

  setWeight(weight: number) {
    this.#weight = weight;
  }

  //broadcast live paint stroke from websocket server data
  broadcast(stroke: Stroke) {
    const rgb = HelperFunctions.stringToRGB(stroke.color);
    this.#spray(stroke.x, stroke.y, rgb, stroke.size);
  }

  loadCanvas(data: Array<Stroke>) {
    data.forEach((stroke) => {
      const rgb = HelperFunctions.stringToRGB(stroke.color);
      this.#spray(stroke.x, stroke.y, rgb, stroke.size);
    });
  }

  save() {
    this.#socket.emit("save", this.#tag);
  }

  clear() {
    this.#p = new p5(this.#init);
  }

  #init = (p: p5) => {
    p.setup = () => {
      p.createCanvas(800, 800);
      p.background(51);
    };

    //handlePainting
    p.mouseDragged = () => {
      const rgb = this.#color;
      const colorString = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
      const strokeMessage: Stroke = {
        x: p.mouseX,
        y: p.mouseY,
        color: colorString,
        size: this.#weight,
      };

      this.#spray(p.mouseX, p.mouseY, rgb, this.#weight);
      this.#sendToServer(strokeMessage);
    };
  };

  #spray(x: number, y: number, color: number[], size: number) {
    let p = this.#p;
    let density = 50;
    for (let i = 0; i < density; i++) {
      let angle = p.random(p.TWO_PI);
      let radius = p.random(0, 12);
      let offsetX = p.cos(angle) * radius;
      let offsetY = p.sin(angle) * radius;
      let alpha = p.map(radius, 0, 20, 255, 0);
      p.noStroke();
      p.fill(color[0], color[1], color[2], alpha);
      p.ellipse(x + offsetX, y + offsetY, size, size);
    }
  }

  #sendToServer(strokeMessage: Stroke) {
    //send paint stroke to server
    this.#socket.emit("stroke", strokeMessage);
    //create tag to save work
    this.#tag.push(strokeMessage);
  }
}
