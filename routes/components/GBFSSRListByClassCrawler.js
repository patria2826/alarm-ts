"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer = require("puppeteer");
function GBFSSRListByClassCrawler(classURL) {
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
            await page.goto(classURL);
            let urls = await page.evaluate(() => {
                let results = [];
                let items = document
                    .getElementById("table_edit_1 content_block_1")
                    .children.item(1).children;
                const count = items.length;
                for (let i = 0; i < count; i++) {
                    results.push({
                        thumbnailImg: items
                            .item(i)
                            .children.item(1)
                            .firstElementChild.getAttribute("src"),
                        name: items.item(i).children.item(2).firstElementChild.textContent,
                        url: items
                            .item(i)
                            .children.item(2)
                            .firstElementChild.getAttribute("href"),
                        charaType: items.item(i).children.item(4).textContent,
                        race: items.item(i).children.item(5).textContent,
                        weapon: [
                            items.item(i).children.item(6).textContent,
                            items.item(i).children.item(7).textContent
                        ],
                        hp: items.item(i).children.item(8).textContent,
                        attack: items.item(i).children.item(9).textContent
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
