const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Allow all origins temporarily
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });

    socket.on("join_group", ({ username }) => {
        console.log("joined: ", username);
        io.emit("receive_message", {
            username: username,
            message: "Joined the chat",
            time: new Date().toLocaleTimeString(),
            isUserActivity: true,
        });
    })

    socket.on("send_message", (data) => {
        console.log("sending message: ", data);
        socket.broadcast.emit("receive_message", data);
    })
});

httpServer.listen(3000, () => console.log("server started at port 3000"));

app.use(express.json());

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Internal Server Error!");
});