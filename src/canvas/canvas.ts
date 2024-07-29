import p5 from "p5";
import { Socket } from "socket.io-client";
import Stroke from "./stroke";
import HelperFunctions from "../util/functions";

export default class Canvas {
  #socket: Socket;
  #p: p5;
  #tag: Array<Stroke> = new Array();
  #color: Array<number> = [255, 255, 255];
  #weight: number = 5;
  #scaleFactor: number = 0.5;
  #offsetX: number = 0;
  #offsetY: number = 0;
  #previousState: Array<Stroke> = new Array();

  constructor(socket: Socket) {
    this.#socket = socket;
    this.#p = new p5(this.#init);
  }

  setPreviousState(tag: Array<Stroke>) {
    this.#previousState = tag;
  }

  setColor(rgb: Array<number>) {
    this.#color = rgb;
  }

  setWeight(weight: number) {
    this.#weight = weight;
  }

  setScaleFactor(zoom: string) {
    const maxScale = 1.0;
    const minScale = 0.05;
    if (zoom == "out") {
      if (this.#scaleFactor == minScale) return;
      this.#scaleFactor = Math.max(this.#scaleFactor - 0.1, minScale);
    }
    if (zoom == "in") {
      if (this.#scaleFactor == maxScale) return;
      this.#scaleFactor = Math.min(this.#scaleFactor + 0.1, maxScale);
    }
    this.clear();
    this.#p.redraw();
  }

  //broadcast live paint stroke from websocket server data
  broadcast(stroke: Stroke) {
    const rgb = HelperFunctions.stringToRGB(stroke.color);
    this.#spray(stroke.x, stroke.y, rgb, stroke.size);
  }

  //recreate canvas from provided Stroke values
  loadCanvas(data: Array<Stroke>) {
    console.log("canvas loaded");
    data.forEach((stroke) => {
      const rgb = HelperFunctions.stringToRGB(stroke.color);
      this.#spray(stroke.x, stroke.y, rgb, stroke.size);
    });
  }
  //send local painting to server for storage
  save() {
    this.#socket.emit("save", this.#tag);
  }

  //clear canvas pixels, reset background
  clear() {
    this.#p.clear();
    this.#p.background(51);
  }

  #init = (p: p5) => {
    const container = document.getElementById("canvas-container");
    if (container) {
      p.setup = () => {
        p.createCanvas(p.windowWidth * 5, p.windowHeight * 5).parent(
          "canvas-container"
        );
        p.background(51);
        p.noLoop();
      };
    }
    p.draw = () => {
      console.log("running");
      p.translate(this.#offsetX, this.#offsetY);
      p.scale(this.#scaleFactor);
      this.loadCanvas(this.#tag);
      this.loadCanvas(this.#previousState);
    };

    // handlePainting
    p.mouseDragged = () => {
      const rgb = this.#color;
      const colorString = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
      let xPos = (p.mouseX - this.#offsetX) / this.#scaleFactor;
      let yPos = (p.mouseY - this.#offsetY) / this.#scaleFactor;

      const strokeMessage: Stroke = {
        x: xPos,
        y: yPos,
        color: colorString,
        size: this.#weight,
      };

      this.#spray(xPos, yPos, rgb, this.#weight);
      this.#publishToServer(strokeMessage);
    };
  };

  //spray paint simulation
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

  //live update websockets server with real-time paint strokes
  #publishToServer(strokeMessage: Stroke) {
    //send paint stroke to server
    this.#socket.emit("stroke", strokeMessage);
    //create tag to save work
    this.#tag.push(strokeMessage);
  }
}
