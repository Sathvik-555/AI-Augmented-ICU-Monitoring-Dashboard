const pdfParse = require('pdf-parse');

console.log('Keys:', Object.keys(pdfParse));

try {
    const PDFParse = pdfParse.PDFParse;
    console.log('PDFParse static properties:', Object.keys(PDFParse));
    console.log('PDFParse prototype properties:', Object.getOwnPropertyNames(PDFParse.prototype));
} catch (e) {
    console.log('Error inspecting PDFParse:', e);
}
