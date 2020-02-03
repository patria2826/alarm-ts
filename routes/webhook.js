"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const line = require("@line/bot-sdk");
const express = require("express");
let router = express.Router();
const config = {
    channelAccessToken: "8PH4V0u0FvfPEm/yQ9NZB61U1EUD01jtZnrfno5tAY41X2xkqe6f/qWjLwlTnPgWJe+YHtNCE0Efgn3cd6JUcXSU7fJhCTnJA4DY/NXs1cBSVd5iybyneAjCI/2qaBZPyAS/VuD2hQzVN6vNhF6c6wdB04t89/1O/w1cDnyilFU=",
    channelSecret: "71452c617aba78afb206fe9b2f61ad74"
};
// create LINE SDK client
const client = new line.Client(config);
// create Express app
const app = express();
// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post("/", line.middleware(config), (req, res) => {
    Promise.all(req.body.events.map(handleEvent))
        .then(result => {
        console.log("result", result);
        return res.json(result);
    })
        .catch(err => {
        console.error(err);
        res.status(500).end();
    });
});
// event handler
function handleEvent(event) {
    if (event.type !== "message" || event.message.type !== "text") {
        // ignore non-text-message event
        return Promise.resolve(null);
    }
    console.log(`Received message: ${event.message.text}`);
    // create a echoing text message
    let replyText;
    switch (event.message.text.toUpperCase()) {
        case "SSR":
            replyText = "https://gbfssrlistbyod.memo.wiki/";
            break;
        default:
            replyText = `你剛剛說：「${event.message.text}」`;
            break;
    }
    const echo = {
        type: "text",
        text: replyText
    };
    // use reply API
    return client.replyMessage(event.replyToken, echo);
}
module.exports = router;
