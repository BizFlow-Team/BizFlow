import AIService from '../services/AIService.js';
import db from '../database/db.js'; // Sử dụng kết nối PG của bạn
import fs from 'fs';

const parseImages = (imgStr) => {
    if (!imgStr) return null;
    try {
        const parsed = JSON.parse(imgStr);
        return Array.isArray(parsed) ? parsed[0] : parsed;
    } catch { return imgStr; }
};

export const createDraftOrderFromAI = async (req, res) => {
    try {
        const { message } = req.body;
        const owner_id = req.user.userId; // Lấy từ Token

        if (!message) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập nội dung" });
        }

        console.log(`🤖 [AI Controller] User ${owner_id} yêu cầu: "${message}"`);

        // 1. Gọi Python để phân tích (Kèm owner_id cho RAG)
        const aiResult = await AIService.parseOrderFromText(message, owner_id);
        
        console.log("📦 [AI Controller] Python trả về:", JSON.stringify(aiResult.items));

        // 2. Map dữ liệu với Database PostgreSQL
        const mappedItems = [];
        let estimatedTotal = 0;

        if (aiResult.items && aiResult.items.length > 0) {
            for (const item of aiResult.items) {
                // RAG đã tìm tên chuẩn, nên ta ưu tiên tìm chính xác trước
                // Nếu không thấy thì tìm ILIKE
                const productQuery = `
                    SELECT id, name, price, stock, unit, code, images
                    FROM product 
                    WHERE owner_id = $1 
                    AND (name ILIKE $2 OR code ILIKE $2)
                    LIMIT 1
                `;
                
                // item.product_name từ Python giờ đã khá chuẩn xác nhờ RAG
                const productRes = await db.query(productQuery, [owner_id, item.product_name]);

                if (productRes.rows.length > 0) {
                    const product = productRes.rows[0];
                    const lineTotal = parseFloat(product.price) * item.quantity;
                    estimatedTotal += lineTotal;

                    mappedItems.push({
                        found: true,
                        product_id: product.id,
                        product_name: product.name,      // Tên trong DB
                        ai_product_name: item.product_name,
                        quantity: item.quantity,
                        unit: product.unit || item.unit, 
                        price: parseFloat(product.price),
                        total: lineTotal,
                        stock_available: product.stock,
                        image: parseImages(product.images)
                    });
                } else {
                    // Trường hợp RAG tìm ra tên nhưng DB lại không khớp (hiếm, nhưng có thể do sync chậm)
                    mappedItems.push({
                        found: false,
                        product_name: item.product_name, // Tên AI đoán
                        quantity: item.quantity,
                        unit: item.unit,
                        price: 0,
                        total: 0,
                        note: "Không tìm thấy trong kho (Check lại tên)"
                    });
                }
            }
        }

        // 3. Tìm khách hàng (Nếu AI trích xuất được tên)
        let customerInfo = null;
        if (aiResult.customer_name) {
            const custRes = await db.query(
                `SELECT id, name, phone_number, address FROM customer WHERE name ILIKE $1 AND owner_id = $2 LIMIT 1`,
                [`%${aiResult.customer_name}%`, owner_id]
            );
            if (custRes.rows.length > 0) customerInfo = custRes.rows[0];
            else customerInfo = { name: aiResult.customer_name, found: false, id: null };
        }

        // 4. Trả kết quả (Draft Order)
        return res.status(200).json({
            success: true,
            data: {
                original_message: aiResult.original_message,
                is_debt: aiResult.is_debt,
                customer: customerInfo,
                items: mappedItems,
                estimated_total: estimatedTotal
            }
        });

    } catch (error) {
        console.error("🔥 AI Controller Error:", error);
        return res.status(500).json({ success: false, message: "Lỗi xử lý: " + error.message });
    }
};

export const transcribeAudio = async (req, res) => {
    let tempFilePath = null; // Biến lưu đường dẫn để xóa sau này

    try {
        console.log("🎤 [Controller] Bắt đầu xử lý transcribe...");

        if (!req.files || !req.files.audio) {
            return res.status(400).json({ success: false, message: "Không có file ghi âm" });
        }
        
        const audioFile = req.files.audio;
        tempFilePath = audioFile.tempFilePath; // Lưu lại đường dẫn tạm

        console.log(`📂 [Controller] File tạm tại: ${tempFilePath}`);

        // Gọi Service (Code cũ)
        const text = await AIService.transcribeAudio(tempFilePath);
        
        console.log("✅ [Controller] Kết quả:", text);
        return res.status(200).json({ success: true, text: text });

    } catch (error) {
        console.error("🔥 [Controller] Lỗi:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Lỗi Server: " + (error.message || "Không xác định") 
        });
    } finally {
        // --- ĐOẠN CODE MỚI: DỌN DẸP FILE RÁC ---
        if (tempFilePath) {
            fs.unlink(tempFilePath, (err) => {
                if (err) console.error("⚠️ Không thể xóa file tạm:", err);
                else console.log("🗑️ Đã xóa file tạm:", tempFilePath);
            });
        }
    }
};
