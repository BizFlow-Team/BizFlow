import 'package:flutter/material.dart';
import 'login_screen.dart';
import 'report_screen.dart';    // Màn hình Báo cáo
import 'inventory_screen.dart'; // Màn hình Kho hàng
import 'customers_screen.dart'; // Màn hình Khách hàng & Sổ nợ

class DashboardScreen extends StatelessWidget {
  final String userName;

  const DashboardScreen({Key? key, required this.userName}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: const Text("BizFlow Dashboard"),
        backgroundColor: const Color(0xFF1E293B),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              // Lệnh quay về màn hình Đăng nhập
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (context) => LoginScreen()),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Phần Header chào hỏi
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              color: Color(0xFF1E293B),
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(30),
                bottomRight: Radius.circular(30),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  "Xin chào,",
                  style: TextStyle(color: Colors.white70, fontSize: 16),
                ),
                Text(
                  userName,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 10),
                const Text(
                  "Hôm nay bạn muốn quản lý gì?",
                  style: TextStyle(color: Colors.white, fontSize: 14),
                ),
              ],
            ),
          ),

          // Phần Menu chính dạng Grid
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: GridView.count(
                crossAxisCount: 2, // 2 cột
                crossAxisSpacing: 15,
                mainAxisSpacing: 15,
                children: [
                  // --- NÚT ĐƠN HÀNG (Chưa làm) ---
                  _buildMenuCard(context, "Đơn hàng", Icons.shopping_cart, Colors.orange, () {
                    _showFeatureMessage(context, "Tính năng Đơn hàng đang phát triển");
                  }),

                  // --- NÚT SẢN PHẨM / KHO HÀNG (Đã kết nối) ---
                  _buildMenuCard(context, "Sản phẩm", Icons.inventory_2, Colors.green, () {
                     Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const InventoryScreen()),
                    );
                  }),

                  // --- NÚT CÔNG NỢ (Đã kết nối) ---
                  _buildMenuCard(context, "Công nợ", Icons.account_balance_wallet, Colors.red, () {
                      Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const CustomersScreen()),
                    );
                  }),

                  // --- NÚT KHÁCH HÀNG (Đã kết nối) ---
                  _buildMenuCard(context, "Khách hàng", Icons.people, Colors.purple, () {
                      Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const CustomersScreen()),
                    );
                  }),
                  
                  // --- NÚT BÁO CÁO (Đã kết nối) ---
                  _buildMenuCard(context, "Báo cáo", Icons.bar_chart, Colors.blue, () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const ReportScreen()),
                    );
                  }),
                  
                  // --- NÚT AI (Chưa làm) ---
                  _buildMenuCard(context, "AI Assistant", Icons.psychology, Colors.indigo, () {
                     _showFeatureMessage(context, "Trợ lý AI đang sẵn sàng...");
                  }),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Hàm hiển thị thông báo tạm thời
  void _showFeatureMessage(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), duration: const Duration(seconds: 1)),
    );
  }

  // Hàm hỗ trợ tạo các ô Menu
  Widget _buildMenuCard(BuildContext context, String title, IconData icon, Color color, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.2),
              spreadRadius: 2,
              blurRadius: 5,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 32, color: color),
            ),
            const SizedBox(height: 12),
            Text(
              title,
              style: const TextStyle(
                fontSize: 16, 
                fontWeight: FontWeight.bold,
                color: Color(0xFF1E293B)
              ),
            ),
          ],
        ),
      ),
    );
  }
}