#!/usr/bin/env node

require("dotenv").config();
const chalk = require("chalk");
const boxen = require("boxen");
const { WebSocketServer } = require("ws");
const { print, getPrinters } = require("pdf-to-printer");
const fs = require("fs").promises;  // Gebruik de promisified versie van fs voor asynchrone operaties
const { v4: uuidv4 } = require("uuid");
const puppeteer = require("puppeteer");
const { exec } = require('child_process');
let browserPromise;

const wss = new WebSocketServer({ port: 3636 });

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);

  ws.on("message", async function message(data) {
    //console.log(data.toString('utf8'));
    console.log("\n")

    if (data.toString('utf8') === "openKassalade") {
      openKassalade();
    } else {
      await verwerkTransactie(data, ws);
    }

    
  });

  ws.send(JSON.stringify(true));
});

async function startBrowser() {
  const browser = await puppeteer.launch({ headless: "new" });
  //console.log("Puppeteer ook gestart");
  console.log( chalk.bgGreen("BROWSER") + "\t Achtergrondhelper gestart" )
  return browser;
}

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = startBrowser();
  }

  return browserPromise;
}

async function verwerkTransactie(data, ws) {
  //console.log("Zooi ontvangen");
  console.log( chalk.bgWhite.black("TRANSACTIE") + "\t Transactie ontvangen" )
  ws.send(JSON.stringify([0, "Transactie verwerken"]));

  try {
    const file = await opslaanHTML(data);
    ws.send(JSON.stringify([0.3, "Transactie verwerken"]));
    const browser = await getBrowser();
    await createPDF(file, ws, browser);
    //console.log("received:", file);
    ws.send(JSON.stringify([1, "Transactie verwerkt"]));
    ws.send("OK");
  } catch (error) {
    //console.error("Fout bij verwerken van bericht:", error);
    console.log( chalk.bgRed("TRANSACTIE") + "\t Fout bij verwerken van bericht:" + error )
    // Hier kun je eventueel een foutreactie naar de client sturen.
  }
}

function openKassalade() {
  exec('OpenLade.exe', (error, stdout, stderr) => {
    if (error) {
      //console.error(`OpenLade.exe: ${error}`);
      console.log( chalk.bgRed("KASSALADE") + `\t ${error}` )
      return;
    }
    //console.log('OpenLade.exe is gestart');
    console.log( chalk.bgWhite.black("KASSALADE") + "\t Kassalade geopend" )
  });
}

async function opslaanHTML(html) {
  const uuid = uuidv4();
  const filePath = `transacties/html/${uuid}.html`;

  try {
    await fs.writeFile(filePath, html);
    //console.log("File written successfully\n");
    console.log( chalk.bgWhite.black("TRANSACTIE") + "\t Transactie opgeslagen als " + uuid )
  } catch (err) {
    //console.error(err);
    console.log( chalk.bgRed("TRANSACTIE") + "\t Fout bij opslaan van transactie: " + err )
  }

  return uuid;
}

async function createPDF(file, ws, browser) {
  const htmlPath = `transacties/html/${file}.html`;
  const pdfPath = `transacties/kassabonnen/${file}.pdf`;
  const pakbonPath = `transacties/pakbonnen/${file}.pdf`;

  try {
    const html = await fs.readFile(htmlPath, "utf-8");

    ws.send(JSON.stringify([0.4, "Transactie verwerken"]));
    console.log( chalk.bgWhite.black("TRANSACTIE") + "\t PDF-maker geopend" )
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    await page.emulateMediaType("print");
    ws.send(JSON.stringify([0.6, "Transactie verwerken"]));

    console.log( chalk.bgWhite.black("TRANSACTIE") + "\t Kassabon maken" )
    const kassabon = await page.pdf({
      path: pdfPath,
      margin: { top: "10px", right: "5px", bottom: "0px", left: "5px" },
      printBackground: true,
      scale: 0.75,
      width: "80mm",
      height: "549mm",
    });

    ws.send(JSON.stringify([0.7, "Kassabon printen"]));
    console.log( chalk.bgWhite.black("TRANSACTIE") + "\t Kassabon printen" )
    await print(pdfPath, {
      printer: process.env.KASSABON_PRINTER,
    });
    console.log( chalk.bgWhite.black("TRANSACTIE") + "\t Kassabon geprint" )

    ws.send(JSON.stringify([0.8, "Pakbon printen"]));
    
    console.log( chalk.bgWhite.black("TRANSACTIE") + "\t Pakbon maken" )
    const pakbon = await page.pdf({
      path: pakbonPath,
      margin: { top: "100px", right: "10px", bottom: "100px", left: "10px" },
      printBackground: true,
      format: "A4",
    });

    ws.send(JSON.stringify([0.9, "Pakbon printen"]));
    console.log( chalk.bgWhite.black("TRANSACTIE") + "\t Pakbon printen" )
    await print(pakbonPath, { printer: process.env.PAKBON_PRINTER });
    console.log( chalk.bgWhite.black("TRANSACTIE") + "\t Pakbon geprint" )

    await page.close();
  } catch (error) {
    console.log( chalk.bgRed("TRANSACTIE") + "\t Fout bij maken/printen PDF: " + err )
    // Hier kun je eventueel een foutreactie naar de client sturen.
  }
}

async function checkAndPrint() {
  const pakbonPrinterName = process.env.PAKBON_PRINTER;
  const kassabonPrinterName = process.env.KASSABON_PRINTER;

  try {
    const printers = await getPrinters(); // aanname: getPrinters retourneert een Promise

    const pakbonPrinterExists = printers.some(printer => printer.name === pakbonPrinterName);
    const kassabonPrinterExists = printers.some(printer => printer.name === kassabonPrinterName);

    if (!pakbonPrinterExists || !kassabonPrinterExists) {
      const missingPrinters = [];
      if (!pakbonPrinterExists) {
        missingPrinters.push(pakbonPrinterName);
      }
      if (!kassabonPrinterExists) {
        missingPrinters.push(kassabonPrinterName);
      }
      throw new Error(`De volgende printers bestaan niet: ${missingPrinters.join(', ')}`);
    }

    // Voer de printfuncties uit als beide printers bestaan
    await print("startup.pdf", {
      printer: process.env.KASSABON_PRINTER,
    });
    console.log( chalk.bgGreen("PRINTER") + "\t Kassabonprinter gestart" )

    await print("startup.pdf", {
      printer: process.env.PAKBON_PRINTER,
    });
    console.log( chalk.bgGreen("PRINTER") + "\t Pakbonprinter gestart" )

  } catch (error) {
    console.log( boxen(error.message + "\nDit programma is afgesloten. Pas de instellingen opnieuw aan in '.env' en start dit programma opnieuw", {title: 'PRINTER \t FOUTMELDING', titleAlignment: 'center', backgroundColor: 'red', borderColor: 'red', padding: 2}) );
    process.exit(1); // Stop het script met een foutstatus
  }
}

async function run() {
  console.log( boxen(chalk.white.bold('SOCKETAPP'), {padding: 1, borderStyle: 'double', width: 100, textAlignment: "center"}) )
  console.log("Console wordt opgestart. Wacht totdat alles is opgestart")
  console.log("-----------------------------------")
  console.log( chalk.bgGreen("SOCKET") + "\t Websocket-server opgestart" )

  await checkAndPrint();
  await getBrowser();

  console.log( boxen("App is opgestart. Goede verkoop!", { backgroundColor: 'green', padding: {top: 1, bottom: 1} }) )
  console.log("-----------------------------------")
}

// Start de uitvoering
run();