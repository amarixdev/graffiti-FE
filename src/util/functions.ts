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
}
