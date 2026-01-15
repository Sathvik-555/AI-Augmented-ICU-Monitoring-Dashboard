const fs = require('fs');
const pdfParse = require('pdf-parse');
const path = require('path');

const filePath = path.join(__dirname, '../sample_records/John_Doe_Medical_History.pdf');

async function testParse() {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        console.log(`Read file ${filePath}, size: ${dataBuffer.length}`);
        const data = await pdfParse(dataBuffer);
        console.log('Parsed text length:', data.text.length);
        console.log('First 100 chars:', data.text.substring(0, 100));
    } catch (e) {
        console.error('Parse failed:', e);
    }
}

testParse();
