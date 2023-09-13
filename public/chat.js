import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

//html elements
let messageContainer = document.getElementById("message-container");
const messageInput = document.getElementById("message-input");
const form = document.getElementById("chat-form");
const user = document.getElementById("user-name-input").value;
const userId = document.getElementById("user-id-input").value;
const friendId = document.getElementById("friend-id-input").value;
const friendSocket = document.getElementById("friend-socket-input").value;
let times = document.querySelectorAll(".chat-time");
const loaderContainer = document.getElementById("loader-container");
const wrapper = document.getElementById("wrapper");
const title = document.title;
const favicon = document.getElementById("favicon");

const currentURL = window.location.href;
const baseURL = currentURL.split("/chat/")[0];
const faviconURL = `${baseURL}/images/bloom-logo.png`;
const newFaviconURL = `${baseURL}/images/bloom-logo-notification.png`;

let interval;

//creates div and appends with message
function displayMessage(message) {
  const date = new Date(message.time);
  const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const fDate = new Intl.DateTimeFormat("en-us", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: localTimeZone,
  });
  const time = fDate.format(date);

  if (message.username.trim() === user.trim()) {
    const heading = document.createElement("div");
    heading.classList.add("chat-heading");
    const timeDisplay = document.createElement("div");
    timeDisplay.innerHTML = `<div class='chat-time'>${time}</div>`;
    const usernameDisplay = document.createElement("div");
    usernameDisplay.innerHTML = `<div>${message.username} (you)</div>`;
    messageContainer.append(heading);
    heading.append(timeDisplay);
    heading.append(usernameDisplay);

    const msg = document.createElement("div");
    msg.innerHTML = `<div class='message'>${message.text}</div> `;
    messageContainer.append(msg);
  } else {
    const heading = document.createElement("div");
    heading.classList.add("chat-heading");
    const timeDisplay = document.createElement("div");
    timeDisplay.innerHTML = `<div class='chat-time'>${time}</div>`;
    const usernameDisplay = document.createElement("div");
    usernameDisplay.innerHTML = `<div>${message.username}</div>`;
    messageContainer.append(heading);
    heading.append(timeDisplay);
    heading.append(usernameDisplay);

    const msg = document.createElement("div");
    msg.innerHTML = `<div class='message-other'>${message.text}</div> `;
    messageContainer.append(msg);
  }
}
//enables chatting on development and production
let socket;
let local;

if (window.location.href.slice(0, 21) === "http://localhost:3000") {
  socket = io("http://localhost:3000", {
    withCredentials: true,
  });
  local = true;
} else {
  socket = io("https://bloom-friend-finder.herokuapp.com", {
    withCredentials: true,
  });
  local = false;
}

// message from server
socket.on("receive-message", ({ message }) => {
  displayMessage(message);

  // auto scroll feature
  window.scrollTo(0, messageContainer.scrollHeight);

  if (Notification.permission === "granted") {
    if (message.username.trim() !== user.trim()) {
      new Notification(message.username, {
        body: message.text,
        icon: "images/bloom-logo.png",
      });
    }
  }
});

function startFlashingInterval() {
  // Check if the page is currently hidden
  if (document.hidden) {
    favicon.setAttribute("href", newFaviconURL);
    // Flash the title
    interval = setInterval(() => {
      if (document.hidden) {
        if (document.title == title) {
          document.title = "New message | " + title;
        } else {
          document.title = title;
        }
      } else {
        clearInterval(interval);
      }
    }, 1000);
  } else {
    document.title = title;
    clearInterval(interval);
    sendMessageSeen();
  }
}

//message submit
form.addEventListener("submit", (e) => {
  e.preventDefault();

  //get message text
  let msg = messageInput.value;
  msg = msg.trim();

  if (!msg) {
    return;
  }

  //emit message to server
  socket.emit("send-message", {
    message: msg,
    to: friendSocket,
    sender: user,
    friendId: friendId,
  });
  //clear input
  messageInput.value = "";
  messageInput.focus();
});

// Function to fetch user data from the server
async function fetchUserData() {
  try {
    const response = await fetch(
      `https://bloom-friend-finder.herokuapp.com/users/${userId}`,
      {
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error(
        `Request failed with status: ${response.status} (${response.statusText})`,
      );
    }

    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      const userData = await response.json();
      return userData;
    } else {
      console.error("Response is not in JSON format");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data:", error.message);
    return null;
  }
}

// Periodically check for unread messages and activate interval
setInterval(async () => {
  try {
    if (document.hidden) {
      const userData = await fetchUserData();

      if (userData && userData.hasUnreadMessage == true) {
        startFlashingInterval();
      }
    }
  } catch (error) {
    console.error("Error fetching user data:", error.message);
  }
}, 1000 * 30); //60 for minute

function loading() {
  setTimeout(() => {
    loaderContainer.remove();
    wrapper.classList.remove("hidden");
    window.scrollTo(0, messageContainer.scrollHeight);
  }, 800);
}

async function sendMessageSeen() {
  const flag = {
    seen: "true",
  };

  let response;

  try {
    if (local) {
      response = await fetch(`http://localhost:3000/users/${userId}`, {
        method: "POST",
        body: JSON.stringify(flag),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
    } else {
      response = await fetch(
        `https://bloom-friend-finder.herokuapp.com/users/${userId}`,
        {
          method: "POST",
          body: JSON.stringify(flag),
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );
    }

    if (!response.ok) {
      throw new Error(
        `Request failed with status: ${response.status} (${response.statusText})`,
      );
    }
  } catch (error) {
    console.error("Error modifying user data:", error.message);
  }

  favicon.setAttribute("href", faviconURL);
}

document.addEventListener("visibilitychange", async () => {
  if (!document.hidden) {
    clearInterval(interval);
    document.title = title;
    sendMessageSeen();
  }
});

window.addEventListener("load", loading);

window.addEventListener("load", async () => {
  times.forEach((time) => {
    let date = new Date(time.innerHTML);
    const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const fDate = new Intl.DateTimeFormat("en-us", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: localTimeZone,
    });
    const newTime = fDate.format(date);
    time.innerHTML = newTime;
  });

  await Notification.requestPermission();
});

export default socket;
