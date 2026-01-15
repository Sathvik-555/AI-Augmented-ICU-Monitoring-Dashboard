const PDFDocument = require('pdfkit');
const pdfParse = require('pdf-parse');

function createPdfBuffer() {
    return new Promise((resolve) => {
        const doc = new PDFDocument();
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        doc.text('Hello World. This is a robust PDF.');
        doc.end();
    });
}

async function test() {
    try {
        console.log('Generating PDF...');
        const buffer = await createPdfBuffer();
        console.log('PDF Generated. Size:', buffer.length);

        console.log('Parsing PDF...');
        const data = await pdfParse(buffer);
        console.log('Parsed Text:', data.text.trim());
        console.log('SUCCESS');
    } catch (e) {
        console.error('FAILED:', e);
    }
}

test();
