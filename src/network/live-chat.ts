import SocketHandler from "./socket-handler";
import { SocketType } from "../util/enums";
import SessionManager from "../session";

export default class ChatHandler {
  chatInput = document.getElementById("chat-input") as HTMLInputElement;
  chatForm = document.getElementById("chat-form");
  chatLog = document.getElementById("chat-log");
  chatContainer = document.getElementById("chat-container");

  setupListeners() {
    const socket = SocketHandler.getInstance();
    this.chatForm?.addEventListener("submit", (e) => {
      const user = SessionManager.getInstance().getUsername();
      if (user) {
        e.preventDefault();
        let message = this.chatInput.value;
        if (message) {
          socket.getSocket().emit("chat", message, user);
          this.addMessage(message, SocketType.user, user);
          this.chatInput.value = "";
        }
      }
    });
  }

  //add message bubble
  addMessage(message: string, type: SocketType, user: string) {
    // Create the container div
    const newMessage = document.createElement("div");
    newMessage.className = "chat-bubble";

    // Set the background color based on the message type
    if (type === SocketType.remote) {
      newMessage.style.backgroundColor = "#4b4b4b"; // Apply background color directly
    } else if (type === SocketType.user) {
      newMessage.style.backgroundColor = "#2a92e8"; // Apply background color directly
      newMessage.style.transform = "translateX(65px)"; // Translate 80px in the x direction
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
