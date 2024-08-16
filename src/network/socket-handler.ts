import { Socket, io } from "socket.io-client";
import ChatHandler from "./live-chat";
import { Previews, SocketType } from "../util/enums";
import Stroke from "../canvas/paintstrokes";
import Canvas from "../canvas/canvas";
import SessionManager from "../session";
import UserInterface from "../interface/main";
import { ImageFile, ImagePreview } from "../util/types";
import PageElements from "../interface/global/elements";

export default class SocketHandler {
  private constructor() {}
  private static instance: SocketHandler;
  static getInstance(): SocketHandler {
    if (!SocketHandler.instance) {
      SocketHandler.instance = new SocketHandler();
    }
    return SocketHandler.instance;
  }

  private serverAddress: string = "http://localhost:3000";
  private socket: Socket = io(this.serverAddress, {
    withCredentials: true,
  });
  private sessionUsername: string = "";

  getSocket() {
    return this.socket;
  }
  getSessionUsername() {
    return this.sessionUsername;
  }

  private renderUsername(user: string) {
    this.sessionUsername = user;
    SessionManager.getInstance().setUsername(user);
    const username = document.createElement("p");
    username.innerText = this.sessionUsername;
    username.id = "generated-username";
    username.classList.add("signature", "text-white", "text-2xl");
    const username_loader = document.getElementById("username-loader");
    if (username) {
      username_loader?.replaceWith(username);
    }

    const userTag = document.getElementById("user-tag");
    if (userTag) {
      userTag.textContent = this.sessionUsername;
    }
  }

  setupListeners() {
    const socket = this.socket;
    socket.on("client-connected", (data: number) => {
      const artistsOnline = document.getElementById("artists-online");
      if (artistsOnline) {
        artistsOnline.innerText = `${data}`;
      }
    });

    socket.on("client-disconnected", (data: number) => {
      const artistsOnline = document.getElementById("artists-online");
      if (artistsOnline) {
        artistsOnline.innerText = `${data}`;
      }
    });

    socket.on("chat", (data: string, user: string) => {
      new ChatHandler().addMessage(data, SocketType.remote, user);
      console.log("user: " + user);
    });

    socket.on(
      "boot-up",
      (user: string, clients: number, tagPreviews: ImagePreview[]) => {
        this.sessionUsername = user;
        //convert serialized array into map
        const preview_map = new Map<
          string,
          { artists: string[] | null; img: ImageFile }
        >();

        tagPreviews.forEach((preview) => {
          preview_map.set(preview.id!, {
            artists: preview.artists,
            img: preview.imageFile,
          });
        });

        this.renderUsername(user);
        const artistsOnline = document.getElementById("artists-online");
        if (artistsOnline) {
          artistsOnline.textContent = `${clients}`;
        }
        const session = SessionManager.getInstance();
        session.setTagPreviews_map(preview_map);
        session.setUsername(user);
        new UserInterface().renderPreviews(Previews.collection);
      }
    );

    socket.on("generate-user", (user: string) => {
      setTimeout(() => {
        this.renderUsername(user);
        const button =
          new PageElements().generateUserButton() as HTMLButtonElement;
        button.disabled = false;
      }, 500);
    });

    socket.on("preview-loaded", (imagePreview: ImagePreview) => {
      console.log("preview loaded");
      console.log("username: " + imagePreview.artists);
      SessionManager.getInstance().insertTagPreview_map(
        imagePreview.id,
        imagePreview.artists,
        imagePreview.imageFile
      );
      new UserInterface().renderPreviews(Previews.single);
      console.log("done...!");
    });

    socket.on("preview-updated", (imagePreview: ImagePreview) => {
      const ui = new UserInterface();
      ui.display_UpdateLoader(imagePreview.id);
      ui.updatePreview(imagePreview);
      console.log("preview updated");
    });

    socket.on("stroke", (data: Stroke) => {
      const canvas = Canvas.getInstance();
      canvas.broadcast(data);
    });
  }
}
