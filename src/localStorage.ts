import Stroke from "./canvas/stroke";

export default class LocalStorageManager {
  stored: Array<string> = new Array();
  private static instance: LocalStorageManager;
  private constructor() {}

  static getInstance() {
    if (!this.instance) {
      this.instance = new LocalStorageManager();
    }
    return this.instance;
  }

  insert(id: string) {
    this.stored.push(id);
  }

  remove(id: string) {
    console.log("removing..");
    sessionStorage.removeItem(`strokes-${id}`);
    sessionStorage.removeItem(`bitmap-${id}`);
  }

  private imageBitmapToBlob = async (bitmap: any) => {
    // Create an OffscreenCanvas with the same dimensions as the ImageBitmap
    const offscreenCanvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = offscreenCanvas.getContext("2d");

    // Draw the ImageBitmap onto the OffscreenCanvas
    if (ctx) {
      ctx.drawImage(bitmap, 0, 0);
    }
    // Convert the OffscreenCanvas to a Blob
    const blob = await offscreenCanvas.convertToBlob();
    return blob;
  };

  private bytesToMB(bytes: number): number {
    return parseFloat((bytes / (1024 * 1024)).toFixed(2));
  }

  storeBitmapInLocalStorage = async (
    bitmap: ImageBitmap,
    id: string,
    paintStrokes: Array<Stroke>
  ) => {
    try {
      const blob = await this.imageBitmapToBlob(bitmap);
      console.log(this.bytesToMB(blob.size));
      const reader: any = new FileReader();
      console.log("running..");

      reader.onloadend = () => {
        try {
          // Store data in sessionStorage
          sessionStorage.setItem(`bitmap-${id}`, reader.result);
          sessionStorage.setItem(
            `strokes-${id}`,
            JSON.stringify(paintStrokes) //TODO: Fix this confusing paintstroke storage
          );
          this.insert(id);
        } catch (e) {
          if (e instanceof DOMException) {
            console.error("Failed to store data in sessionStorage:", e.message);
            // Handle the error, remove first item added to storage.
            const removedID = this.stored.shift();
            if (removedID) {
              this.remove(removedID);
              console.log("removed: " + removedID + " from storage");

              //re-try
              sessionStorage.setItem(`bitmap-${id}`, reader.result);
              sessionStorage.setItem(
                `strokes-${id}`,
                JSON.stringify(paintStrokes) //TODO: Fix this confusing paintstroke storage
              );
            }
          } else {
            throw e; // Re-throw non-DOMExceptions
          }
        }
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Error processing bitmap:", error);
      // Additional error handling if needed
    }
  };
}
