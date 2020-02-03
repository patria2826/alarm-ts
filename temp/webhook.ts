import * as line from "@line/bot-sdk";
import * as express from "express";
let router = express.Router();

const config: line.Config = {
  channelAccessToken:
    "8PH4V0u0FvfPEm/yQ9NZB61U1EUD01jtZnrfno5tAY41X2xkqe6f/qWjLwlTnPgWJe+YHtNCE0Efgn3cd6JUcXSU7fJhCTnJA4DY/NXs1cBSVd5iybyneAjCI/2qaBZPyAS/VuD2hQzVN6vNhF6c6wdB04t89/1O/w1cDnyilFU=",
  channelSecret: "71452c617aba78afb206fe9b2f61ad74"
};

// create LINE SDK client
const client = new line.Client(<line.ClientConfig>config);

// create Express app
const app: any = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post(
  "/webhook",
  line.middleware(<line.MiddlewareConfig>config),
  (req: any, res: any) => {
    Promise.all(req.body.events.map(handleEvent))
      .then(result => {
        console.log("result", result);

        return res.json(result);
      })
      .catch(err => {
        console.error(err);
        res.status(500).end();
      });
  }
);

// event handler
function handleEvent(event: line.WebhookEvent) {
  if (event.type !== "message" || event.message.type !== "text") {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  console.log(`Received message: ${event.message.text}`);

  // create a echoing text message
  const echo: line.TextMessage = { type: "text", text: event.message.text };

  // use reply API
  return client.replyMessage(event.replyToken, echo);
}

module.exports = router;
