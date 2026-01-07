// File: lib/screens/sales_screen.dart
import 'package:flutter/material.dart';

// Đổi tên thành SaleProduct để tránh trùng với Product bên Kho hàng
class SaleProduct {
  final String id;
  final String name;
  final String unit;
  final int price;
  int quantity;

  SaleProduct({
    required this.id,
    required this.name,
    required this.unit,
    required this.price,
    this.quantity = 0,
  });

  int get total => price * quantity;
}

class SalesScreen extends StatefulWidget {
  const SalesScreen({Key? key}) : super(key: key);

  @override
  State<SalesScreen> createState() => _SalesScreenState();
}

class _SalesScreenState extends State<SalesScreen> {
  int _selectedIndex = 1; // Tab Bán hàng
  String? _selectedCustomer;
  final TextEditingController _searchController = TextEditingController();

  final List<String> customers = [
    'Anh Ba (Thầu Xây Dựng)',
    'Chị Tư (Tạp hóa)',
    'Chú Bảy (Sửa nhà)',
    'Cô Sáu (Vàng lai)',
  ];

  final List<SaleProduct> availableProducts = [
    SaleProduct(id: 'SP001', name: 'Xi măng Hà Tiên', unit: 'Bao', price: 90000),
    SaleProduct(id: 'SP002', name: 'Cát xây dựng (Vàng)', unit: 'Khối', price: 250000),
    SaleProduct(id: 'SP003', name: 'Thép Hòa Phát phi 10', unit: 'Cây', price: 115000),
    SaleProduct(id: 'SP004', name: 'Gạch ống 4 lỗ Tuynel', unit: 'Viên', price: 1200),
    SaleProduct(id: 'SP005', name: 'Sơn Dulux Ngoại thất 18L', unit: 'Thùng', price: 1200000),
    SaleProduct(id: 'SP006', name: 'Đá 1x2 Xanh', unit: 'Khối', price: 320000),
    SaleProduct(id: 'SP007', name: 'Ống nhựa Bình Minh D90', unit: 'Cây', price: 150000),
    SaleProduct(id: 'SP008', name: 'Dây điện Cadivi 2.5', unit: 'Cuộn', price: 850000),
  ];

  List<SaleProduct> cartItems = [];

  int get totalAmount {
    return cartItems.fold(0, (sum, item) => sum + item.total);
  }

  int get totalQuantity {
    return cartItems.fold(0, (sum, item) => sum + item.quantity);
  }

  void addToCart(SaleProduct product) {
    setState(() {
      final existingIndex = cartItems.indexWhere((item) => item.id == product.id);
      if (existingIndex >= 0) {
        cartItems[existingIndex].quantity++;
      } else {
        final newProduct = SaleProduct(
          id: product.id,
          name: product.name,
          unit: product.unit,
          price: product.price,
          quantity: 1,
        );
        cartItems.add(newProduct);
      }
    });
  }

  void increaseQuantity(int index) {
    setState(() {
      cartItems[index].quantity++;
    });
  }

  void decreaseQuantity(int index) {
    setState(() {
      if (cartItems[index].quantity > 1) {
        cartItems[index].quantity--;
      } else {
        cartItems.removeAt(index);
      }
    });
  }

  void removeItem(int index) {
    setState(() {
      cartItems.removeAt(index);
    });
  }

  void clearCart() {
    setState(() {
      cartItems.clear();
      _selectedCustomer = null;
    });
  }

