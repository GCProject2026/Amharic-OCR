const OcrRecord = require('../models/OcrRecord');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

/**
 * Run Hasab AI Python script for transcription
 */
const runHasabTranscribe = (inputPath, language = 'am') => {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, '../ai_service/transcribe.py');
        const python = process.env.PYTHON || 'C:\\Users\\pc\\Desktop\\lala\\Amharic-OCR\\.venv\\Scripts\\python.exe';
        const args = [scriptPath, '--input', inputPath, '--language', language];

        console.log("🐍 Running Hasab Python script...");
        console.log("Command:", python, args.join(' '));

        const proc = spawn(python, args, { 
            stdio: ['ignore', 'pipe', 'pipe'],
            env: { 
                ...process.env,
                HASAB_API_KEY: process.env.HASAB_API_KEY,
                PYTHONIOENCODING: 'utf-8'  // Force UTF-8 encoding for Unicode
            }
        });

        let stdout = '';
        let stderr = '';

        proc.stdout.on('data', (chunk) => { 
            const output = chunk.toString('utf-8');
            stdout += output;
            console.log("📤 Python stdout:", output.trim());
        });
        
        proc.stderr.on('data', (chunk) => { 
            const errorOutput = chunk.toString('utf-8');
            stderr += errorOutput;
            console.log("📥 Python stderr:", errorOutput.trim());
        });

        proc.on('close', (code) => {
            console.log(`🔚 Python process closed with code ${code}`);
            
            if (code !== 0) {
                console.error("❌ Python process failed with stderr:", stderr);
                return reject(new Error(`Hasab failed (code ${code}): ${stderr.trim()}`));
            }
            
            try {
                // Find the last line that looks like JSON
                const lines = stdout.trim().split('\n').filter(line => line.trim());
                console.log("📊 Output lines:", lines.length);
                
                // Try to parse each line until we find valid JSON
                let lastError = null;
                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);
                        if (data.error) {
                            lastError = data.error;
                            continue;
                        }
                        if (data.text) {
                            console.log("✅ Successfully parsed transcription:", data.text.substring(0, 50));
                            return resolve(data);
                        }
                    } catch (e) {
                        // Not JSON, ignore
                        lastError = e.message;
                    }
                }
                
                // If we get here, no valid JSON with text was found
                reject(new Error(lastError || `No valid transcription in output: ${stdout.substring(0, 200)}`));
                
            } catch (err) {
                console.error("❌ Error parsing output:", err);
                reject(new Error(`Invalid output: ${err.message}\nstdout: ${stdout.substring(0, 200)}`));
            }
        });

        // Handle process errors
        proc.on('error', (err) => {
            console.error("❌ Failed to start Python process:", err);
            reject(new Error(`Failed to start Python: ${err.message}`));
        });
    });
};

/**
 * Upload image to Cloudinary and save to MongoDB
 */
const uploadAndProcessImage = async (req, res) => {
    console.log("--- 📥 New OCR Upload Request ---");
    
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                message: "No file uploaded. Ensure the field name is 'image'." 
            });
        }

        console.log("✅ File received:", req.file.originalname);

        // Upload to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'amharic_ocr_project' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(req.file.buffer);
        });

        console.log("☁️ Cloudinary Upload Success");

        // Save to MongoDB
        const newRecord = new OcrRecord({
            imageUrl: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            originalName: req.file.originalname,
            status: 'pending'
        });

        const savedRecord = await newRecord.save();
        console.log("💾 MongoDB Record Created:", savedRecord._id);

        res.status(201).json({
            success: true,
            message: "Image uploaded successfully",
            data: savedRecord
        });

    } catch (error) {
        console.error("❌ Error:", error.message);
        res.status(500).json({ 
            success: false,
            message: "Server error", 
            error: error.message 
        });
    }
};

/**
 * Transcribe audio using Hasab AI
 */
const transcribeAudio = async (req, res) => {
    console.log("--- 🎙️ New Audio Transcription Request (Hasab AI) ---");

    if (!req.file) {
        return res.status(400).json({ 
            success: false, 
            message: "No audio file uploaded. Use field name 'audio'." 
        });
    }

    console.log("✅ Audio file received:", req.file.originalname);
    console.log("File details:", {
        mimetype: req.file.mimetype,
        size: req.file.size,
        originalname: req.file.originalname
    });

    // Create temp file with proper extension
    const tempDir = os.tmpdir();
    const fileExt = path.extname(req.file.originalname) || '.wav';
    const tempFile = path.join(tempDir, `hasab_${Date.now()}${fileExt}`);

    try {
        // Save buffer to temp file
        await fs.promises.writeFile(tempFile, req.file.buffer);
        console.log("📝 Temp file created:", tempFile);

        // Check for API key
        if (!process.env.HASAB_API_KEY) {
            throw new Error("HASAB_API_KEY not found in .env file");
        }

        // Transcribe with Hasab
        console.log("📡 Calling Hasab AI...");
        const result = await runHasabTranscribe(tempFile, 'am');
        
        console.log("✅ Hasab AI transcription complete");
        console.log("📝 Transcription text:", result.text);

        // Send the transcription back to frontend
        res.status(200).json({ 
            success: true, 
            text: result.text
        });
        
    } catch (error) {
        console.error("❌ Transcription error:", error.message);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    } finally {
        // Clean up temp file
        try {
            await fs.promises.unlink(tempFile);
            console.log("🧹 Temp file cleaned up");
        } catch (err) {
            // Ignore cleanup errors
            console.log("⚠️ Failed to clean up temp file:", err.message);
        }
    }
};

module.exports = { uploadAndProcessImage, transcribeAudio };