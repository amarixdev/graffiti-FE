// Function to load HTML content from a file and insert it into a target element

import UserInterface from "../interface";
import ChatHandler from "../live-chat";

function loadHTML(target: string, url: string): void {
  fetch(url, { cache: "no-cache" })
    .then((response) => response.text())
    .then((data) => {
      const targetElement = document.getElementById(target);
      if (targetElement) {
        targetElement.innerHTML = data;
      } else {
        console.error(`Element with id "${target}" not found.`);
      }
    })
    .then(() => {
      //re-setup UI after HTML injections
      new UserInterface().setup();
      new ChatHandler().setup();
    })
    .catch((error) => console.error("Error loading HTML:", error));
}


const HTMLContent = [
  { id: "header", src: "src/components/header.html" },
  { id: "util-buttons", src: "src/components/buttons.html" },
  { id: "live-chat", src: "src/components/chat.html" },
];

HTMLContent.forEach((html) => {
  loadHTML(html.id, html.src);
});