  String formatCurrency(int amount) {
    return '${amount.toString().replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]}.',
    )} ₫';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        elevation: 0,
        // Bỏ nút Menu (leading) để hiện nút Back mặc định
        title: const Text(
          'Bán hàng',
          style: TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.qr_code_scanner, color: Colors.white),
            onPressed: () {},
          ),
        ],
      ),
      // Bỏ Drawer vì Dashboard đã quản lý việc điều hướng
      body: Column(
        children: [
          // Phần chọn khách hàng
          Container(
            color: Colors.white,
            padding: const EdgeInsets.all(12),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                border: Border.all(color: const Color(0xFFE5E7EB)),
                borderRadius: BorderRadius.circular(8),
                color: const Color(0xFFF9FAFB),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _selectedCustomer,
                  hint: const Text('Chọn khách hàng'),
                  isExpanded: true,
                  icon: const Icon(Icons.arrow_drop_down),
                  items: customers.map((customer) {
                    return DropdownMenuItem(
                      value: customer,
                      child: Text(customer),
                    );
                  }).toList(),
                  onChanged: (value) {
                    setState(() {
                      _selectedCustomer = value;
                    });
                  },
                ),
              ),
            ),
          ),
          
          // Phần nội dung chính (Chia đôi màn hình)
          Expanded(
            child: Row(
              children: [
                // DANH SÁCH SẢN PHẨM (Bên trái - Flex 3)
                Expanded(
                  flex: 3,
                  child: Container(
                    color: Colors.white,
                    child: Column(
                      children: [
                        Padding(
                          padding: const EdgeInsets.all(8),
                          child: TextField(
                            controller: _searchController,
                            decoration: InputDecoration(
                              hintText: 'Tìm SP...',
                              prefixIcon: const Icon(Icons.search, size: 20),
                              filled: true,
                              fillColor: const Color(0xFFF9FAFB),
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
                              contentPadding: const EdgeInsets.symmetric(vertical: 0),
                              isDense: true,
                            ),
                          ),
                        ),
                        Expanded(
                          child: ListView.builder(
                            itemCount: availableProducts.length,
                            itemBuilder: (context, index) {
                              return _buildProductItem(availableProducts[index]);
                            },
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                
                // GIỎ HÀNG (Bên phải - Flex 2)
                Expanded(
                  flex: 2,
                  child: Container(
                    decoration: const BoxDecoration(
                      color: Color(0xFFF9FAFB),
                      border: Border(left: BorderSide(color: Color(0xFFE5E7EB), width: 1)),
                    ),
                    child: Column(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: const BoxDecoration(
                            color: Colors.white,
                            border: Border(bottom: BorderSide(color: Color(0xFFE5E7EB))),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Giỏ', style: TextStyle(fontWeight: FontWeight.bold)),
                              if (cartItems.isNotEmpty)
                                InkWell(
                                  onTap: clearCart,
                                  child: const Icon(Icons.delete_outline, color: Colors.red, size: 20),
                                ),
                            ],
                          ),
                        ),
                        Expanded(
                          child: cartItems.isEmpty
                              ? const Center(child: Icon(Icons.shopping_cart_outlined, size: 40, color: Colors.grey))
                              : ListView.builder(
                                  itemCount: cartItems.length,
                                  itemBuilder: (context, index) => _buildCartItem(cartItems[index], index),
                                ),
                        ),
                        if (cartItems.isNotEmpty) _buildSummary(),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) {
          setState(() => _selectedIndex = index);
          if (index == 0) Navigator.pop(context); // Quay về Dashboard
        },
        type: BottomNavigationBarType.fixed,
        selectedItemColor: const Color(0xFF2563EB),
        unselectedItemColor: Colors.grey,
        showSelectedLabels: false, // Ẩn chữ cho gọn vì màn hình bé
        showUnselectedLabels: false,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard), label: 'Tổng quan'),
          BottomNavigationBarItem(icon: Icon(Icons.shopping_cart), label: 'Bán hàng'),
          BottomNavigationBarItem(icon: Icon(Icons.inventory), label: 'Kho hàng'),
          BottomNavigationBarItem(icon: Icon(Icons.people), label: 'Sổ nợ'),
        ],
      ),
    );
  }

  // --- Các Widget con ---

  Widget _buildProductItem(SaleProduct product) {
    final isInCart = cartItems.any((item) => item.id == product.id);
    return Container(
      decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Color(0xFFF3F4F6)))),
      child: ListTile(
        dense: true, // Làm nhỏ lại cho vừa màn hình
        contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 0),
        title: Text(product.name, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500), maxLines: 1, overflow: TextOverflow.ellipsis),
        subtitle: Text(formatCurrency(product.price), style: const TextStyle(fontSize: 11)),
        trailing: isInCart
            ? const Icon(Icons.check_circle, color: Colors.green, size: 20)
            : IconButton(
                icon: const Icon(Icons.add_circle_outline),
                color: const Color(0xFF2563EB),
                iconSize: 20,
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
                onPressed: () => addToCart(product),
              ),
      ),
    );
  }

  Widget _buildCartItem(SaleProduct item, int index) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 4),
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(4)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
             mainAxisAlignment: MainAxisAlignment.spaceBetween,
             children: [
               Expanded(child: Text(item.name, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold), maxLines: 1, overflow: TextOverflow.ellipsis)),
               InkWell(onTap: () => removeItem(index), child: const Icon(Icons.close, size: 14, color: Colors.red)),
             ]
          ),
          const SizedBox(height: 4),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(formatCurrency(item.total), style: const TextStyle(fontSize: 11, color: Colors.blue)),
              Row(
                children: [
                  InkWell(onTap: () => decreaseQuantity(index), child: const Icon(Icons.remove_circle_outline, size: 16)),
                  Padding(padding: const EdgeInsets.symmetric(horizontal: 4), child: Text('${item.quantity}', style: const TextStyle(fontSize: 12))),
                  InkWell(onTap: () => increaseQuantity(index), child: const Icon(Icons.add_circle_outline, size: 16)),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSummary() {
    return Container(
      padding: const EdgeInsets.all(8),
      color: Colors.white,
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Tổng:', style: TextStyle(fontSize: 12)),
              Text(formatCurrency(totalAmount), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.red)),
            ],
          ),
          const SizedBox(height: 8),
          SizedBox(
            width: double.infinity,
            height: 36,
            child: ElevatedButton(
              onPressed: _selectedCustomer != null ? () {
                 // Logic thanh toán
                 clearCart();
                 ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Thanh toán thành công!'), backgroundColor: Colors.green));
              } : null,
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2563EB)),
              child: const Text('Thanh toán', style: TextStyle(fontSize: 12)),
            ),
          ),
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