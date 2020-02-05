import * as puppeteer from "puppeteer";
import { IGBFNews } from "./Interface";
import EUrls from "./Urls";

function getGBFLatestNews() {
  return new Promise(async (resolve, reject) => {
    try {
      const browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"] //for heroku
      });
      const page = await browser.newPage();
      const newsUrl = EUrls.GBFNews;
      await page.goto(newsUrl);
      let urls = await page.evaluate(() => {
        let results: IGBFNews[] = [];
        let items = document.querySelectorAll("article.scroll_show_box");
        items.forEach(
          (item: HTMLElement, key: number, parent: NodeListOf<Element>) => {
            if (item.dataset["page"] === "1") {
              const dateAndTime = item.children
                .item(1)
                .firstElementChild.firstElementChild.innerHTML.split("<")[0]
                .split("&nbsp;");
              results.push({
                url:
                  item.children
                    .item(1)
                    .firstElementChild.children.item(1)
                    .firstElementChild.getAttribute("href") || newsUrl,
                text: item.children.item(1).firstElementChild.children.item(1)
                  .firstElementChild.textContent,
                thumbnailImg:
                  item.children
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
        );
        return results;
      });
      browser.close();
      return resolve(urls);
    } catch (err) {
      return reject(err);
    }
  });
}
export default getGBFLatestNews;
