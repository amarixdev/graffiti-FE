import { Socket, io } from "socket.io-client";
import ChatHandler from "./live-chat";
import { SocketType } from "./util/enums";
import Stroke from "./canvas/stroke";
import Canvas from "./canvas/canvas";
import CanvasDisplay from "./canvas/display";
import SessionManager from "./session";
import UserInterface from "./interface";
import { ImagePreviews } from "./util/types";

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

  setUpListeners() {
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

    const canvas = Canvas.getInstance();

    socket.on(
      "boot-up",
      (user: string, clients: number, tagPreviews: ImagePreviews[]) => {
        const userTag = document.getElementById("user-tag");
        const artistsOnline = document.getElementById("artists-online");
        SessionManager.getInstance().setTagPreviews(tagPreviews);
        new UserInterface().renderPreviews();
        
        this.sessionUsername = user;
        if (userTag && artistsOnline) {
          userTag.textContent = user;
          artistsOnline.textContent = `${clients}`;
        }
      }
    );

    socket.on("stroke", (data: Stroke) => {
      canvas.broadcast(data);
      CanvasDisplay.getInstance().liveDisplay(data);
    });
  }
}

