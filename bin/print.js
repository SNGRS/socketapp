require("dotenv").config();
const { print } = require("pdf-to-printer");

print("transacties/kassabonnen/sample.pdf", {printer: process.env.KASSABON_PRINTER}).then(console.log);
print("transacties/pakbonnen/sample.pdf", {printer: process.env.PAKBON_PRINTER}).then(console.log);