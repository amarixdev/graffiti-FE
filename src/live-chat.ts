import SocketHandler from "./socket-handler";
import { SocketType } from "./util/types";

export default class ChatHandler {
  chatInput = document.getElementById("chat-input") as HTMLInputElement;
  chatForm = document.getElementById("chat-form");
  chatLog = document.getElementById("chat-log");

  setup() {
    const socket = SocketHandler.getInstance()
    this.chatForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      let message = this.chatInput.value;
      if (message) {
        socket.getSocket().emit("chat", message);
        this.addMessage(message, SocketType.user, socket.getSessionUsername());
        this.chatInput.value = "";
      }
    });
  }

  addMessage(message: string, type: SocketType, user: string) {
    // Create the container div
    const newMessage = document.createElement("div");
    newMessage.className = "chat-container";

    // Set the background color based on the message type
    if (type === SocketType.remote) {
      newMessage.style.backgroundColor = "#333"; // Apply background color directly
    } else if (type === SocketType.user) {
      newMessage.style.backgroundColor = "#2a92e8"; // Apply background color directly
    }

    // Create the user paragraph
    const userBubble = document.createElement("p");
    userBubble.className = "user";
    userBubble.textContent = user;

    // Create the message paragraph
    const remoteBubble = document.createElement("p");
    remoteBubble.className = "message";
    remoteBubble.textContent = message;

    // Append paragraphs to the container span
    newMessage.appendChild(userBubble);
    newMessage.appendChild(remoteBubble);

    // Insert the new message as the first child
    this.chatLog?.insertBefore(newMessage, this.chatLog.firstChild);
  }
}
