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
  //ensure a single instance of the socket is created
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

    const username = document.createElement("p");
    username.innerText = this.sessionUsername;
    username.id = "username";
    username.classList.add("signature");
    username.classList.add("text-white");
    username.classList.add("text-2xl");
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
    });

    socket.on(
      "boot-up",
      (user: string, clients: number, tagPreviews: ImagePreview[]) => {
        this.sessionUsername = user;

        //convert serialized array into map
        const preview_map = new Map<string, ImageFile>();
        tagPreviews.forEach((preview) => {
          preview_map.set(preview.id, preview.imageFile);
        });

        this.renderUsername(user);
        const artistsOnline = document.getElementById("artists-online");
        if (artistsOnline) {
          artistsOnline.textContent = `${clients}`;
        }
        SessionManager.getInstance().setTagPreviews_map(preview_map);
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
      SessionManager.getInstance().insertTagPreview_map(
        imagePreview.id,
        imagePreview.imageFile
      );

      new UserInterface().renderPreviews(Previews.single);
    });

    socket.on("preview-updated", (imagePreview: ImagePreview) => {
      new UserInterface().updatePreview(imagePreview);
      console.log("preview updated");
    });

    socket.on("stroke", (data: Stroke) => {
      const canvas = Canvas.getInstance();
      canvas.broadcast(data);
    });
  }
}
