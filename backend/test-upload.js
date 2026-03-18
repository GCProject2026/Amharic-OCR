// Simple script to POST an image to the OCR upload endpoint
// Usage: node test-upload.js <path-to-local-image>
// Requires backend server running on http://localhost:5000

require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

async function main() {
    const imagePath = process.argv[2];
    if (!imagePath) {
        console.error('Usage: node test-upload.js <path-to-image>');
        process.exit(1);
    }

    if (!fs.existsSync(imagePath)) {
        console.error('File does not exist:', imagePath);
        process.exit(1);
    }

    const form = new FormData();
    form.append('image', fs.createReadStream(imagePath));

    try {
        console.log('📤 Sending', imagePath, 'to /api/ocr/upload');
        const response = await axios.post(
            'http://localhost:5000/api/ocr/upload',
            form,
            { headers: form.getHeaders() }
        );
        console.log('✅ Server responded:', response.data);
    } catch (err) {
        if (err.response) {
            console.error('❌ Upload failed with status', err.response.status);
            console.error(err.response.data);
        } else {
            console.error('❌ Request error:', err.message);
        }
    }
}

main();
