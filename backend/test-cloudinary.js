require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// 1. Configure
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Simple Diagnostic Test
async function runTest() {
    console.log("--- 🕵️ Cloudinary Diagnostic Test ---");
    console.log("Cloud Name:", process.env.CLOUDINARY_NAME);
    
    try {
        // This checks if the credentials can talk to the Cloudinary API
        const result = await cloudinary.api.ping();
        console.log("✅ Connection Successful:", result);

        // This tries to upload a simple remote image as a test
        console.log("📤 Attempting a test upload...");
        const uploadResult = await cloudinary.uploader.upload("https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png", {
            folder: "test_folder"
        });
        console.log("🚀 Upload Success! Image URL:", uploadResult.secure_url);
    } catch (error) {
        console.error("❌ Diagnostic Failed!");
        console.error("Error Message:", error.message);
        console.error("Technical Details:", error);
    }
}

runTest();