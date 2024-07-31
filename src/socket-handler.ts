import { Socket, io } from "socket.io-client";
import ChatHandler from "./live-chat";
import { SocketType } from "./util/enums";
import Stroke from "./canvas/stroke";
import Canvas from "./canvas/canvas";

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
  private artistsOnline = document.getElementById("artists-online");
  private userTag = document.getElementById("user-tag");

  getSocket() {
    return this.socket;
  }
  getSessionUsername() {
    return this.sessionUsername;
  }

  setUpListeners() {
    const socket = this.socket;
    socket.on("client-connected", (data: number) => {
      console.log(data);
      if (this.artistsOnline) {
        this.artistsOnline.innerText = `${data}`;
      }
    });

    socket.on("client-disconnected", (data: number) => {
      if (this.artistsOnline) {
        this.artistsOnline.innerText = `${data}`;
      }
    });

    socket.on("chat", (data: string, user: string) => {
      new ChatHandler().addMessage(data, SocketType.remote, user);
    });

    const canvas = Canvas.getInstance();

    socket.on("boot-up", (data: Array<Stroke>, user: string) => {
      canvas.loadCanvas(data);
      this.sessionUsername = user;
      if (this.userTag) {
        this.userTag.textContent = user;
      }
    });

    socket.on("stroke", (data: Stroke) => {
      canvas.broadcast(data);
    });
  }
}
