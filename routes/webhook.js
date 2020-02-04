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
                type: "template",
                altText: "https://gbfssrlistbyod.memo.wiki/",
                template: {
                    type: "buttons",
                    text: "GBF SSR 腳色",
                    title: "GBF SSR 腳色",
                    actions: [{ type: "uri", label: "", uri: "" }]
                }
            };
            return client.replyMessage(event.replyToken, echo);
        case "NEWS" || "公告":
            let newsCard;
            return getGBFLatestNews()
                .then((result) => {
                return result;
            })
                .then((dataList) => {
                newsCard = [];
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
                    altText: "GBF News",
                    contents: {
                        type: "carousel",
                        contents: newsCard
                    }
                };
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
function getGBFLatestNews() {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            const newsUrl = "https://granbluefantasy.jp/news/index.php";
            await page.goto(newsUrl);
            let urls = await page.evaluate(() => {
                let results = [];
                let items = document.querySelectorAll("article.scroll_show_box");
                items.forEach((item, key, parent) => {
                    if (item.dataset["page"] === "1") {
                        const dateAndTime = item.children
                            .item(1)
                            .children.item(0)
                            .children.item(0)
                            .innerHTML.split("<")[0]
                            .split("&nbsp;");
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
                                .getAttribute("src"),
                            date: `${dateAndTime[0]} ${dateAndTime[1]}`
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
function gbfSSRList() {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            const ssrListUrl = "https://gbfssrlistbyod.memo.wiki/";
            await page.goto(ssrListUrl);
            let urls = await page.evaluate(() => {
                let results = [];
                let items = document.querySelector("ul#362777_block_5").children;
                for (let i = 1; i < items.length; i++) {
                    results.push({
                        url: items.item(i).getAttribute("href"),
                        text: items
                            .item(i)
                            .children.item(0)
                            .getAttribute("innerText"),
                        thumbnailImg: items
                            .item(i)
                            .children.item(0)
                            .children.item(0)
                            .getAttribute("src")
                    });
                }
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
