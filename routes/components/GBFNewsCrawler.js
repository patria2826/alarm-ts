"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer = require("puppeteer");
const Urls_1 = require("./Urls");
function getGBFLatestNews() {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch({
                args: [
                    //for heroku
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    //to speed up
                    "--proxy-server='direct://'",
                    "--proxy-bypass-list=*"
                ]
            });
            const page = await browser.newPage();
            await page.goto(Urls_1.default.GBFNews);
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
                                .firstElementChild.getAttribute("href") || Urls_1.default.GBFNews,
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
exports.default = getGBFLatestNews;
