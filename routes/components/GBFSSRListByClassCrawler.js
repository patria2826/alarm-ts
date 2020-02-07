"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer = require("puppeteer");
const Urls_1 = require("./Urls");
function GBFSSRListByClassCrawler() {
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
            await page.setDefaultNavigationTimeout(0);
            await page.goto(Urls_1.default.GBFSSRFire);
            let urls = await page.evaluate(() => {
                let results = [];
                let items = document
                    .getElementById("table_edit_1 content_block_1")
                    .children.item(1).children;
                const count = items.length;
                for (let i = 0; i < count; i++) {
                    results.push({
                        name: items.item(i).children.item(2).firstElementChild.textContent,
                        url: items
                            .item(i)
                            .children.item(2)
                            .firstElementChild.getAttribute("href"),
                        thumbnailImg: items
                            .item(i)
                            .children.item(1)
                            .firstElementChild.getAttribute("src")
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
exports.default = GBFSSRListByClassCrawler;
