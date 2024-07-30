import Canvas from "./canvas/canvas";
import SocketHandler from "./socket-handler";
import Paint from "./util/paint";

export default class Interface {
  canvas: Canvas;
  constructor() {
    this.canvas = Canvas.getInstance();
  }

  setup() {
    const colorPicker = document.getElementById("color-picker");
    const saveButton = document.getElementById("save-btn");
    const clearButton = document.getElementById("clear-btn");
    const zoomIn = document.getElementById("zoom-in");
    const zoomOut = document.getElementById("zoom-out");

    colorPicker?.addEventListener("input", (e: Event) => {
      const target = e.target as HTMLInputElement;
      this.canvas.setColor(Paint.hexToRgb(target.value));
    });

    //DEV ONLY
    clearButton?.addEventListener("click", () => {
      SocketHandler.getInstance().getSocket().emit("clear");
      this.canvas.clear();
    });

    for (let i = 0; i < Paint.keys.length; i++) {
      const btn = document.getElementById(`color-btn-${Paint.keys[i]}`);
      btn?.addEventListener("click", () => {
        this.canvas.setColor(Paint.values[i]);
      });
    }
  }

}
