import p5 from "p5";
import { Socket } from "socket.io-client";
import Stroke from "./stroke";
import Paint from "../util/paint";
import SocketHandler from "../socket-handler";
import { Button, Page, SocketType } from "../util/enums";
import Interface from "../interface";
import SessionManager from "../session";

export default class Canvas {
  private socket: Socket;
  private p: p5;
  private tag: Array<Stroke> = new Array();
  private paintStrokes: Array<Array<Stroke>> = new Array();
  private paintStroke: Array<Stroke> = new Array();
  private isPainting: boolean = false;
  private color: Array<number> = [255, 255, 255];
  private weight: number = 5;
  private prevX: number = 0;
  private prevY: number = 0;
  private interface: Interface = new Interface();

  private constructor(socket: Socket) {
    this.socket = socket;
    this.p = new p5(this.init);
  }

  //ensure a single instance of the socket is created
  private static instance: Canvas;
  static getInstance() {
    if (!Canvas.instance) {
      Canvas.instance = new Canvas(SocketHandler.getInstance().getSocket());
    }
    return Canvas.instance;
  }

  setColor(rgb: Array<number>) {
    const colorPicker = document.getElementById(
      "color-picker"
    ) as HTMLInputElement;
    this.color = rgb;
    colorPicker.value = Paint.rgbToHex(this.color);
  }

  setWeight(weight: number) {
    this.weight = weight;
  }

  //broadcast live paint stroke from websocket server data
  broadcast(stroke: Stroke) {
    this.spray(stroke, SocketType.remote);
  }

  //recreate canvas from provided Stroke values
  loadCanvas(data: Array<Stroke>) {
    data.forEach((stroke) => {
      this.spray(stroke, SocketType.remote);
    });
  }

  //clear canvas pixels; reset background
  clear() {
    this.p.clear();
    this.p.background(200, 200, 200);
  }

  //send local painting to server for storage; reset current tag
  save() {
    const tag = this.paintStrokes.flat();
    this.socket.emit("save", tag);
    this.interface.saveBtn_toggle(Button.disabled);
    this.tag = [];

    SessionManager.getInstance().setPage(Page.community);
    new Interface().updatePageUI();
  }

  undo() {
    this.paintStrokes.pop();
    this.clear();
    //TODO: <!BUG!> deleting loaded data..
    this.paintStrokes.forEach((stroke) => {
      this.loadCanvas(stroke);
    });

    if (this.paintStrokes.length == 0) {
      this.interface.undoBtn_toggle(Button.disabled);
    }
  }

  private init = (p: p5) => {
    const container = document.getElementById("canvas-container");
    if (container) {
      p.setup = () => {
        p.createCanvas(container.offsetWidth, container.offsetHeight).parent(
          container
        );
        p.background(200, 200, 200);
      };
    }

    // p.windowResized = () => {
    //   const container = document.getElementById("canvas-container");
    //   if (container) {
    //     p.resizeCanvas(container.offsetWidth, container.offsetHeight);
    //   }
    // };

    p.draw = () => {
      // p.translate(this.offsetX, this.offsetY);

      const stroke: Stroke = {
        x: p.mouseX,
        y: p.mouseY,
        px: this.prevX,
        py: this.prevY,
        color: Paint.RGBToString(this.color),
        size: this.weight,
      };

      this.spray(stroke, SocketType.user);
    };

    //handles live stroke updates
    p.mouseDragged = () => {
      //enable save button
      if (this.tag.length == 0) {
        this.interface.saveBtn_toggle(Button.enabled);
        this.interface.undoBtn_toggle(Button.enabled);
      }
      const strokeMessage: Stroke = {
        x: p.mouseX,
        y: p.mouseY,
        px: this.prevX,
        py: this.prevY,
        color: Paint.RGBToString(this.color),
        size: this.weight,
      };
      this.publishToServer(strokeMessage);
    };

    p.keyTyped = () => {
      let key = p.key;
      Paint.colorSwitch(key);
    };
  };

  private spray(stroke: Stroke, type: SocketType) {
    let { x, y, px, py, size, color } = stroke;
    let p = this.p;
    let density = 50;

    let rgb = Paint.stringToRGB(color);

    // Store the previous mouse position
    if (!px || !py) {
      px = x;
      py = y;
    }

    // Calculate the distance between the current and previous positions
    let distance = p.dist(x, y, px, py);
    let steps = Math.ceil(distance / size);

    //spray-paint effect
    for (let i = 0; i < steps; i++) {
      let interX = p.lerp(px, x, i / steps);
      let interY = p.lerp(py, y, i / steps);

      for (let j = 0; j < density; j++) {
        let angle = p.random(p.TWO_PI);
        let radius = p.random(0, 12);
        let offsetX = p.cos(angle) * radius;
        let offsetY = p.sin(angle) * radius;
        let alpha = p.map(radius, 0, 12, 255, 0);

        switch (type) {
          case SocketType.user:
            if (p.mouseIsPressed) {
              drawEllipse();
              if (!this.isPainting) {
                this.isPainting = true;
              }
            } else {
              //mouse lifted, save paintStrokes
              if (this.isPainting) {
                this.isPainting = false;
                this.paintStrokes.push(this.paintStroke);
                this.paintStroke = [];
              }
            }
            break;
          case SocketType.remote:
            drawEllipse();
        }

        function drawEllipse() {
          p.noStroke();
          p.fill(rgb[0], rgb[1], rgb[2], alpha * 0.3); // Adjust opacity as needed
          p.ellipse(interX + offsetX, interY + offsetY, size, size);
        }
      }
    }

    //saves individual strokes to an array (used for undo function)
    if (this.isPainting) {
      this.paintStroke.push(stroke);
      this.interface.undoBtn_toggle(Button.enabled);
    }

    // Update the previous mouse position
    this.prevX = x;
    this.prevY = y;
  }

  //live update websockets server with real-time paint strokes
  private publishToServer(strokeMessage: Stroke) {
    //send paint stroke to server
    if (SessionManager.getInstance().getPage() == Page.canvas) {
      this.socket.emit("stroke", strokeMessage);
      console.log("send");
      //create tag to save work
      this.tag.push(strokeMessage);
    }
  }
}
