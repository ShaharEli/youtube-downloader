const homedir = require("os").homedir();
const readline = require("readline");
const fs = require("fs");
const puppeteer = require("puppeteer");
const checkExistsWithTimeout = require("./checkExistsWithTimeout");
const moveFileLocation = require("./moveFileLocation");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Can you provide us the youtube playlist link? ", (link) => {
  rl.question("How do you want to name it? ", async (dir) => {
    const path = require("path").join(homedir + "\\Desktop", dir);
    console.log(`your playlist will be saved in ${path} `);
    try {
      const newDir = path;
      try {
        fs.mkdirSync(newDir);
      } catch (e) {
        console.log(e.message);
        if (!e.message.includes("file already exists")) {
          rl.close();
        }
      }

      const browser = await puppeteer.launch({ headless: false, slowMo: -60 });
      const context = browser.defaultBrowserContext();
      //        URL                  An array of permissions
      context.overridePermissions("https://ytmp3.cc/en13/", ["notifications"]);
      const page = await browser.newPage();
      if (!link.startsWith("https://")) {
        link = "https://" + link;
      }
      await page.goto(link);
      const links = await page.$$(
        "a[class = 'yt-simple-endpoint style-scope ytd-playlist-video-renderer']"
      );
      const textArr = await Promise.all(
        links.map(
          async (link) => await (await link.getProperty("href")).jsonValue()
        )
      );
      const y2mp3 = "https://ytmp3.cc/en13/";
      let counter = links.length;
      const arrOfTitles = [];

      for (let i = 0; i < counter; i++) {
        await page.goto(y2mp3);
        const input = await page.waitForXPath(`//*[@id="input"]`);
        await input.type(textArr[i]);
        await page.keyboard.press("Enter");
        await page.waitForTimeout(1000);
        await page.click(`#buttons > a:nth-child(1)`);
        const fileName = await page.evaluate(() => {
          return document.querySelector(`#title`).textContent.trim();
        });
        arrOfTitles.push("/" + fileName + ".mp3");
        console.log(`downloading ${i + 1}/${counter}...`);
      }
      await page.waitForTimeout(7000);
      for (song of arrOfTitles) {
        const from = homedir + "\\Downloads" + song;
        try {
          await checkExistsWithTimeout(from, 1000);
          await moveFileLocation(from, newDir + song);
        } catch (e) {
          console.log(e.message);
        }
      }
      console.log(`done go to ${newDir} to check out your playlist`);
      browser.close();
    } catch (e) {
      console.log(e.message);
    }
    rl.close();
  });
});
