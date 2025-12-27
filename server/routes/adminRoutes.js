import express from 'express';
import * as AdminController from '../controllers/AdminController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();


// Routes Quản lý Owner
router.get('/owners', verifyToken, isAdmin, AdminController.getAllOwners);
router.post('/owners', verifyToken, isAdmin, AdminController.createOwner);
router.put('/owners/status', verifyToken, isAdmin, AdminController.toggleOwnerStatus);
router.put('/owners/:id', verifyToken, isAdmin, AdminController.updateOwner);

// Routes Quản lý Gói dịch vụ
router.get('/plans', verifyToken, isAdmin, AdminController.getSubscriptionPlans); 
router.post('/plans', verifyToken, isAdmin, AdminController.createPlan);
router.put('/plans/:id', verifyToken, isAdmin, AdminController.updatePlan);
router.delete('/plans/:id', verifyToken, isAdmin, AdminController.deletePlan); // Xóa gói

// Routes Thống kê 
router.get('/stats', verifyToken, isAdmin, AdminController.getSystemStats); 
router.get('/stats/revenue', verifyToken, isAdmin, AdminController.getRevenueStats); // Biểu đồ doanh thu
router.get('/stats/growth', verifyToken, isAdmin, AdminController.getGrowthStats);
router.get('/stats/payment-methods', verifyToken, isAdmin, AdminController.getPaymentMethodStats);
router.get('/stats/top-owners', verifyToken, isAdmin, AdminController.getTopOwners);

router.get('/config', verifyToken, isAdmin, AdminController.getSystemConfig);
router.put('/config', verifyToken, isAdmin, AdminController.updateSystemConfig);

export default router;