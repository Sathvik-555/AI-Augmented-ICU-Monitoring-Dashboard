const fs = require('fs');
const PDFParser = require("pdf2json");
const path = require('path');

const filePath = path.join(__dirname, '../sample_records/John_Doe_Medical_History.pdf');

function parse(filePos) {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(this, 1);
        pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
        pdfParser.on("pdfParser_dataReady", pdfData => {
            resolve(pdfParser.getRawTextContent().trim());
        });
        pdfParser.loadPDF(filePos);
    });
}

async function test() {
    try {
        console.log('Parsing with pdf2json...');
        const text = await parse(filePath);
        console.log('Parsed Text Length:', text.length);
        console.log('Sample:', text.substring(0, 100));
        console.log('SUCCESS');
    } catch (e) {
        console.log('FAILED', e);
    }
}

test();
