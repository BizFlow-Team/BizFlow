// File: lib/screens/inventory_screen.dart
import 'package:flutter/material.dart';

// Class Product (Mô hình dữ liệu sản phẩm)
class Product {
  final String code;
  final String name;
  final String unit;
  final String price;
  final int stock;
  final String status;

  Product({
    required this.code,
    required this.name,
    required this.unit,
    required this.price,
    required this.stock,
    required this.status,
  });
}

class InventoryScreen extends StatefulWidget {
  const InventoryScreen({Key? key}) : super(key: key);

  @override
  State<InventoryScreen> createState() => _InventoryScreenState();
}

class _InventoryScreenState extends State<InventoryScreen> {
  int _selectedIndex = 2; // Mặc định chọn tab Kho hàng
  final TextEditingController _searchController = TextEditingController();
  
  // Dữ liệu giả lập
  final List<Product> products = [
    Product(code: 'SP001', name: 'Xi măng Hà Tiên', unit: 'Bao', price: '90.000 ₫', stock: 150, status: 'available'),
    Product(code: 'SP002', name: 'Cát xây dựng (Vàng)', unit: 'Khối', price: '250.000 ₫', stock: 5, status: 'low'),
    Product(code: 'SP003', name: 'Thép Hòa Phát phi 10', unit: 'Cây', price: '115.000 ₫', stock: 500, status: 'available'),
    Product(code: 'SP004', name: 'Gạch ống 4 lỗ Tuynel', unit: 'Viên', price: '1.200 ₫', stock: 5000, status: 'available'),
    Product(code: 'SP005', name: 'Sơn Dulux Ngoại thất 18L', unit: 'Thùng', price: '1.200.000 ₫', stock: 15, status: 'available'),
    Product(code: 'SP006', name: 'Đá 1x2 Xanh', unit: 'Khối', price: '320.000 ₫', stock: 10, status: 'available'),
    Product(code: 'SP007', name: 'Ống nhựa Bình Minh D90', unit: 'Cây', price: '150.000 ₫', stock: 45, status: 'available'),
    Product(code: 'SP008', name: 'Dây điện Cadivi 2.5', unit: 'Cuộn', price: '850.000 ₫', stock: 30, status: 'available'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        elevation: 0,
        // Đã bỏ nút Menu (leading) để Flutter tự hiện nút Back
        title: const Text(
          'Kho hàng',
          style: TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.mic, color: Colors.white),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.add_circle_outline, color: Colors.white),
            tooltip: 'Thêm nhanh',
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Phần thanh công cụ trên cùng
          Container(
            color: Colors.white,
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Danh sách',
                      style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                    ),
                    Row(
                      children: [
                        OutlinedButton.icon(
                          onPressed: () {},
                          icon: const Icon(Icons.file_download, size: 18),
                          label: const Text('Xuất'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: const Color(0xFF1E293B),
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                          ),
                        ),
                        const SizedBox(width: 8),
                        ElevatedButton.icon(
                          onPressed: () {},
                          icon: const Icon(Icons.add, size: 18),
                          label: const Text('Nhập'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF2563EB),
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Tìm sản phẩm...',
                    prefixIcon: const Icon(Icons.search, color: Colors.grey),
                    filled: true,
                    fillColor: const Color(0xFFF9FAFB),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
                    contentPadding: const EdgeInsets.symmetric(vertical: 0),
                  ),
                ),
              ],
            ),
          ),
          
          // Phần bảng dữ liệu
          Expanded(
            child: SingleChildScrollView(
              scrollDirection: Axis.vertical,
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: _buildDataTable(),
              ),
            ),
          ),
        ],
      ),
      // Giữ lại BottomBar của bạn nếu muốn, hoặc bỏ đi nếu muốn Dashboard quản lý
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) {
            setState(() => _selectedIndex = index);
            if(index == 0) Navigator.pop(context); // Về Dashboard nếu ấn Home
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

  Widget _buildDataTable() {
    return DataTable(
      headingRowColor: MaterialStateProperty.all(const Color(0xFFF9FAFB)),
      columnSpacing: 20,
      columns: const [
        DataColumn(label: Text('MÃ', style: TextStyle(fontWeight: FontWeight.bold))),
        DataColumn(label: Text('TÊN SẢN PHẨM', style: TextStyle(fontWeight: FontWeight.bold))),
        DataColumn(label: Text('ĐVT', style: TextStyle(fontWeight: FontWeight.bold))),
        DataColumn(label: Text('GIÁ', style: TextStyle(fontWeight: FontWeight.bold))),
        DataColumn(label: Text('TỒN', style: TextStyle(fontWeight: FontWeight.bold))),
        DataColumn(label: Text('TRẠNG THÁI', style: TextStyle(fontWeight: FontWeight.bold))),
        DataColumn(label: Text('')),
      ],
      rows: products.map((product) {
        return DataRow(
          cells: [
            DataCell(Text(product.code)),
            DataCell(Text(product.name, style: const TextStyle(fontWeight: FontWeight.w500))),
            DataCell(Text(product.unit)),
            DataCell(Text(product.price, style: const TextStyle(color: Colors.blue, fontWeight: FontWeight.bold))),
            DataCell(Text(product.stock.toString())),
            DataCell(
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: product.status == 'available' ? Colors.green.withOpacity(0.1) : Colors.orange.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  product.status == 'available' ? 'Còn hàng' : 'Sắp hết',
                  style: TextStyle(
                    color: product.status == 'available' ? Colors.green : Colors.orange,
                    fontSize: 12,
                  ),
                ),
              ),
            ),
            DataCell(IconButton(icon: const Icon(Icons.more_vert), onPressed: () => _showProductMenu(context))),
          ],
        );
      }).toList(),
    );
  }

  void _showProductMenu(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (context) => Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ListTile(leading: const Icon(Icons.edit, color: Colors.blue), title: const Text('Sửa'), onTap: () => Navigator.pop(context)),
          ListTile(leading: const Icon(Icons.delete, color: Colors.red), title: const Text('Xóa'), onTap: () => Navigator.pop(context)),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
}