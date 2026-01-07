import database from '../database/db.js';
import bcrypt from 'bcryptjs';

// 1. Lấy danh sách tất cả các Owner để quản lý
export const getAllOwners = async (req, res) => {
    const { status } = req.query;
    try {
        // Query sử dụng LEFT JOIN với subquery để lấy lý do mới nhất
        let query = `
            SELECT 
                u.id, u.full_name, u.phone_number, u.status, u.created_at, u.shop_name, u.plan_id,
                ua.reason as rejection_reason
            FROM users u
            LEFT JOIN (
                SELECT DISTINCT ON (user_id) user_id, reason, created_at
                FROM user_approvals
                WHERE action = 'REJECTED'
                ORDER BY user_id, created_at DESC
            ) ua ON u.id = ua.user_id
            JOIN role r ON u.role_id = r.id
            WHERE r.role_name = 'OWNER'
        `;
        const values = [];

        // Nếu có truyền status, thêm điều kiện lọc vào câu query
        if (status && status !== 'ALL') {
            query += ` AND u.status = $1`;
            values.push(status);
        }

        query += ` ORDER BY u.created_at DESC`;
        
        const result = await database.query(query, values);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Get All Owners Error:", error);
        res.status(500).json({ message: "Lỗi khi lấy danh sách Owner" });
    }
};

