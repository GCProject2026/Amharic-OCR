from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import tensorflow as tf
import cv2
import numpy as np
import os

app = Flask(__name__)
CORS(app) 

# 1. Load Models 
basepath = os.path.dirname(os.path.abspath(__file__))
yolo_path = os.path.join(basepath, "models", "best.pt")
cnn_path = os.path.join(basepath, "models", "amharic_fidel_cnn_model_237.h5")

yolo_model = YOLO(yolo_path)
cnn_model = tf.keras.models.load_model(cnn_path)

# List of all 237 characters
class_names = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A_caps', 'B_caps', 'C_caps', 'D_caps', 'E_caps', 'F_caps', 'G_caps', 'H_caps', 'I_caps', 'J_caps', 'K_caps', 'L_caps', 'M_caps', 'N_caps', 'O_caps', 'P_caps', 'Q_caps', 'R_caps', 'S_caps', 'T_caps', 'U_caps', 'V_caps', 'W_caps', 'X_caps', 'Y_caps', 'Z_caps', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'ሀ', 'ሁ', 'ሂ', 'ሃ', 'ሄ', 'ህ', 'ሆ', 'ለ', 'ሉ', 'ሊ', 'ላ', 'ሌ', 'ል', 'ሎ', 'ሏ', 'ሐ', 'ሒ', 'ሓ', 'ሔ', 'ሕ', 'ሖ', 'መ', 'ሙ', 'ሚ', 'ማ', 'ሜ', 'ም', 'ሞ', 'ሟ', 'ሠ', 'ሡ', 'ሢ', 'ሣ', 'ሤ', 'ሥ', 'ሦ', 'ረ', 'ሩ', 'ሪ', 'ራ', 'ሬ', 'ር', 'ሮ', 'ሯ', 'ሰ', 'ሱ', 'ሲ', 'ሳ', 'ሴ', 'ስ', 'ሶ', 'ሷ', 'ሸ', 'ሹ', 'ሺ', 'ሻ', 'ሼ', 'ሽ', 'ሾ', 'ሿ', 'ቀ', 'ቁ', 'ቂ', 'ቃ', 'ቄ', 'ቅ', 'ቆ', 'በ', 'ቡ', 'ቢ', 'ባ', 'ቤ', 'ብ', 'ቦ', 'ቧ', 'ቨ', 'ቩ', 'ቪ', 'ቫ', 'ቬ', 'ቭ', 'ቮ', 'ተ', 'ቱ', 'ቲ', 'ታ', 'ቴ', 'ት', 'ቶ', 'ቷ', 'ቸ', 'ቹ', 'ቺ', 'ቻ', 'ቼ', 'ች', 'ቾ', 'ቿ', 'ኀ', 'ኁ', 'ኂ', 'ኃ', 'ኄ', 'ኅ', 'ኆ', 'ኈ', 'ኋ', 'ነ', 'ኑ', 'ኒ', 'ና', 'ኔ', 'ን', 'ኖ', 'ኗ', 'ኘ', 'ኙ', 'ኚ', 'ኛ', 'ኜ', 'ኝ', 'ኞ', 'ኟ', 'አ', 'ኡ', 'ኢ', 'ኣ', 'ኤ', 'እ', 'ኦ', 'ኧ', 'ከ', 'ኩ', 'ኪ', 'ካ', 'ኬ', 'ክ', 'ኮ', 'ኰ', 'ኳ', 'ኺ', 'ኻ', 'ኼ', 'ኽ', 'ኾ', 'ዂ', 'ወ', 'ዉ', 'ዊ', 'ዋ', 'ዌ', 'ው', 'ዎ', 'ዐ', 'ዑ', 'ዒ', 'ዓ', 'ዔ', 'ዕ', 'ዖ', 'ዘ', 'ዙ', 'ዚ', 'ዛ', 'ዜ', 'ዝ', 'ዞ', 'ዟ', 'ዠ', 'ዡ', 'ዢ', 'ዣ', 'ዤ', 'ዥ', 'ዦ', 'ዧ', 'የ', 'ዩ', 'ዪ', 'ያ', 'ዬ', 'ይ', 'ዮ', 'ደ', 'ዱ', 'ዲ', 'ዳ', 'ዴ', 'ድ', 'ዶ', 'ዷ', 'ጀ', 'ጁ', 'ጂ', 'ጃ', 'ጄ', 'ጅ', 'ጆ', 'ጇ', 'ገ', 'ጉ', 'ጊ', 'ጋ', 'ጌ', 'ግ', 'ጎ', 'ጓ', 'ጠ', 'ጡ', 'ጢ', 'ጣ', 'ጤ', 'ጥ', 'ጦ', 'ጧ', 'ጨ', 'ጩ', 'ጪ', 'ጫ', 'ጬ', 'ጭ', 'ጮ', 'ጯ', 'ጰ', 'ጱ', 'ጲ', 'ጳ', 'ጴ', 'ጵ', 'ጶ', 'ጸ', 'ጹ', 'ጺ', 'ጻ', 'ጼ', 'ጽ', 'ጾ', 'ጿ', 'ፀ', 'ፁ', 'ፂ', 'ፃ', 'ፄ', 'ፅ', 'ፆ', 'ፈ', 'ፉ', 'ፊ', 'ፋ', 'ፌ', 'ፍ', 'ፎ', 'ፏ', 'ፐ', 'ፑ', 'ፒ', 'ፓ', 'ፔ', 'ፕ', 'ፖ', '፩', '፪', '፫', '፬', '፭', '፮', '፯', '፰', '፱', '፲', '፲፻', '፳', '፴', '፵', '፶', '፷', '፸', '፹', '፺', '፻']

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    
    file = request.files['image']
    filename = file.filename if '.' in file.filename else f"{file.filename}.png"

    upload_dir = os.path.join(basepath, "uploads")
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
        
    img_path = os.path.join(upload_dir, filename)
    file.save(img_path)
    
    try:
        # 2. Process with YOLO - Conf increased to 0.25 to ignore background noise
        results = yolo_model.predict(source=str(img_path), conf=0.25, imgsz=960, verbose=False)[0]
        
        if results.boxes is None or len(results.boxes) == 0:
            return jsonify({"text": "", "message": "No characters detected"})

        # Sort boxes: Top-to-Bottom (primary) and Left-to-Right (secondary)
        boxes = results.boxes.xyxy.cpu().numpy()
        boxes = sorted(boxes, key=lambda b: (b[1] // 20, b[0])) 

        img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
        
        recognized_text = ""
        
        recognized_text = ""
        for i, (x1, y1, x2, y2) in enumerate(boxes):
            x1, y1, x2, y2 = map(int, [x1, y1, x2, y2])
            crop = img[y1:y2, x1:x2]
            
            if crop.size == 0: continue
            
            # 1. Standardize size with padding
            # We resize to 54x54 and add a 5px border to reach 64x64
            # This prevents the character from touching the edges.
            crop = cv2.resize(crop, (54, 54))
            crop = cv2.copyMakeBorder(crop, 5, 5, 5, 5, cv2.BORDER_CONSTANT, value=[255, 255, 255])
            
            # 2. Aggressive Binarization
            # We invert first, then use Otsu's threshold to make it purely Black & White
            # crop = cv2.bitwise_not(crop)
            _, crop = cv2.threshold(crop, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            # 3. NORMALIZE (Check if your model was trained on 0-255 or 0-1)
            # Most Keras models expect 0-1
            # crop = crop.astype("float32") / 255.0
            crop = crop.reshape(1, 64, 64, 1)

            # 4. Predict
            prediction = cnn_model.predict(crop, verbose=0)
            idx = np.argmax(prediction)
            
            # DEBUG: Let's see if the index actually CHANGES now
            print(f"📦 Box {i} -> Index: {idx}")
            
            recognized_text += class_names[idx]

        print(f"📝 OCR Result: {recognized_text}")
        return jsonify({"text": recognized_text})

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)