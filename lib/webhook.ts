import * as line from "@line/bot-sdk";
import * as express from "express";
import * as puppeteer from "puppeteer";

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
  let replyText: string;

  switch (event.message.text.toUpperCase()) {
    case "SSR":
      replyText = "https://gbfssrlistbyod.memo.wiki/";
      break;
    case "NEWS" || "公告":
      getGBFlatestNews()
        .then(response => (replyText = JSON.stringify(response)))
        .catch(err => (replyText = err));
      break;
    default:
      replyText = `你剛剛說：「${event.message.text}」`;
      break;
  }

  const echo: line.TextMessage = {
    type: "text",
    text: replyText
  };

  // use reply API
  return client.replyMessage(event.replyToken, echo);
}

// GBF crawler
async function getGBFlatestNews() {
  return new Promise(async (resolve, reject) => {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      const newsUrl = "https://granbluefantasy.jp/news/index.php";
      await page.goto(newsUrl);
      let urls = await page.evaluate(() => {
        let results: any[] = [];
        let items = document.querySelectorAll("article.scroll_show_box");
        items.forEach(
          (item: HTMLElement, key: number, parent: NodeListOf<Element>) => {
            if (item.dataset["page"] === "1") {
              results.push({
                url:
                  item.children
                    .item(1)
                    .children.item(0)
                    .children.item(1)
                    .children.item(0)
                    .getAttribute("href") || newsUrl,
                text: item.children
                  .item(1)
                  .children.item(0)
                  .children.item(1)
                  .children.item(0).textContent
              });
            }
          }
        );
        return results;
      });
      browser.close();
      return resolve(urls);
    } catch (err) {
      return reject(err);
    }
  });
}

module.exports = app;
