import Interface from "./interface";
import ChatHandler from "./live-chat";
import SocketHandler from "./socket-handler";

export default class SessionManager {
  private socketHandler: SocketHandler;
  private static instance: SessionManager;
  private constructor() {
    console.log("session initialized");
    this.socketHandler = SocketHandler.getInstance();
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  setUp() {
    this.socketHandler.setUpListeners();
    new Interface().setup();
    new ChatHandler().setup();
  }
}

SessionManager.getInstance().setUp()