"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const line = require("@line/bot-sdk");
const express = require("express");
const GBFNewsCrawler_1 = require("./components/GBFNewsCrawler");
const GBFSSRListCrawler_1 = require("./components/GBFSSRListCrawler");
const GBFSSRListByClassCrawler_1 = require("./components/GBFSSRListByClassCrawler");
const Urls_1 = require("./components/Urls");
// user config
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
    // ssr by class url
    const getSSRClassUrl = (inputText) => {
        switch (inputText) {
            case "火":
            case "火屬性SSR":
                return Urls_1.EClassUrls.fire;
            case "水":
            case "水屬性SSR":
                return Urls_1.EClassUrls.water;
            case "土":
            case "土屬性SSR":
                return Urls_1.EClassUrls.soil;
            case "風":
            case "風屬性SSR":
                return Urls_1.EClassUrls.wind;
            case "光":
            case "光屬性SSR":
                return Urls_1.EClassUrls.light;
            case "暗":
            case "暗屬性SSR":
                return Urls_1.EClassUrls.dark;
            case "十天眾":
                return Urls_1.EClassUrls.theEternals;
            case "十賢者":
                return Urls_1.EClassUrls.arcarum;
        }
    };
    let ssrClassUrl = getSSRClassUrl(event.message.text);
    //   reply
    switch (event.message.text.trim().toUpperCase()) {
        case "SSR":
            const charaClass = [];
            return GBFSSRListCrawler_1.default()
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
                    altText: Urls_1.EUrls.GBFSSR,
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
            const newsCard = [];
            return GBFNewsCrawler_1.default()
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
                    altText: Urls_1.EUrls.GBFNews,
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
        case "火":
        case "水":
        case "土":
        case "風":
        case "光":
        case "暗":
        case "火屬性SSR":
        case "水屬性SSR":
        case "土屬性SSR":
        case "風屬性SSR":
        case "光屬性SSR":
        case "暗屬性SSR":
        case "十天眾":
        case "十賢者":
            const charaCard = [];
            return GBFSSRListByClassCrawler_1.default(ssrClassUrl)
                .then((result) => {
                return result;
            })
                .then((dataList) => {
                dataList.forEach(data => {
                    charaCard.push({
                        type: "bubble",
                        header: {
                            type: "box",
                            layout: "vertical",
                            contents: [
                                {
                                    type: "text",
                                    text: data.name,
                                    wrap: true,
                                    weight: "bold",
                                    size: "xl",
                                    align: "center"
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
                                    type: "box",
                                    layout: "baseline",
                                    contents: [
                                        {
                                            type: "text",
                                            text: `種族：${data.race}`,
                                            color: "#007799",
                                            contents: []
                                        },
                                        {
                                            type: "text",
                                            text: `Type：${data.charaType}`,
                                            align: "end",
                                            color: "#007799"
                                        }
                                    ]
                                },
                                {
                                    type: "box",
                                    layout: "baseline",
                                    contents: [
                                        {
                                            type: "text",
                                            text: `${data.hp}`,
                                            color: "#00AA00"
                                        },
                                        {
                                            type: "text",
                                            text: `ATK：${data.attack}`,
                                            color: "#E63F00"
                                        }
                                    ]
                                },
                                {
                                    type: "box",
                                    layout: "baseline",
                                    contents: [
                                        {
                                            type: "text",
                                            text: "得意武器："
                                        },
                                        {
                                            type: "text",
                                            text: `${data.weapon[0]}${data.weapon[1] ? "、" : ""}${data.weapon[1] || ""}`,
                                            flex: 2,
                                            color: "#007799"
                                        }
                                    ]
                                }
                            ]
                        },
                        action: {
                            type: "uri",
                            label: data.name,
                            uri: data.url
                        }
                    });
                });
            })
                .then(() => {
                if (charaCard.length > 10) {
                    const echoArrCnt = Math.ceil(charaCard.length / 10);
                    echo = [];
                    for (let i = 0; i < echoArrCnt; i++) {
                        echo.push({
                            type: "flex",
                            altText: ssrClassUrl,
                            contents: {
                                type: "carousel",
                                contents: charaCard.slice(i * 10, i * 10 + 9)
                            }
                        });
                    }
                }
                else {
                    echo = {
                        type: "flex",
                        altText: ssrClassUrl,
                        contents: {
                            type: "carousel",
                            contents: charaCard
                        }
                    };
                }
            })
                .finally(() => client.replyMessage(event.replyToken, echo))
                .catch(err => {
                console.error(err);
            });
        default:
            echo = {
                type: "text",
                text: `你剛剛說：「${event.message.text}」`
            };
            return client.replyMessage(event.replyToken, echo);
    }
}
module.exports = app;
