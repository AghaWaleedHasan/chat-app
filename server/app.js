const express = require("express");
const dotenv = require("dotenv");
const { createServer } = require("http");
const connectDB = require("./config/db");
const userRouter = require("./routes/userRoutes");
const chatRouter = require("./routes/chatRoutes");
const messageRouter = require("./routes/messageRoutes");
const cors = require("cors");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());
const httpServer = createServer(app);

httpServer.listen(3000, () => {
  console.log("listening on port 3000");
});

app.use("/", userRouter);
app.use("/chat", chatRouter);
app.use("/message", messageRouter);

const io = require("socket.io")(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  //establish connection
  socket.on("connected", (userData) => {
    socket.join(userData.id);
    console.log(`User: ${userData.id} connected`);
  });

  //join a room
  socket.on("join room", (room) => {
    socket.join(room);
    console.log("user joined room: ", room);
  });

  //send a message
  socket.on("new message", (newMessageReceived) => {
    // console.log("newMessageReceived: ", newMessageReceived);
    const chat = newMessageReceived.data.chat;

    // console.log("room: ", chat);
    console.log("new msg sender: ", newMessageReceived.data.sender._id);
    chat?.users.forEach((user) => {
      if (user === newMessageReceived.data.sender._id) {
      } else {
        console.log(
          "sending message data to: ",
          user,
          "msg text: ",
          newMessageReceived.data.text
        );
        socket.in(user).emit("message received", newMessageReceived.data);
      }
    });
  });
});
