import * as line from "@line/bot-sdk";
import * as express from "express";
import axios from "axios";
import getGBFLatestNews from "./components/GBFNewsCrawler";
import gbfSSRList from "./components/GBFSSRListCrawler";
import { IGBFNews, IGBFSSRList } from "./components/Interface";
import EUrls from "./components/Urls";

// user config
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
  "/",
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
  let echo: line.Message;

  switch (event.message.text.trim().toUpperCase()) {
    case "SSR":
      const charaClass: line.FlexBox[] = [];
      return gbfSSRList()
        .then((result: IGBFSSRList[]) => {
          return result;
        })
        .then((dataList: IGBFSSRList[]) => {
          dataList.forEach((data, index) => {
            const contentsArr: line.FlexComponent[] = [
              {
                type: "text",
                align: "center",
                text: data.text
              }
            ];
            data.thumbnailImg &&
              contentsArr.push({ type: "icon", url: data.thumbnailImg });
            charaClass.push({
              type: "box",
              layout: "baseline",
              borderWidth: "2px",
              borderColor: "#00BBFF",
              cornerRadius: "20px",
              offsetTop: `${index}px`,
              paddingAll: "5px",
              action: { type: "uri", label: data.text, uri: data.url },
              contents: contentsArr
            });
          });
        })
        .then(() => {
          echo = {
            type: "flex",
            altText: EUrls.GBFSSR,
            contents: {
              type: "bubble",
              header: {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: "GBF SSR List",
                    wrap: true,
                    weight: "bold"
                  }
                ]
              },
              hero: {
                type: "image",
                url: "https://i.imgur.com/EoIMHmO.png",
                size: "full",
                aspectMode: "fit",
                aspectRatio: "2:1"
              },
              body: { type: "box", contents: charaClass, layout: "vertical" }
            }
          };
        })
        .finally(() => client.replyMessage(event.replyToken, echo))
        .catch(() => {
          console.error();
        });
    case "NEWS":
    case "公告":
      const newsCard: line.FlexBubble[] = [];
      return getGBFLatestNews()
        .then((result: IGBFNews[]) => {
          return result;
        })
        .then((dataList: IGBFNews[]) => {
          dataList.forEach(data => {
            newsCard.push({
              type: "bubble",
              header: {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: data.text,
                    wrap: true,
                    contents: [
                      {
                        type: "span",
                        text: data.text,
                        weight: "bold",
                        size: "xl"
                      }
                    ]
                  }
                ]
              },
              hero: {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "image",
                    url: data.thumbnailImg,
                    size: "full",
                    aspectMode: "fit",
                    aspectRatio: "2:1"
                  }
                ]
              },
              body: {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: data.date,
                    size: "sm",
                    color: "#aaaaaa"
                  }
                ]
              },
              footer: {
                type: "box",
                layout: "vertical",
                height: "100px",
                contents: [
                  {
                    type: "button",
                    action: {
                      type: "uri",
                      label: "続きを読む",
                      uri: data.url
                    }
                  }
                ]
              },
              action: {
                type: "uri",
                label: "続きを読む",
                uri: data.url
              }
            });
          });
        })
        .then(() => {
          echo = {
            type: "flex",
            altText: EUrls.GBFNews,
            contents: {
              type: "carousel",
              contents: newsCard
            }
          };
        })
        .finally(() => client.replyMessage(event.replyToken, echo))
        .catch(() => {
          console.error();
        });
    case "FIRE":
    case "火":
      axios
        .get(
          "https://gbfssrlistbyod.memo.wiki/d/%b2%d0%d6%a4%c0%ad%bc%e7%ca%c7"
        )
        .then(response => console.log("response", response))
        .catch(err => {
          console.log(err);
        })
        .then(() => {
          return (echo = {
            type: "text",
            text: "Yooooo"
          });
        });
      return client.replyMessage(event.replyToken, echo);
    default:
      echo = {
        type: "text",
        text: `你剛剛說：「${event.message.text}」`
      };
      return client.replyMessage(event.replyToken, echo);
  }
}

module.exports = app;
