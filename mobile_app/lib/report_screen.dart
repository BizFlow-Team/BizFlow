// File: lib/screens/report_screen.dart
import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';

class ReportScreen extends StatefulWidget {
  const ReportScreen({Key? key}) : super(key: key);

  @override
  State<ReportScreen> createState() => _ReportScreenState();
}

class _ReportScreenState extends State<ReportScreen> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        elevation: 0,
        // Nút Back sẽ tự động hiện ra vì đây là màn hình con
        title: const Text(
          'Chi tiết Báo cáo',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w600,
          ),
        ),
        iconTheme: const IconThemeData(color: Colors.white), // Để nút back màu trắng
      ),
      backgroundColor: const Color(0xFFF5F5F5),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Padding(
              padding: EdgeInsets.all(16.0),
              child: Text(
                'Tổng quan tài chính',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1E293B),
                ),
              ),
            ),
            _buildStatCards(),
            const SizedBox(height: 16),
            _buildRevenueChart(),
            const SizedBox(height: 16),
            _buildRecentActivities(),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  // ... (Phần code Widget con bên dưới giữ nguyên như của bạn) ...
  
  Widget _buildStatCards() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Column(
        children: [
          _buildStatCard('Doanh thu hôm nay', '6.100.000 ₫', '+12% so với hôm qua', Colors.green, Icons.trending_up),
          const SizedBox(height: 12),
          _buildStatCard('Tổng nợ phải thu', '18.000.000 ₫', '3 khách nợ quá hạn', Colors.red, Icons.people_outline),
          const SizedBox(height: 12),
          _buildStatCard('Cảnh báo tồn kho', '2 SP', 'Sơn Dulux, Cát vàng sắp hết', Colors.orange, Icons.warning_amber),
        ],
      ),
    );
  }

  Widget _buildStatCard(String title, String value, String subtitle, Color color, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 2)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: const TextStyle(fontSize: 14, color: Colors.grey)),
              Icon(icon, color: color, size: 24),
            ],
          ),
          const SizedBox(height: 8),
          Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
          const SizedBox(height: 4),
          Text(subtitle, style: TextStyle(fontSize: 13, color: color)),
        ],
      ),
    );
  }

  Widget _buildRevenueChart() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Doanh thu & Chi phí (Tuần này)', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Color(0xFF1E293B))),
          const SizedBox(height: 20),
          SizedBox(
            height: 200,
            child: BarChart(
              BarChartData(
                alignment: BarChartAlignment.spaceAround,
                maxY: 8,
                barTouchData: BarTouchData(enabled: false),
                titlesData: FlTitlesData(
                  show: true,
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      getTitlesWidget: (value, meta) {
                        const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
                        if (value.toInt() >= 0 && value.toInt() < days.length) {
                             return Text(days[value.toInt()], style: const TextStyle(fontSize: 12));
                        }
                        return const Text('');
                      },
                    ),
                  ),
                  leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)), // Ẩn số bên trái cho gọn
                  topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                ),
                gridData: FlGridData(show: false),
                borderData: FlBorderData(show: false),
                barGroups: [
                  _buildBarGroup(0, 2.5, 2.0),
                  _buildBarGroup(1, 4.0, 3.5),
                  _buildBarGroup(2, 3.5, 3.0),
                  _buildBarGroup(3, 6.0, 4.0),
                  _buildBarGroup(4, 5.0, 3.8),
                  _buildBarGroup(5, 7.5, 6.0),
                  _buildBarGroup(6, 6.5, 5.0),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildLegend(const Color(0xFF2563EB), 'Doanh thu'),
              const SizedBox(width: 20),
              _buildLegend(Colors.grey, 'Chi phí'),
            ],
          ),
        ],
      ),
    );
  }

  BarChartGroupData _buildBarGroup(int x, double doanhThu, double chiPhi) {
    return BarChartGroupData(
      x: x,
      barRods: [
        BarChartRodData(toY: doanhThu, color: const Color(0xFF2563EB), width: 12, borderRadius: const BorderRadius.vertical(top: Radius.circular(4))),
        BarChartRodData(toY: chiPhi, color: Colors.grey, width: 12, borderRadius: const BorderRadius.vertical(top: Radius.circular(4))),
      ],
    );
  }

  Widget _buildLegend(Color color, String label) {
    return Row(children: [Container(width: 16, height: 16, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(3))), const SizedBox(width: 6), Text(label, style: const TextStyle(fontSize: 13))]);
  }

  Widget _buildRecentActivities() {
     // Giữ nguyên logic hoạt động gần đây của bạn ở đây
     // (Để code gọn mình không paste lại phần này, bạn cứ giữ nguyên code cũ của hàm này)
     return Container(); 
  }
}