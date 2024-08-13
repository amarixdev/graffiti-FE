import Canvas from "../canvas/canvas";

export default class Paint {
  static red = { paint: [255, 0, 0], ui: "#d03030" };
  static orange = { paint: [255, 127, 0], ui: "#d07330" };
  static yellow = { paint: [255, 255, 0], ui: "#d0c530" };
  static green = { paint: [0, 255, 0], ui: "#30d035" };
  static blue = { paint: [0, 0, 255], ui: "#30abd0" };
  static indigo = { paint: [75, 0, 130], ui: "#5530d0" };
  static violet = { paint: [148, 0, 211], ui: "#a030d0" };
  static white = { paint: [255, 255, 255], ui: "#ffffff" };
  static black = { paint: [0, 0, 0], ui: "#515151" };

  static #map = {
    r: Paint.red,
    o: Paint.orange,
    y: Paint.yellow,
    g: Paint.green,
    b: Paint.blue,
    i: Paint.indigo,
    v: Paint.violet,
    w: Paint.white,
    k: Paint.black,
  };

  /**Returns an array of keys for default colors*/
  static keys: Array<string> = Object.keys(this.#map);

  /**Returns an array of rgb values for default colors*/
  static values: Array<{ paint: number[]; ui: string }> = Object.values(
    this.#map
  );

  /**Converts an RGB string to an array of RGB values */
  static stringToRGB(rgbString: string): Array<number> {
    return rgbString
      .split("rgb")[1]
      .split("(")[1]
      .split(")")[0]
      .split(",")
      .map((color) => {
        return parseInt(color.trim());
      });
  }
  /**Converts an array of RGB values to an RGB string  */
  static RGBToString(rgb: Array<number>) {
    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
  }

  /**Converts a hex code string to an array of RGB values */
  static hexToRgb(hex: string): [number, number, number] {
    hex = hex.replace(/^#/, "");
    let bigint = parseInt(hex, 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;
    return [r, g, b];
  }

  /**Converts an array of RGB values to a hex code string */
  static rgbToHex(rgb: Array<number>) {
    const [r, g, b] = rgb;

    const toHex = (component: number) => {
      const hex = component.toString(16).padStart(2, "0");
      return hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  static colorSwitch(key: string, elementID: string) {
    const canvas = Canvas.getInstance();
    const backdrop = document.getElementById(elementID);
    if (backdrop) {
      backdrop.style.transition = "background-color 2s ease";
    }

    if (backdrop ) {
      switch (key) {
        case "v":
          canvas.setColor(this.violet.paint);
          backdrop.style.background = `linear-gradient(to bottom, ${this.violet.ui}, #000)`;
          document.documentElement.style.setProperty(
            "--dynamic-color",
            this.violet.ui
          );

          break;
        case "i":
          canvas.setColor(this.indigo.paint);
          backdrop.style.background = `linear-gradient(to bottom, ${Paint.indigo.ui}, #000)`;
          document.documentElement.style.setProperty(
            "--dynamic-color",
            this.indigo.ui
          );

          break;
        case "b":
          canvas.setColor(this.blue.paint);
          backdrop.style.background = `linear-gradient(to bottom, ${Paint.blue.ui}, #000)`;
          document.documentElement.style.setProperty(
            "--dynamic-color",
            this.blue.ui
          );

          break;
        case "g":
          canvas.setColor(this.green.paint);
          backdrop.style.background = `linear-gradient(to bottom, ${Paint.green.ui}, #000)`;
          document.documentElement.style.setProperty(
            "--dynamic-color",
            this.green.ui
          );

          break;
        case "y":
          canvas.setColor(this.yellow.paint);
          backdrop.style.background = `linear-gradient(to bottom, ${Paint.yellow.ui}, #000)`;
          document.documentElement.style.setProperty(
            "--dynamic-color",
            this.yellow.ui
          );

          break;
        case "o":
          canvas.setColor(this.orange.paint);
          backdrop.style.background = `linear-gradient(to bottom, ${Paint.orange.ui}, #000)`;
          document.documentElement.style.setProperty(
            "--dynamic-color",
            this.orange.ui
          );

          break;
        case "r":
          canvas.setColor(this.red.paint);
          backdrop.style.background = `linear-gradient(to bottom, ${Paint.red.ui}, #000)`;
          document.documentElement.style.setProperty(
            "--dynamic-color",
            this.red.ui
          );

          break;
        case "k":
          canvas.setColor(this.black.paint);
          backdrop.style.background = `linear-gradient(to bottom, ${Paint.black.ui}, #000)`;
          document.documentElement.style.setProperty(
            "--dynamic-color",
            this.black.ui
          );

          break;
        case "w":
          canvas.setColor(this.white.paint);
          backdrop.style.background = `linear-gradient(to bottom, ${Paint.white.ui}, #000)`;
          document.documentElement.style.setProperty(
            "--dynamic-color",
            this.white.ui
          );

          break;
        default:
          return;
      }
    }
  }
}
