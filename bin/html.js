const fs = require('fs'); 
const { v4: uuidv4 } = require('uuid');
  
let data = "<html><head></head><body><h1>Test</h1></body></html>"; 
let uuid = uuidv4();
  
fs.writeFile("transacties/html/" + uuid + ".html", data, (err) => { 
  if (err) 
    console.log(err); 
  else { 
    console.log("File written successfully\n"); 
  } 
}); 