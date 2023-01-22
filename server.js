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
const step = JSON.parse(process.env.STEP);

const { google } = require("googleapis");

const client = new google.auth.JWT(
    process.env.CLIENT_EMAIL,
    null,
    process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    ["https://www.googleapis.com/auth/spreadsheets"]
);

app.use("/jquery", express.static(path.join(__dirname, 'node_modules/jquery/dist')));
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/private", express.static(path.join(__dirname, "private")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get(`/${secretToken}`, (req, res) => {
    res.sendFile(path.join(__dirname, "private/index.html"));
});

http.listen(port, () => {
    console.log(`App server is running on port ${port}`);
});

client.authorize((err, tokens) => {
    if (err) {
      console.log(err);
      return;
    } else {
      console.log("Connected to Google Sheets API !");
    }
});

io.on("connection", (socket) => {
    gsrun(client, "A:Z").then((data) => {
        newData = {};
        let i = 0;

        newData.countries = [];
        while (i < data[0].slice(2).length) {
            newData.countries.push({name: data[0].slice(2)[i], flag: data[1].slice(2)[i]});
            i++;
        }

        i = 0;
        newData.jury_points = [];
        while (i < data[2].slice(2).length) {
            newData.jury_points.push({name: data[2].slice(2)[i], points: JSON.parse(data[3].slice(2)[i])});
            i++;
        }

        i = 0;
        newData.public_points = [];
        while (i < data[4].slice(2).length) {
            newData.public_points.push({id: data[4].slice(2)[i], points: parseInt(data[5].slice(2)[i])});
            i++;
        }

        newData.lessPointsPlaysound = data[6][1];

        socket.emit("data", newData);
    });

    socket.emit("step", step);
});

async function gsrun(cl, ran) {
    const gsapi = google.sheets({version: "v4", auth: cl});
    const opt = {
      spreadsheetId: "1eORVqZygzxbzqiZt5J47D2PY85UA_Nh5obWc03B1M3c",
      range: ran
    };
    data = await gsapi.spreadsheets.values.get(opt);
    return data.data.values;
}