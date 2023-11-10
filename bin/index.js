#!/usr/bin/env node

require("dotenv").config();
const chalk = require("chalk");
const boxen = require("boxen");

const { WebSocketServer } = require("ws");
const SerialPort = require('serialport');
const { print, getPrinters } = require("pdf-to-printer");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const puppeteer = require("puppeteer");
const { exec } = require('child_process');

const wss = new WebSocketServer({ port: 3636 });

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);

  ws.on("message", async function message(data) {
    console.log(data.toString('utf8'));

    if (data.toString('utf8') === "openKassalade") {
      openKassalade();
    } else {
      await verwerkTransactie(data, ws)
    }
  });

  ws.send(JSON.stringify(true));
});

const greeting = chalk.white.bold(
  "Poort 3636 is er klaar voor!"
);

const boxenOptions = {
  padding: 1,
  margin: 1,
  borderStyle: "round",
  borderColor: "green",
  backgroundColor: "#555555",
};
const msgBox = boxen(greeting, boxenOptions);

console.log(msgBox);

getPrinters().then(console.log);

let browserPromise;

// Functie om de browser te starten
async function startBrowser() {
  const browser = await puppeteer.launch({ headless: "new" });
  console.log("Puppeteer ook gestart");
  return browser;
}

// Functie om de browser-instantie op te halen
async function getBrowser() {
  if (!browserPromise) {
    browserPromise = startBrowser();
  }
  return browserPromise;
}

getBrowser()

async function verwerkTransactie(data, ws) {
  console.log("Zooi ontvangen");
  ws.send(JSON.stringify([0, "Transactie verwerken"]));

  try {
    var file = await opslaanHTML(data);
    ws.send(JSON.stringify([0.3, "Transactie verwerken"]));
    const browser = await getBrowser();
    await createPDF(file, ws, browser);
    console.log("received: %s", file);
    ws.send(JSON.stringify([1, "Transactie verwerkt"]));
    ws.send("OK")
  } catch (error) {
    console.error("Fout bij verwerken van bericht:", error);
    // Hier kun je eventueel een foutreactie naar de client sturen.
  }
}

function openKassalade() {
  exec('OpenLade.exe', (error, stdout, stderr) => {
    if (error) {
      console.error(`OpenLade.exe: ${error}`);
      return;
    }
    console.log('OpenLade.exe is gestart');
  });
}

async function opslaanHTML(html) {
  let uuid = uuidv4();

  fs.writeFile("transacties/html/" + uuid + ".html", html, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("File written successfully\n");
    }
  });

  return uuid;
}

async function createPDF(file, ws, browser) {
  ws.send(JSON.stringify([0.4, "Transactie verwerken"]));
  const page = await browser.newPage();
  const html = fs.readFileSync("transacties/html/" + file + ".html", "utf-8");
  await page.setContent(html, { waitUntil: "domcontentloaded" });
  await page.emulateMediaType("print");
  ws.send(JSON.stringify([0.6, "Transactie verwerken"]));

  const kassabon = await page.pdf({
    path: "transacties/kassabonnen/" + file + ".pdf",
    margin: { top: "10px", right: "5px", bottom: "0px", left: "5px" },
    printBackground: true,
    scale: 0.75,
    width: "80mm",
    height: "549mm",
  });

  ws.send(JSON.stringify([0.7, "Kassabon printen"]));
  await print("transacties/kassabonnen/" + file + ".pdf", {
    printer: process.env.KASSABON_PRINTER
  });

  ws.send(JSON.stringify([0.8, "Pakbon printen"]));
  const pakbon = await page.pdf({
    path: "transacties/pakbonnen/" + file + ".pdf",
    margin: { top: "100px", right: "10px", bottom: "100px", left: "10px" },
    printBackground: true,
    format: "A4",
  });

  ws.send(JSON.stringify([0.9, "Pakbon printen"]));
  await print("transacties/pakbonnen/" + file + ".pdf", { printer: process.env.PAKBON_PRINTER})

  await page.close();
}
