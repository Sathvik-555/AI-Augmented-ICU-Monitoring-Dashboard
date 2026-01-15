const pdfParseLib = require('pdf-parse');
console.log('Keys:', Object.keys(pdfParseLib));
if (pdfParseLib.PDFParse) {
    console.log('PDFParse type:', typeof pdfParseLib.PDFParse);
    console.log('PDFParse prototype:', pdfParseLib.PDFParse.prototype);
}

// Try to use it?
const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../sample_records/John_Doe_Medical_History.pdf');

if (fs.existsSync(filePath)) {
    const buffer = fs.readFileSync(filePath);
    // If it's a class
    try {
        // Guessing usage based on 2.0 trends
        // new PDFParse(buffer)?
        // PDFParse.extract(buffer)?
        console.log('Trying to inspect static methods...');
        console.log(Object.getOwnPropertyNames(pdfParseLib.PDFParse));
    } catch (e) {
        console.log(e);
    }
}
