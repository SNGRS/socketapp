const puppeteer = require("puppeteer");
const fs = require("fs");

async function createPDF(file) {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  const html = fs.readFileSync(file + ".html", "utf-8");
  await page.setContent(html, { waitUntil: "domcontentloaded" });
  await page.emulateMediaType("print");

  const kassabon = await page.pdf({
    path: "transacties/kassabonnen/sample.pdf",
    margin: { top: "10px", right: "5px", bottom: "0px", left: "5px" },
    printBackground: true,
    width: "80mm",
    height: "549mm",
  });
  const pakbon = await page.pdf({
    path: "transacties/pakbonnen/sample.pdf",
    margin: { top: "100px", right: "10px", bottom: "100px", left: "10px" },
    printBackground: true,
    format: "A4",
  });

  await browser.close();
}

(async () => {
  // Create a browser instance
  const browser = await puppeteer.launch({ headless: "new" });

  // Create a new page
  const page = await browser.newPage();

  //Get HTML content from HTML file
  const html = fs.readFileSync("sample.html", "utf-8");
  await page.setContent(html, { waitUntil: "domcontentloaded" });

  // To reflect CSS used for screens instead of print
  await page.emulateMediaType("screen");

  // Downlaod the PDF
  const kassabon = await page.pdf({
    path: "transacties/kassabonnen/sample.pdf",
    margin: { top: "10px", right: "5px", bottom: "0px", left: "5px" },
    printBackground: true,
    width: "80mm",
    height: "549mm",
  });
  const pakbon = await page.pdf({
    path: "transacties/pakbonnen/sample.pdf",
    margin: { top: "100px", right: "10px", bottom: "100px", left: "10px" },
    printBackground: true,
    format: "A4",
  });

  // Close the browser instance
  await browser.close();
})();
