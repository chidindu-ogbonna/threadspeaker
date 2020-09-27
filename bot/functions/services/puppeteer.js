/* global require exports */
const puppeteer = require("puppeteer");
const { genTempFile } = require("../helpers/utils");

const PUPPETEER_OPTIONS = {
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--hide-scrollbars"],
  ignoreDefaultArgs: ["--disable-extensions"],
};

/**
 * Generate screenshot of a webpage
 *
 * @param {String} url - the url of the webpage
 * @return {Promise<String>} temporary file path
 */
exports.genPreviewImage = async (url) => {
  const browser = await puppeteer.launch(PUPPETEER_OPTIONS);
  const page = await browser.newPage();

  try {
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36"
    );
    await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
    const viewport = { width: 648, height: 358 };
    await page.setViewport(viewport);

    const urlSplit = url.split("/");
    const id = urlSplit[urlSplit.length - 1];

    const fileName = `${id}.png`;

    const tempFilePath = genTempFile(fileName);
    await page.screenshot({ path: tempFilePath, type: "png" });

    return tempFilePath;
  } finally {
    await page.close();
    await browser.close();
  }
};
