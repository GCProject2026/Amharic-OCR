# Amharic-OCR

This repository contains a backend and frontend for an Amharic OCR service. The backend exposes an endpoint that accepts image uploads, stores them in Cloudinary, and records metadata in MongoDB.

## Backend setup

1. Copy or create a `.env` file in `backend/` with the following variables:
   ```env
   MONGO_URI="<your mongo connection string>"
   CLOUDINARY_NAME="<cloudinary cloud name>"
   CLOUDINARY_API_KEY="<cloudinary api key>"
   CLOUDINARY_API_SECRET="<cloudinary api secret>"
   ```
2. `cd backend && npm install`
3. `node server.js` (or `npm run dev` if you have a script) – the server listens on port 5000.

## Upload endpoint

**URL:** `POST http://localhost:5000/api/ocr/upload`

- Accepts a `multipart/form-data` request
- Field name for file must be `image`
- Responds with JSON containing the MongoDB record and Cloudinary URL

### Example using curl

```bash
curl -F "image=@/path/to/file.jpg" http://localhost:5000/api/ocr/upload
```

### Example Node test script

Run `node backend/test-upload.js /path/to/local.jpg` after starting the backend. This script will print the server response.

---

Feel free to inspect `backend/routes/ocrRoutes.js` and `backend/controllers/ocrController.js` for the implementation.
