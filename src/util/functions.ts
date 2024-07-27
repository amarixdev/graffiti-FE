export default class HelperFunctions {
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

  static hexToRgb(hex: string): [number, number, number] {
    // Remove the hash at the start if it's there
    hex = hex.replace(/^#/, "");

    // Parse r, g, b values
    let bigint = parseInt(hex, 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;

    return [r, g, b];
  }
}
