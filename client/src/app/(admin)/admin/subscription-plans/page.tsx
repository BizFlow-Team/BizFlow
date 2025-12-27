'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import SubscriptionPlanCard from '@/components/admin/SubscriptionPlanCard';

export default function SubscriptionPlansPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null); // Lưu gói đang sửa

  const [formData, setFormData] = useState({
    plan_name: '',
    price: 0,
    duration_days: 30,
    features: '',
  });

  // Fetch danh sách
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['admin-plans'],
    queryFn: async () => (await api.get('/admin/plans')).data
  });

  // Mutation Tạo/Sửa
  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      // Chuyển features từ string sang mảng
      const payload = {
          ...data,
          features: typeof data.features === 'string' 
            ? data.features.split('\n').filter((f: string) => f.trim() !== '') 
            : data.features
      };

      if (selectedPlan) {
        // Nếu đang sửa -> gọi PUT
        return api.put(`/admin/plans/${selectedPlan.id}`, payload);
      } else {
        // Nếu tạo mới -> gọi POST
        return api.post('/admin/plans', payload);
      }
    },
    onSuccess: () => {
      toast.success(selectedPlan ? 'Cập nhật thành công!' : 'Tạo gói thành công!');
      handleClose();
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
    },
    onError: (err: any) => {
        toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  });

  const deleteMutation = useMutation({
      mutationFn: async (id: string) => {
        return api.delete(`/admin/plans/${id}`);
      },
      onSuccess: () => {
        toast.success('Đã xóa gói dịch vụ');
        queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || 'Không thể xóa gói này');
      }
    });

    const handleDelete = (id: string) => {
      if (confirm('Bạn có chắc chắn muốn xóa gói dịch vụ này không?')) {
          deleteMutation.mutate(id);
      }
    };

  // Mở form Sửa
  const handleEdit = (plan: any) => {
    setSelectedPlan(plan);
    setFormData({
        plan_name: plan.plan_name,
        price: Number(plan.price),
        duration_days: plan.duration_days,
        features: Array.isArray(plan.features) ? plan.features.join('\n') : plan.features,
    });
    setIsDialogOpen(true);
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setSelectedPlan(null);
    setFormData({ plan_name: '', price: 0, duration_days: 30, features: '' });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý Gói Dịch Vụ</h1>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600">
            <Plus size={18} className="mr-2" /> Tạo gói mới
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedPlan ? 'Cập nhật Gói' : 'Thêm Gói Mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
              <div className="space-y-2">
                  <Label>Tên gói</Label>
                  <Input value={formData.plan_name} onChange={e => setFormData({...formData, plan_name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label>Giá (VNĐ)</Label>
                      <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                      <Label>Thời hạn (Ngày)</Label>
                      <Input type="number" value={formData.duration_days} onChange={e => setFormData({...formData, duration_days: Number(e.target.value)})} />
                  </div>
              </div>
              <div className="space-y-2">
                  <Label>Tính năng (Mỗi dòng 1 cái)</Label>
                  <textarea 
                      className="flex min-h-[80px] w-full rounded-md border border-input px-3 py-2 text-sm"
                      rows={5}
                      value={formData.features} 
                      onChange={e => setFormData({...formData, features: e.target.value})} 
                  />
              </div>
              <Button className="w-full" onClick={() => submitMutation.mutate(formData)} disabled={submitMutation.isPending}>
                  {submitMutation.isPending ? 'Đang lưu...' : 'Lưu lại'}
              </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Danh sách gói - Truyền hàm onEdit vào */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan: any) => (
            <SubscriptionPlanCard 
                key={plan.id} 
                plan={plan} 
                onEdit={() => handleEdit(plan)} 
                onDelete={() => handleDelete(plan.id)}
            />
        ))}
      </div>
    </div>
  );
}