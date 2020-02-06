import * as puppeteer from "puppeteer";
import { IGBFSSRList } from "./Interface";
import EUrls from "./Urls";

function gbfSSRList() {
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
      await page.goto(EUrls.GBFSSR);
      let urls = await page.evaluate(() => {
        let results: IGBFSSRList[] = [];
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
    } catch (err) {
      return reject(err);
    }
  });
}

export default gbfSSRList;
