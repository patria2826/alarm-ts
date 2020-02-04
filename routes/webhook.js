"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const line = require("@line/bot-sdk");
const express = require("express");
const puppeteer = require("puppeteer");
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
    let echo;
    switch (event.message.text.toUpperCase()) {
        case "SSR":
            echo = {
                type: "text",
                text: "https://gbfssrlistbyod.memo.wiki/"
            };
            return client.replyMessage(event.replyToken, echo);
        case "NEWS" || "公告":
            let newsColumn;
            let newsCard;
            return getGBFLatestNews()
                .then((result) => {
                return result;
            })
                .then((dataList) => {
                console.log("dataList", dataList);
                newsColumn = [];
                newsCard = [];
                dataList.forEach(data => {
                    newsCard.push({
                        type: "bubble",
                        body: {
                            type: "box",
                            layout: "vertical",
                            contents: [
                                {
                                    type: "text",
                                    text: data.text,
                                    weight: "bold",
                                    size: "xl"
                                },
                                {
                                    type: "image",
                                    url: data.thumbnailImg,
                                    size: "full",
                                    aspectMode: "fit"
                                    // action: {
                                    //   type: "uri",
                                    //   label: "",
                                    //   uri: data.url
                                    // }
                                },
                                {
                                    type: "text",
                                    text: "続きを読む",
                                    weight: "regular",
                                    size: "lg",
                                    action: {
                                        type: "uri",
                                        label: "続きを読む",
                                        uri: data.url
                                    }
                                }
                            ]
                        }
                    });
                    // newsColumn.push({
                    //   thumbnailImageUrl: data.thumbnailImg,
                    //   imageBackgroundColor: "#FFFFFF",
                    //   actions: [
                    //     {
                    //       type: "uri",
                    //       label: "続きを読む",
                    //       uri: data.url
                    //     }
                    //   ],
                    //   text: data.text
                    // });
                });
                console.log("newsCard", newsCard);
            })
                .then(() => {
                echo = {
                    type: "flex",
                    altText: "GBF News",
                    contents: {
                        type: "carousel",
                        contents: newsCard
                    }
                };
                //   echo = {
                //     type: "template",
                //     altText: "GBF News",
                //     template: {
                //       type: "carousel",
                //       columns: newsColumn
                //     }
                //   };
            })
                .finally(() => client.replyMessage(event.replyToken, echo));
        default:
            echo = {
                type: "text",
                text: `你剛剛說：「${event.message.text}」`
            };
            return client.replyMessage(event.replyToken, echo);
    }
}
// GBF crawler
const newsUrl = "https://granbluefantasy.jp/news/index.php";
async function getGBFLatestNews() {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto(newsUrl);
            //   await page.goto("https://granbluefantasy.jp/news/index.php");
            let urls = await page.evaluate(() => {
                let results = [];
                let items = document.querySelectorAll("article.scroll_show_box");
                items.forEach((item, key, parent) => {
                    if (item.dataset["page"] === "1") {
                        results.push({
                            url: item.children
                                .item(1)
                                .children.item(0)
                                .children.item(1)
                                .children.item(0)
                                .getAttribute("href") || newsUrl,
                            text: item.children
                                .item(1)
                                .children.item(0)
                                .children.item(1)
                                .children.item(0).textContent,
                            thumbnailImg: item.children
                                .item(1)
                                .children.item(0)
                                .children.item(3)
                                .children.item(0)
                                .children.item(0)
                                .getAttribute("src")
                        });
                    }
                });
                return results;
            });
            browser.close();
            return resolve(urls);
        }
        catch (err) {
            return reject(err);
        }
    });
}
module.exports = app;
