import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import FormData from 'form-data';

dotenv.config();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

class AIService {
    // 1. Đồng bộ sản phẩm sang AI (GỌI KHI TẠO/SỬA SẢN PHẨM)
    static async syncProductsToAI(ownerId, products) {
        try {
            // products: Danh sách object { id, name, price, unit }
            console.log(`🔄 [AIService] Đang sync ${products.length} SP cho user ${ownerId}...`);
            const response = await axios.post(`${AI_SERVICE_URL}/api/products/sync`, {
                owner_id: String(ownerId),
                products: products.map(p => ({
                    id: p.id,
                    name: p.name,
                    price: parseFloat(p.price),
                    unit: p.unit || ''
                }))
            });
            console.log("✅ [AIService] Sync thành công:", response.data);
            return response.data;
        } catch (error) {
            console.error('❌ [AIService] Lỗi Sync:', error.message);
            // Không throw error để tránh chặn luồng chính của app
        }
    }

    // 2. Phân tích text đơn hàng (Gửi kèm Owner ID để RAG tìm đúng kho)
    static async parseOrderFromText(message, ownerId) {
        try {
            const response = await axios.post(`${AI_SERVICE_URL}/api/parse-order`, {
                message: message,
                owner_id: String(ownerId) // Quan trọng: Để AI biết tìm kho nào
            });
            return response.data;
        } catch (error) {
            console.error('[AIService] Lỗi Parse Text:', error.message);
            if (error.response) console.error('   -> Python Response:', error.response.data);
            
            // Fallback: Trả về object rỗng để app không crash
            return {
                customer_name: null,
                items: [],
                is_debt: false,
                original_message: message
            };
        }
    }

    // 3. Dịch file âm thanh (Speech-to-Text)
    static async transcribeAudio(filePath) {
        try {
            if (!fs.existsSync(filePath)) {
                throw new Error(`File không tồn tại: ${filePath}`);
            }

            const formData = new FormData();
            formData.append('audio', fs.createReadStream(filePath));

            const response = await axios.post(`${AI_SERVICE_URL}/api/orders/ai/transcribe`, formData, {
                headers: {
                    ...formData.getHeaders(),
                    'Content-Type': 'multipart/form-data'
                },
                maxBodyLength: Infinity
            });

            if (!response.data.success) {
                throw new Error(response.data.message || "Lỗi xử lý âm thanh từ Python");
            }
            
            return response.data.text; 
        } catch (error) {
             console.error('❌ [AIService] Lỗi Audio:', error.message);
             throw new Error("Không thể dịch giọng nói. Vui lòng thử lại.");
        }
    }
}

export default AIService;