// 2. Duyệt, Kích hoạt hoặc Khóa tài khoản Owner
export const toggleOwnerStatus = async (req, res) => {
    const { ownerId, status, reason } = req.body;  
    const adminId = req.user.id;

    const client = await database.connect();
    
    try {
        await client.query('BEGIN');
        const updateUserQuery = `
            UPDATE users SET status = $1, updated_at = NOW() 
            WHERE id = $2 RETURNING id, full_name, status
        `;
        const userResult = await client.query(updateUserQuery, [status, ownerId]);

        if (userResult.rowCount === 0) {
            return res.status(404).json({ message: "Không tìm thấy tài khoản" });
        }

        const insertLogQuery = `
            INSERT INTO user_approvals (user_id, admin_id, action, reason)
            VALUES ($1, $2, $3, $4)
        `;
        // Ghi lại lý do nếu có (đặc biệt quan trọng cho REJECTED)
        await client.query(insertLogQuery, [ownerId, adminId, status, reason || null]);

        await client.query('COMMIT');

        res.status(200).json({ 
            message: "Cập nhật trạng thái thành công", 
            data: userResult.rows[0] 
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Update Status Error:", error);
        res.status(500).json({ message: "Lỗi khi cập nhật trạng thái" });
    } finally {
        client.release();
    }
};

// 3. Quản lý Gói dịch vụ (Thêm gói mới)
export const createPlan = async (req, res) => {
    const { plan_name, price, duration_days, features } = req.body;
    try {
        const query = `
            INSERT INTO subscription_plan (plan_name, price, duration_days, features)
            VALUES ($1, $2, $3, $4) RETURNING *
        `;
        const result = await database.query(query, [plan_name, price, duration_days, JSON.stringify(features)]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi tạo gói dịch vụ" });
    }
};

// 4. Admin tạo tài khoản Owner mới
export const createOwner = async (req, res) => {
    const { full_name, phone_number, password, shop_name } = req.body;

    try {
        // 1. Validate cơ bản
        if (!full_name || !phone_number || !password) {
            return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
        }

        // 2. Validate độ dài mật khẩu
        if (password.length < 6) {
            return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
        }

        // 3. Validate định dạng số điện thoại (10 chữ số)
        const regex = /^\d{10}$/;
        if (!regex.test(phone_number)) {
            return res.status(400).json({ message: 'Số điện thoại không hợp lệ (phải có 10 chữ số)' });
        }

        // 4. Kiểm tra số điện thoại đã tồn tại chưa
        const checkUser = await database.query(
            'SELECT id FROM users WHERE phone_number = $1',
            [phone_number]
        );
        if (checkUser.rows.length > 0) {
            return res.status(400).json({ message: "Số điện thoại này đã được đăng ký" });
        }

        // 5. Lấy role_id của 'OWNER'
        const roleResult = await database.query("SELECT id FROM role WHERE role_name = 'OWNER'");
        if (roleResult.rows.length === 0) {
            return res.status(500).json({ message: "Lỗi hệ thống: Không tìm thấy role OWNER" });
        }
        const ownerRoleId = roleResult.rows[0].id;

        // 6. Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // 7. Tạo user mới
        const query = `
            INSERT INTO users (full_name, phone_number, password, role_id, status, shop_name)
            VALUES ($1, $2, $3, $4, 'ACTIVE', $5)
            RETURNING id, full_name, phone_number, shop_name, created_at
        `;
        const newUser = await database.query(query, [full_name, phone_number, hashedPassword, ownerRoleId, shop_name]);

        res.status(201).json({
            message: "Tạo tài khoản Owner thành công",
            data: newUser.rows[0]
        });

    } catch (error) {
        console.error("Create Owner Error:", error);
        res.status(500).json({ message: "Lỗi server khi tạo Owner" });
    }
};

// 5. Cập nhật thông tin Owner (Sửa tên, SĐT, Reset Pass)
export const updateOwner = async (req, res) => {
    const { id } = req.params;
    const { full_name, phone_number, password } = req.body;

    try {
        // 1. Kiểm tra ID
        if (!id) return res.status(400).json({ message: "Thiếu ID người dùng" });

        // 2. Validate SĐT (nếu có thay đổi)
        if (phone_number) {
            const checkPhone = await database.query(
                'SELECT id FROM users WHERE phone_number = $1 AND id != $2',
                [phone_number, id]
            );
            if (checkPhone.rows.length > 0) {
                return res.status(400).json({ message: "Số điện thoại đã được sử dụng bởi tài khoản khác" });
            }
        }

        // 3. Xây dựng câu truy vấn động (chỉ update trường nào có gửi lên)
        let updateFields = [];
        let values = [];
        let index = 1;

        if (full_name) {
            updateFields.push(`full_name = $${index++}`);
            values.push(full_name);
        }
        if (phone_number) {
            updateFields.push(`phone_number = $${index++}`);
            values.push(phone_number);
        }
        if (password && password.trim() !== "") {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateFields.push(`password = $${index++}`);
            values.push(hashedPassword);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: "Không có dữ liệu nào để cập nhật" });
        }

        // Thêm ID vào cuối mảng values cho WHERE clause
        values.push(id);
        
        const query = `
            UPDATE users 
            SET ${updateFields.join(', ')}, updated_at = NOW() 
            WHERE id = $${index}
            RETURNING id, full_name, phone_number
        `;

        const result = await database.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        res.status(200).json({ 
            message: "Cập nhật thành công", 
            data: result.rows[0] 
        });

    } catch (error) {
        console.error("Update Owner Error:", error);
        res.status(500).json({ message: "Lỗi server khi cập nhật Owner" });
    }
};

export const deleteOwner = async (req, res) => {
    const { id } = req.params;

    try {
        // Kiểm tra xem user có tồn tại và đúng là OWNER không (tránh xóa nhầm ADMIN)
        const checkQuery = `
            SELECT u.id, r.role_name 
            FROM users u
            JOIN role r ON u.role_id = r.id
            WHERE u.id = $1
        `;
        const checkResult = await database.query(checkQuery, [id]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }

        if (checkResult.rows[0].role_name === 'ADMIN') {
            return res.status(403).json({ message: "Không thể xóa tài khoản Admin tại đây" });
        }

        // Thực hiện xóa
        const deleteQuery = 'DELETE FROM users WHERE id = $1 RETURNING id';
        await database.query(deleteQuery, [id]);

        res.status(200).json({ message: "Đã xóa tài khoản chủ cửa hàng thành công" });

    } catch (error) {
        console.error("Delete Owner Error:", error);
        res.status(500).json({ message: "Lỗi server khi xóa tài khoản" });
    }
};

export const getSubscriptionPlans = async (req, res) => {
    try {
        const query = `
            SELECT id, plan_name, price, duration_days, features, created_at
            FROM subscription_plan
            ORDER BY price ASC
        `;
        const result = await database.query(query);
        
        // Convert features từ chuỗi JSON (nếu DB lưu text) hoặc giữ nguyên nếu là JSONB
        // Lưu ý: pg tự động parse JSONB thành object
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Get Plans Error:", error);
        res.status(500).json({ message: "Lỗi khi lấy danh sách gói dịch vụ" });
    }
};

// [MỚI] 7. Lấy thống kê Dashboard
export const getSystemStats = async (req, res) => {
    try {
        const ownerCountQuery = `
            SELECT COUNT(*) as total FROM users u
            JOIN role r ON u.role_id = r.id
            WHERE r.role_name = 'OWNER'
        `;
        
        // Chỉ đếm những Owner có status là ACTIVE
        const activeOwnerQuery = `
            SELECT COUNT(*) as total FROM users u
            JOIN role r ON u.role_id = r.id
            WHERE r.role_name = 'OWNER' AND u.status = 'ACTIVE'
        `;

        const planCountQuery = `SELECT COUNT(*) as total FROM subscription_plan`;

        const [ownerRes, activeRes, planRes] = await Promise.all([
            database.query(ownerCountQuery),
            database.query(activeOwnerQuery),
            database.query(planCountQuery)
        ]);

        res.status(200).json({
            totalOwners: parseInt(ownerRes.rows[0].total),
            activeOwners: parseInt(activeRes.rows[0].total),
            totalPlans: parseInt(planRes.rows[0].total),
            totalRevenue: 0 
        });
    } catch (error) {
        console.error("Stats Error:", error);
        res.status(500).json({ message: "Lỗi khi lấy thống kê hệ thống" });
    }
};

export const updatePlan = async (req, res) => {
    const { id } = req.params;
    const { plan_name, price, duration_days, features } = req.body;

    try {
        const query = `
            UPDATE subscription_plan
            SET plan_name = $1, price = $2, duration_days = $3, features = $4
            WHERE id = $5
            RETURNING *
        `;
        const result = await database.query(query, [plan_name, price, duration_days, JSON.stringify(features), id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Không tìm thấy gói dịch vụ" });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Update Plan Error:", error);
        res.status(500).json({ message: "Lỗi khi cập nhật gói dịch vụ" });
    }
};

export const getGrowthStats = async (req, res) => {
    const { range } = req.query; // '7d', '1m', '1y'
    
    let timeFilter = "NOW() - INTERVAL '7 days'";
    let dateFormat = "DD/MM"; // Ngày/Tháng
    let truncType = 'day';    // Gom nhóm theo ngày

    // Cấu hình Query dựa trên range
    if (range === '1m') {
        timeFilter = "NOW() - INTERVAL '30 days'";
        dateFormat = "DD/MM";
        truncType = 'day';
    } else if (range === '1y') {
        timeFilter = "NOW() - INTERVAL '1 year'";
        dateFormat = "MM/YYYY"; // Tháng/Năm
        truncType = 'month';    // Gom nhóm theo tháng
    }

    try {
        const query = `
            SELECT TO_CHAR(created_at, '${dateFormat}') as date, COUNT(*) as count
            FROM users
            WHERE created_at >= ${timeFilter}
            GROUP BY TO_CHAR(created_at, '${dateFormat}'), DATE_TRUNC('${truncType}', created_at)
            ORDER BY DATE_TRUNC('${truncType}', created_at) ASC
        `;
        const result = await database.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Chart Growth Error:", error);
        res.status(500).json([]);
    }
};

export const deletePlan = async (req, res) => {
    const { id } = req.params;
    try {
        // Kiểm tra xem có user nào đang dùng gói này không (nếu cần kỹ hơn)
        // Ở đây xóa thẳng, nếu có ràng buộc khóa ngoại DB sẽ báo lỗi
        const query = 'DELETE FROM subscription_plan WHERE id = $1 RETURNING *';
        const result = await database.query(query, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Không tìm thấy gói dịch vụ" });
        }

        res.status(200).json({ message: "Đã xóa gói dịch vụ thành công" });
    } catch (error) {
        console.error("Delete Plan Error:", error);
        // Lỗi thường gặp: Gói đang được sử dụng bởi user (Foreign Key Constraint)
        if (error.code === '23503') {
             return res.status(400).json({ message: "Không thể xóa gói đang có người sử dụng" });
        }
        res.status(500).json({ message: "Lỗi server khi xóa gói" });
    }
};

// [MỚI] 11. Lấy thống kê Doanh thu (GMV - Tổng giao dịch toàn hệ thống)
export const getRevenueStats = async (req, res) => {
    const { range } = req.query; // '7d', '1m', '1y'
    
    let timeFilter = "NOW() - INTERVAL '7 days'";
    let dateFormat = "DD/MM"; // Ngày/Tháng (cho 7 ngày, 1 tháng)
    
    // Điều chỉnh query dựa trên range
    if (range === '1m') {
        timeFilter = "NOW() - INTERVAL '30 days'";
        dateFormat = "DD/MM";
    } else if (range === '1y') {
        timeFilter = "NOW() - INTERVAL '1 year'";
        dateFormat = "MM/YYYY"; // Tháng/Năm
    }

    try {
        // Tính tổng total_price từ bảng sales_order
        // GROUP BY theo ngày hoặc tháng
        const query = `
            SELECT TO_CHAR(created_at, '${dateFormat}') as date, SUM(total_price) as revenue
            FROM sales_order
            WHERE created_at >= ${timeFilter} AND status = 'COMPLETED' -- Chỉ tính đơn hoàn thành
            GROUP BY TO_CHAR(created_at, '${dateFormat}'), DATE_TRUNC('${range === '1y' ? 'month' : 'day'}', created_at)
            ORDER BY DATE_TRUNC('${range === '1y' ? 'month' : 'day'}', created_at) ASC
        `;

        const result = await database.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Revenue Stats Error:", error);
        res.status(500).json([]);
    }
};

export const getPaymentMethodStats = async (req, res) => {
    try {
        const query = `
            SELECT payment_method, COUNT(*) as count, SUM(total_price) as value
            FROM sales_order
            WHERE status = 'COMPLETED'
            GROUP BY payment_method
        `;
        const result = await database.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Payment Stats Error:", error);
        res.status(500).json([]);
    }
};

export const getTopOwners = async (req, res) => {
    try {
        const query = `
            SELECT u.full_name, u.phone_number, 
                   COUNT(s.id) as total_orders, 
                   SUM(s.total_price) as total_revenue
            FROM sales_order s
            JOIN users u ON s.owner_id = u.id
            WHERE s.status = 'COMPLETED'
            GROUP BY u.id, u.full_name, u.phone_number
            ORDER BY total_revenue DESC
            LIMIT 5
        `;
        const result = await database.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Top Owners Error:", error);
        res.status(500).json([]);
    }
};

export const getSystemConfig = async (req, res) => {
    try {
        // Luôn lấy dòng có id = 1
        const result = await database.query('SELECT * FROM system_config WHERE id = 1');
        
        if (result.rows.length > 0) {
            res.status(200).json(result.rows[0]);
        } else {
            // Fallback nếu chưa có (dù đã init ở model)
            res.status(200).json({ 
                maintenance_mode: false, 
                support_email: '', 
                tax_vat_default: 8 
            });
        }
    } catch (error) {
        console.error("Get Config Error:", error);
        res.status(500).json({ message: "Lỗi lấy cấu hình" });
    }
};

export const updateSystemConfig = async (req, res) => {
    const { 
        maintenance_mode, 
        support_email, 
        ai_model_version, 
        tax_vat_default,
        max_upload_size_mb 
    } = req.body;

    try {
        const query = `
            UPDATE system_config
            SET maintenance_mode = $1,
                support_email = $2,
                ai_model_version = $3,
                tax_vat_default = $4,
                max_upload_size_mb = $5,
                updated_at = NOW()
            WHERE id = 1
            RETURNING *
        `;
        
        const values = [
            maintenance_mode, 
            support_email, 
            ai_model_version, 
            tax_vat_default,
            max_upload_size_mb
        ];

        const result = await database.query(query, values);
        
        res.status(200).json({ 
            message: "Đã lưu cấu hình hệ thống", 
            data: result.rows[0] 
        });

    } catch (error) {
        console.error("Update Config Error:", error);
        res.status(500).json({ message: "Lỗi khi lưu cấu hình" });
    }
};

export const changeOwnerPlan = async (req, res) => {
    const { ownerId, planId } = req.body;

    console.log("Change Plan Request:", req.body); // <--- Thêm dòng này để debug

    try {
        // Kiểm tra kỹ hơn: chỉ báo lỗi nếu planId là null hoặc undefined (cho phép số 0 nếu DB bạn dùng ID 0, nhưng thường là từ 1)
        if (!ownerId || planId === undefined || planId === null) {
            return res.status(400).json({ 
                message: "Thiếu thông tin Owner hoặc Plan",
                received: req.body 
            });
        }
        
        // Chặn nếu planId = 0 hoặc rỗng (nếu gói dịch vụ bắt đầu từ ID 1)
        if (Number(planId) <= 0) {
             return res.status(400).json({ message: "Vui lòng chọn một gói dịch vụ hợp lệ" });
        }
        // 2. Cập nhật gói trong DB
        // Lưu ý: Cần ép kiểu planId về số nguyên nếu DB để cột id là Serial/Int
        const query = `
            UPDATE users 
            SET plan_id = $1, updated_at = NOW()
            WHERE id = $2
            RETURNING id, full_name, plan_id
        `;
        
        const result = await database.query(query, [parseInt(planId), ownerId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Không tìm thấy User này" });
        }

        res.status(200).json({ 
            message: "Cập nhật gói thành công", 
            data: result.rows[0] 
        });

    } catch (error) {
        console.error("Change Plan Error:", error);
        res.status(500).json({ message: "Lỗi server khi đổi gói" });
    }
};