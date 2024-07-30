import Interface from "./interface";
import ChatHandler from "./live-chat";
import SocketHandler from "./socket-handler";

const socketHandler = SocketHandler.getInstance();
socketHandler.setUpListeners();
new Interface().setup();
new ChatHandler().setup();
