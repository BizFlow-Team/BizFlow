// File: lib/screens/customers_screen.dart
import 'package:flutter/material.dart';

// Model dữ liệu Khách hàng
class Customer {
  final String id;
  final String name;
  final String nickname;
  final String address;
  final String phone;
  final String debt;
  final Color debtColor;
  final String lastPurchase;

  Customer({
    required this.id,
    required this.name,
    required this.nickname,
    required this.address,
    required this.phone,
    required this.debt,
    required this.debtColor,
    required this.lastPurchase,
  });
}

class CustomersScreen extends StatefulWidget {
  const CustomersScreen({Key? key}) : super(key: key);

  @override
  State<CustomersScreen> createState() => _CustomersScreenState();
}

class _CustomersScreenState extends State<CustomersScreen> {
  int _selectedIndex = 3; // Mặc định chọn tab Sổ nợ/Khách hàng

  final List<Customer> customers = [
    Customer(id: 'KH1', name: 'Anh Ba (Thầu Xây Dựng)', nickname: 'Anh Ba', address: 'KDC Vĩnh Lộc', phone: '0909123456', debt: '15.500.000 ₫', debtColor: const Color(0xFFEF4444), lastPurchase: '2023-10-25'),
    Customer(id: 'KH2', name: 'Chị Tư (Tạp hóa)', nickname: 'Chị Tư', address: 'Chợ Bà Chiểu', phone: '0988777666', debt: '0 ₫', debtColor: const Color(0xFF10B981), lastPurchase: '2023-10-26'),
    Customer(id: 'KH3', name: 'Chú Bảy (Sửa nhà)', nickname: 'Chú Bảy', address: '123 Lê Lợi', phone: '0912333444', debt: '2.500.000 ₫', debtColor: const Color(0xFFEF4444), lastPurchase: '2023-10-20'),
    Customer(id: 'KH4', name: 'Cô Sáu (Vàng lai)', nickname: 'Cô Sáu', address: 'Quận 3', phone: '0901222333', debt: '500.000 ₫', debtColor: const Color(0xFFEF4444), lastPurchase: '2023-10-27'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        elevation: 0,
        // Đã bỏ nút Menu để hiện nút Back mặc định
        title: const Text(
          'Sổ nợ & Khách hàng',
          style: TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.search, color: Colors.white),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.person_add_alt_1, color: Colors.white),
            tooltip: 'Thêm khách mới',
            onPressed: () {},
          ),
        ],
      ),
      // Bỏ Drawer vì đây là màn hình con
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Padding(
              padding: EdgeInsets.all(16.0),
              child: Text(
                'Tổng quan công nợ',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1E293B),
                ),
              ),
            ),
            _buildStatCards(),
            const SizedBox(height: 16),
            _buildCustomersList(),
            const SizedBox(height: 20),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) {
          setState(() => _selectedIndex = index);
          // Nếu ấn vào tab Tổng quan (index 0) thì quay về Dashboard
          if (index == 0) Navigator.pop(context);
        },
        type: BottomNavigationBarType.fixed,
        selectedItemColor: const Color(0xFF2563EB),
        unselectedItemColor: Colors.grey,
        selectedFontSize: 11,
        unselectedFontSize: 11,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard), label: 'Tổng quan'),
          BottomNavigationBarItem(icon: Icon(Icons.shopping_cart), label: 'Bán hàng'),
          BottomNavigationBarItem(icon: Icon(Icons.inventory), label: 'Kho hàng'),
          BottomNavigationBarItem(icon: Icon(Icons.people), label: 'Sổ nợ'),
        ],
      ),
    );
  }

  // --- Các Widget con giữ nguyên logic của bạn ---

  Widget _buildStatCards() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Row(
        children: [
          Expanded(child: _buildStatCard('Tổng nợ phải thu', '18.000.000 ₫', const Color(0xFFEF4444), Icons.account_balance_wallet)),
          const SizedBox(width: 12),
          Expanded(child: _buildStatCard('Nợ đến hạn (Tháng)', '5.000.000 ₫', const Color(0xFFF59E0B), Icons.calendar_today)),
          const SizedBox(width: 12),
          Expanded(child: _buildStatCard('Khách hàng mới', '12', const Color(0xFF2563EB), Icons.person_add)),
        ],
      ),
    );
  }

  Widget _buildStatCard(String title, String value, Color color, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(12), // Giảm padding một chút cho vừa màn hình nhỏ
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(child: Text(title, style: const TextStyle(fontSize: 11, color: Colors.grey), maxLines: 2, overflow: TextOverflow.ellipsis)),
              Icon(icon, color: color, size: 18),
            ],
          ),
          const SizedBox(height: 8),
          Text(value, style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: color)),
        ],
      ),
    );
  }

  Widget _buildCustomersList() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 2))],
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Danh sách khách hàng', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
                ElevatedButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.add, size: 18),
                  label: const Text('Thêm khách'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2563EB),
                    foregroundColor: Colors.white,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    textStyle: const TextStyle(fontSize: 13),
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: const BoxDecoration(
              color: Color(0xFFF9FAFB),
              border: Border(top: BorderSide(color: Color(0xFFE5E7EB)), bottom: BorderSide(color: Color(0xFFE5E7EB))),
            ),
            child: const Row(
              children: [
                Expanded(flex: 2, child: Text('KHÁCH HÀNG', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF6B7280)))),
                Expanded(flex: 2, child: Text('ĐỊA CHỈ/SĐT', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF6B7280)))),
                Expanded(flex: 2, child: Text('TỔNG NỢ', textAlign: TextAlign.right, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF6B7280)))),
              ],
            ),
          ),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: customers.length,
            separatorBuilder: (context, index) => const Divider(height: 1),
            itemBuilder: (context, index) => _buildCustomerRow(customers[index]),
          ),
        ],
      ),
    );
  }

  Widget _buildCustomerRow(Customer customer) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      child: Row(
        children: [
          Expanded(
            flex: 2,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(customer.name, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: Color(0xFF1E293B))),
                const SizedBox(height: 4),
                Text('Mã: ${customer.id}', style: const TextStyle(fontSize: 12, color: Color(0xFF9CA3AF))),
              ],
            ),
          ),
          Expanded(
            flex: 2,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(customer.address, style: const TextStyle(fontSize: 13, color: Color(0xFF6B7280))),
                const SizedBox(height: 4),
                Text(customer.phone, style: const TextStyle(fontSize: 12, color: Color(0xFF9CA3AF))),
              ],
            ),
          ),
          Expanded(
            flex: 2,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(customer.debt, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: customer.debtColor), textAlign: TextAlign.right),
                const SizedBox(height: 4),
                Text(customer.lastPurchase, style: const TextStyle(fontSize: 11, color: Color(0xFF9CA3AF))),
              ],
            ),
          ),
        ],
      ),
    );
  }
}