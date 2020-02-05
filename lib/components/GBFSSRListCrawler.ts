import * as puppeteer from "puppeteer";
import { IGBFSSRList } from "./Interface";
import EUrls from "./Urls";

function gbfSSRList() {
  return new Promise(async (resolve, reject) => {
    try {
      const browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"] //for heroku
      });
      const page = await browser.newPage();
      const ssrListUrl = EUrls.GBFSSR;
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
