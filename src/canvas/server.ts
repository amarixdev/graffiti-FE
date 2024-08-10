import { RequestMethod, Button, Page } from "../util/enums";
import { FetchRequests } from "../network/fetch-requests";
import Canvas from "./canvas";
import SessionManager from "../session";
import UInterface from "../interface/main";
import IndexDBManager from "../storage/indexed-db";
import Stroke from "./paintstrokes";

export default class ServerOperations {
  static compressAndSendToServer(method: RequestMethod) {
    const canvas = Canvas.getInstance();
    const canvasID = canvas.getCanvasId();
    console.log("canvasID " + canvasID + "being sent to the server");
    const requestMethod = method == RequestMethod.post ? "post" : "update";
    const artist_canvas = document.getElementById(
      "artist-canvas"
    ) as HTMLCanvasElement;
    const compression = 0.0001;
    artist_canvas.toBlob(
      async (img) => {
        let tag = canvas.getPaintStrokes();

        const formData = new FormData();
        formData.append("tag", JSON.stringify(tag));
        formData.append("image", img!, "canvas.png"); // Append the blob with a filename
        formData.append("method", JSON.stringify(requestMethod));
        formData.append("id", JSON.stringify(canvasID));

        //render a loading container on new posts
        if (method == RequestMethod.post) {
          new UInterface().display_PreviewLoader();
        }

        if (method == RequestMethod.update) {
          new UInterface().display_UpdateLoader(canvasID);
          //remove image data from indexDB storage when updating..
          IndexDBManager.getInstance().remove(canvasID);
        }

        FetchRequests.postCanvas(formData).then((data) => {
          console.log("Success:", data);
          canvas.resetPaintStrokes();
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
