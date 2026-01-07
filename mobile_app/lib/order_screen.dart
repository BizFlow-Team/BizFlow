import 'package:flutter/material.dart';

// Model Đơn hàng
class Order {
  final String id;
  final String customerName;
  final String totalAmount;
  final String status; // 'completed', 'pending', 'cancelled'
  final String date;
  final int itemCount;

  Order({
    required this.id,
    required this.customerName,
    required this.totalAmount,
    required this.status,
    required this.date,
    required this.itemCount,
  });
}

class OrderScreen extends StatefulWidget {
  const OrderScreen({Key? key}) : super(key: key);

  @override
  State<OrderScreen> createState() => _OrderScreenState();
}

class _OrderScreenState extends State<OrderScreen> {
  int _selectedIndex = 1; // Tab Bán hàng/Đơn hàng

  // Dữ liệu giả lập
  final List<Order> orders = [
    Order(id: 'DH001', customerName: 'Anh Ba (Thầu Xây Dựng)', totalAmount: '2.500.000 ₫', status: 'completed', date: '2025-12-20', itemCount: 5),
    Order(id: 'DH002', customerName: 'Chị Tư (Tạp hóa)', totalAmount: '850.000 ₫', status: 'pending', date: '2025-12-21', itemCount: 2),
    Order(id: 'DH003', customerName: 'Khách lẻ - Anh Nam', totalAmount: '120.000 ₫', status: 'completed', date: '2025-12-21', itemCount: 1),
    Order(id: 'DH004', customerName: 'Chú Bảy (Sửa nhà)', totalAmount: '5.200.000 ₫', status: 'cancelled', date: '2025-12-19', itemCount: 10),
    Order(id: 'DH005', customerName: 'Cô Sáu', totalAmount: '300.000 ₫', status: 'pending', date: '2025-12-22', itemCount: 3),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('Danh sách Đơn hàng', style: TextStyle(color: Colors.white)),
        elevation: 0,
        actions: [
          IconButton(icon: const Icon(Icons.filter_list, color: Colors.white), onPressed: () {}),
          IconButton(icon: const Icon(Icons.add, color: Colors.white), onPressed: () {}),
        ],
      ),
      backgroundColor: const Color(0xFFF5F5F5),
      body: Column(
        children: [
          // Thanh tìm kiếm
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.white,
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Tìm theo tên khách, mã đơn...',
                prefixIcon: const Icon(Icons.search, color: Colors.grey),
                filled: true,
                fillColor: const Color(0xFFF9FAFB),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
                contentPadding: const EdgeInsets.symmetric(vertical: 0),
              ),
            ),
          ),
          
          // Danh sách đơn hàng
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: orders.length,
              separatorBuilder: (context, index) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final order = orders[index];
                return _buildOrderItem(order);
              },
            ),
          ),
        ],
      ),
      // Nếu bạn muốn có thanh điều hướng bên dưới, giữ nguyên đoạn này
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) {
          setState(() => _selectedIndex = index);
          if (index == 0) Navigator.pop(context); // Về Dashboard
        },
        type: BottomNavigationBarType.fixed,
        selectedItemColor: const Color(0xFF2563EB),
        unselectedItemColor: Colors.grey,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard), label: 'Tổng quan'),
          BottomNavigationBarItem(icon: Icon(Icons.shopping_cart), label: 'Bán hàng'),
          BottomNavigationBarItem(icon: Icon(Icons.inventory), label: 'Kho hàng'),
          BottomNavigationBarItem(icon: Icon(Icons.people), label: 'Sổ nợ'),
        ],
      ),
    );
  }

  Widget _buildOrderItem(Order order) {
    Color statusColor;
    String statusText;

    switch (order.status) {
      case 'completed':
        statusColor = Colors.green;
        statusText = 'Hoàn thành';
        break;
      case 'pending':
        statusColor = Colors.orange;
        statusText = 'Chờ xử lý';
        break;
      case 'cancelled':
        statusColor = Colors.red;
        statusText = 'Đã hủy';
        break;
      default:
        statusColor = Colors.grey;
        statusText = 'Khác';
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 5, offset: const Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(order.id, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.grey)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(color: statusColor.withOpacity(0.1), borderRadius: BorderRadius.circular(4)),
                child: Text(statusText, style: TextStyle(color: statusColor, fontSize: 12, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(order.customerName, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
          const SizedBox(height: 4),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('${order.itemCount} sản phẩm • ${order.date}', style: const TextStyle(fontSize: 13, color: Colors.grey)),
              Text(order.totalAmount, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF2563EB))),
            ],
          ),
        ],
      ),
    );
  }
}