const { Socket } = require("socket.io");

const express = require("express");

const app = express();
const http = require("http").createServer(app);
const path = require("path");
const port = 3000;

/**
 * @type {Socket}
 */
const io = require("socket.io")(http);

require("dotenv").config();

const secretToken = process.env.SECRET_TOKEN;

app.use("/jquery", express.static(path.join(__dirname, 'node_modules/jquery/dist')));
app.use(express.static("public"));
app.use(express.static("private"))

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get(`/${secretToken}/`, (req, res) => {
    res.sendFile(path.join(__dirname, "private/index.html"));
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"), 404)
});

http.listen(port, () => {
    console.log(`App server is running on port ${port}`);
});

io.on("connection", (socket) => {
    
});