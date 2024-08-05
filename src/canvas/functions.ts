import { RequestMethod, Button, Page } from "../util/enums";
import { FetchRequests } from "../util/fetch-requests";
import Canvas from "./canvas";
import UInterface from "../interface";
import SessionManager from "../session";
import Stroke from "./stroke";

export default class CanvasFunctions {
  static compressAndSendToServer(method: RequestMethod) {
    const canvas = Canvas.getInstance();

    const requestMethod = method == RequestMethod.post ? "post" : "update";
    const artist_canvas = document.getElementById(
      "artist-canvas"
    ) as HTMLCanvasElement;
    const compression = 0.0001;
    artist_canvas.toBlob(
      async (img) => {
        const tag = canvas.getPaintStrokes().flat();

        const formData = new FormData();
        formData.append("tag", JSON.stringify(tag));
        formData.append("image", img!, "canvas.png"); // Append the blob with a filename
        formData.append("method", JSON.stringify(requestMethod));
        formData.append("id", JSON.stringify(canvas.getCanvasId()));

        FetchRequests.postCanvas(formData).then((data) => {
          console.log("Success:", data);
          canvas.setPaintStrokes([]);
          canvas.setTag([]);
        });
      },
      "image/jpeg",
      compression
    );
    const uInterface = new UInterface();
    uInterface.saveBtn_toggle(Button.disabled);
    uInterface.updatePageUI();
    canvas.clear();
  }

  //live update websocket server with real-time paint strokes
  static publishToServer(strokeMessage: Stroke) {
    const canvas = Canvas.getInstance();
    //send paint stroke to server
    if (SessionManager.getInstance().getPage() == Page.canvas) {
      canvas.getSocket().emit("stroke", strokeMessage);
      console.log("send");
    }
  }
}
