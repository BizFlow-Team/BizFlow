import database from '../database/db.js';

/**
 * Kiểm tra giới hạn gói dịch vụ
 * @param {string} ownerId - ID của chủ cửa hàng
 * @param {string} resourceType - Loại tài nguyên ('product' | 'employee')
 * @returns {Promise<boolean>} - Trả về True nếu CÒN lượt, False nếu HẾT lượt (bị chặn)
 */
export const checkPlanLimit = async (ownerId, resourceType) => {
    try {
        // 1. Lấy thông tin Gói của Owner
        const planQuery = `
            SELECT p.features 
            FROM users u
            JOIN subscription_plan p ON u.plan_id = p.id
            WHERE u.id = $1
        `;
        const planResult = await database.query(planQuery, [ownerId]);
        
        // Nếu không tìm thấy gói, chặn luôn cho an toàn
        if (planResult.rows.length === 0) return false;

        const rawFeatures = planResult.rows[0].features; 
        // Lấy limits từ cấu trúc mới HOẶC dùng trực tiếp nếu là cấu trúc cũ
        const limits = rawFeatures.limits || rawFeatures;
        
        let limit = 0;
        let currentCount = 0;

        // 2. Kiểm tra giới hạn SẢN PHẨM
        if (resourceType === 'product') {
            limit = limits.max_products || 0; // Gán trực tiếp vào biến limit bên ngoài
            
            // Đếm số sản phẩm hiện tại của Owner
            const countRes = await database.query(
                'SELECT COUNT(*) FROM product WHERE owner_id = $1', 
                [ownerId]
            );
            currentCount = parseInt(countRes.rows[0].count);
        }

        // 3. Kiểm tra giới hạn NHÂN VIÊN
        else if (resourceType === 'employee') {
            limit = limits.max_employees || 0; // Sửa: Dùng biến 'limits' đã khai báo

            // Đếm số nhân viên (User có owner_id trỏ về user này)
            const countRes = await database.query(
                'SELECT COUNT(*) FROM users WHERE owner_id = $1', 
                [ownerId]
            );
            currentCount = parseInt(countRes.rows[0].count);
        }

        else if (resourceType === 'ai_chat') {
            // Nếu ai_enabled = true thì cho phép, ngược lại chặn
            return limits.ai_enabled === true;
        }

        // 4. So sánh
        // Nếu limit < 0 (ví dụ -1) nghĩa là không giới hạn (Unlimited)
        if (limit < 0) return true;

        console.log(`Check Limit [${resourceType}]: Current ${currentCount} / Limit ${limit}`);
        
        return currentCount < limit;

    } catch (error) {
        console.error("Check Plan Limit Error:", error);
        return false;// Có lỗi thì chặn cho an toàn
    }
};