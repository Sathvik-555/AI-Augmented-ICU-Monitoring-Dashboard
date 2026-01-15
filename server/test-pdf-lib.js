const pdfParse = require('pdf-parse');

console.log('Type of pdfParse:', typeof pdfParse);
console.log('pdfParse value:', pdfParse);
console.log('Is pdfParse a function?', typeof pdfParse === 'function');

if (typeof pdfParse === 'object') {
    console.log('Keys:', Object.keys(pdfParse));
    if (pdfParse.default) {
        console.log('Type of pdfParse.default:', typeof pdfParse.default);
    }
}
