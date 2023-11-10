#!/usr/bin/env node


/* --------------------------
* TODO *
- Controleer of dotenv-printers ook beschikbaar zijn in de lijst

- Condities regelen kassalade openen hoe - welke functie
- Console.log verbeteren



-------------------------- */

///// DEPENDENCIES
require("dotenv").config();
const chalk = require("chalk");
const boxen = require("boxen");

const { WebSocketServer } = require("ws");
const SerialPort = require('serialport');
const { getPrinters } = require("pdf-to-printer");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const puppeteer = require("puppeteer");
const { print } = require("pdf-to-printer");
const { exec } = require('child_process');

const wss = new WebSocketServer({ port: 3636 });

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);

  ws.on("message", async function message(data) {
    console.log(data.toString('utf8'));

    if (data.toString('utf8') === "openKassalade") {
      openKassalade();
    } else {
      console.log("Zooi ontvangen");
      ws.send(JSON.stringify([0, "Transactie verwerken"]));

      try {
        var file = await opslaanHTML(data);
        ws.send(JSON.stringify([0.3, "Transactie verwerken"]));
        await createPDF(file);

        ws.send(JSON.stringify([0.8, "Kassabon printen"]));
        await print("transacties/kassabonnen/" + file + ".pdf", {
          printer: process.env.KASSABON_PRINTER,
        });

        ws.send(JSON.stringify([0.9, "Pakbon printen"]));
        await print("transacties/pakbonnen/" + file + ".pdf", {
          printer: process.env.PAKBON_PRINTER,
        });

        console.log("received: %s", file);
        ws.send(JSON.stringify([1, "Transactie verwerkt"]));
        ws.send("OK")
      } catch (error) {
        console.error("Fout bij verwerken van bericht:", error);
        // Hier kun je eventueel een foutreactie naar de client sturen.
      }
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

async function createPDF(file) {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  const html = fs.readFileSync("transacties/html/" + file + ".html", "utf-8");
  await page.setContent(html, { waitUntil: "domcontentloaded" });
  await page.emulateMediaType("print");

  const kassabon = await page.pdf({
    path: "transacties/kassabonnen/" + file + ".pdf",
    margin: { top: "10px", right: "5px", bottom: "0px", left: "5px" },
    printBackground: true,
    scale: 0.75,
    width: "80mm",
    height: "549mm",
  });
  const pakbon = await page.pdf({
    path: "transacties/pakbonnen/" + file + ".pdf",
    margin: { top: "100px", right: "10px", bottom: "100px", left: "10px" },
    printBackground: true,
    format: "A4",
  });

  await browser.close();
}
