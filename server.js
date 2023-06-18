const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const botName = "Hiven Bot";
const PORT = process.env.PORT || 3000;

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Run when client connects
io.on("connection", handleConnection);

// Start the server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

function handleConnection(socket) {
  socket.on("joinRoom", handleJoinRoom);
  socket.on("chatMessage", handleChatMessage);
  socket.on("disconnect", handleDisconnect);
}

function handleJoinRoom({ username, room }) {
  const user = userJoin(this.id, username, room);
  this.join(user.room);

  // Welcome current user
  this.emit("message", formatMessage(botName, "Welcome to ChatCord!"));

  // Broadcast when a user connects
  this.to(user.room).emit(
    "message",
    formatMessage(botName, `${user.username} has joined the chat`)
  );

  // Send users and room info
  this.to(user.room).emit("roomUsers", {
    room: user.room,
    users: getRoomUsers(user.room),
  });
}

function handleChatMessage(msg) {
  const user = getCurrentUser(this.id);
  io.to(user.room).emit("message", formatMessage(user.username, msg));
}

function handleDisconnect() {
  const user = userLeave(this.id);

  if (user) {
    io.to(user.room).emit(
      "message",
      formatMessage(botName, `${user.username} has left the chat`)
    );

    // Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  }
}
