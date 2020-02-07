import * as puppeteer from "puppeteer";
import { IGBFSSRList } from "./Interface";
import EUrls from "./Urls";

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
      await page.goto(EUrls.GBFSSRFire);
      let urls = await page.evaluate(() => {
        let results: any[] = [];
        let items = document
          .getElementById("table_edit_1 content_block_1")
          .children.item(1).children;
        const count = items.length;
        for (let i = 0; i < count; i++) {
          results.push({
            // text: items.item(i).textContent,
            // url: items.item(i).firstElementChild.getAttribute("href"),
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
    } catch (err) {
      return reject(err);
    }
  });
}

export default GBFSSRListByClassCrawler;
