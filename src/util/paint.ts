export default class Paint {
  static red = [255, 0, 0];
  static orange = [255, 127, 0];
  static yellow = [255, 255, 0];
  static green = [0, 255, 0];
  static blue = [0, 0, 255];
  static indigo = [75, 0, 130];
  static violet = [148, 0, 211];
  static white = [255, 255, 255];
  static black = [0, 0, 0];

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
  static values: Array<number[]> = Object.values(this.#map);

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
}
