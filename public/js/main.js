const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

const joinChatroom = () => {
  socket.emit("joinRoom", { username, room });
};

const displayRoomUsers = ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
};

const displayMessage = (message) => {
  console.log(message);
  outputMessage(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
};

const submitMessage = (e) => {
  e.preventDefault();
  let msg = e.target.elements.msg.value.trim();

  if (!msg) {
    return false;
  }

  socket.emit("chatMessage", msg);

  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
};

const outputMessage = (message) => {
  const div = document.createElement("div");
  div.classList.add("message");

  const p = document.createElement("p");
  p.classList.add("meta");
  p.innerText = message.username;
  p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);

  const para = document.createElement("p");
  para.classList.add("text");
  para.innerText = message.text;
  div.appendChild(para);

  chatMessages.appendChild(div);
};

const outputRoomName = (room) => {
  roomName.innerText = room;
};

const outputUsers = (users) => {
  userList.innerHTML = "";
  users.forEach((user) => {
    const li = document.createElement("li");
    li.innerText = user.username;
    userList.appendChild(li);
  });
};

const promptLeaveChatroom = () => {
  const leaveRoom = confirm("Are you sure you want to leave the chatroom?");
  if (leaveRoom) {
    window.location = "../index.html";
  }
};

socket.on("roomUsers", displayRoomUsers);
socket.on("message", displayMessage);

chatForm.addEventListener("submit", submitMessage);
document
  .getElementById("leave-btn")
  .addEventListener("click", promptLeaveChatroom);

joinChatroom();
