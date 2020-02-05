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
    switch (event.message.text.trim().toUpperCase()) {
        case "SSR":
            const charaClass = [];
            return gbfSSRList()
                .then((result) => {
                return result;
            })
                .then((dataList) => {
                dataList.forEach((data, index) => {
                    const contentsArr = [
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
                    altText: "https://gbfssrlistbyod.memo.wiki/",
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
                .finally(() => client.replyMessage(event.replyToken, echo));
        case "NEWS":
        case "公告":
            const newsCard = [];
            return getGBFLatestNews()
                .then((result) => {
                return result;
            })
                .then((dataList) => {
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
// crawler
function crawler(targetUrl, items, elementParser) {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto(targetUrl);
            let urls = await page.evaluate(() => {
                let results = [];
                items.forEach((item, key, parent) => {
                    elementParser(item, key, parent, results);
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
// GBFLatestNewsParser
function GBFLatestNewsParser(item, key, parent, results) {
    if (item.dataset["page"] === "1") {
        const dateAndTime = item.children
            .item(1)
            .firstElementChild.firstElementChild.innerHTML.split("<")[0]
            .split("&nbsp;");
        results.push({
            url: item.children
                .item(1)
                .firstElementChild.children.item(1)
                .firstElementChild.getAttribute("href"),
            text: item.children.item(1).firstElementChild.children.item(1)
                .firstElementChild.textContent,
            thumbnailImg: item.children
                .item(1)
                .firstElementChild.children.item(3)
                .firstElementChild.firstElementChild.getAttribute("src")
                .indexOf("https") !== -1
                ? item.children
                    .item(1)
                    .firstElementChild.children.item(3)
                    .firstElementChild.firstElementChild.getAttribute("src")
                : "https://granbluefantasy.jp/data/news_img_dummy_logo2.jpg",
            date: `${dateAndTime[0]} ${dateAndTime[1]}`
        });
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
                            .firstElementChild.firstElementChild.innerHTML.split("<")[0]
                            .split("&nbsp;");
                        results.push({
                            url: item.children
                                .item(1)
                                .firstElementChild.children.item(1)
                                .firstElementChild.getAttribute("href") || newsUrl,
                            text: item.children.item(1).firstElementChild.children.item(1)
                                .firstElementChild.textContent,
                            thumbnailImg: item.children
                                .item(1)
                                .firstElementChild.children.item(3)
                                .firstElementChild.firstElementChild.getAttribute("src")
                                .indexOf("https") !== -1
                                ? item.children
                                    .item(1)
                                    .firstElementChild.children.item(3)
                                    .firstElementChild.firstElementChild.getAttribute("src")
                                : "https://granbluefantasy.jp/data/news_img_dummy_logo2.jpg",
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
            await page.setDefaultNavigationTimeout(0);
            await page.goto("https://gbfssrlistbyod.memo.wiki/");
            let urls = await page.evaluate(() => {
                let results = [];
                let items = document.querySelectorAll("ul.list-1").item(8).children;
                for (let i = 0; i < 10; i++) {
                    results.push({
                        text: items.item(i).textContent,
                        url: items.item(i).firstElementChild.getAttribute("href"),
                        thumbnailImg: items.item(i).firstElementChild.firstElementChild
                            ? items
                                .item(i)
                                .firstElementChild.firstElementChild.getAttribute("src")
                            : ""
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
