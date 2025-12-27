import { Check, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface PlanProps {
  plan: {
    id: string;
    plan_name: string;
    price: number; // Trong DB trả về string nếu dùng decimal, cần ép kiểu ở cha
    duration_days: number;
    features: string[];
  };
  onEdit?: () => void;
  onDelete?: () => void; // [MỚI] Callback xóa
}

export default function SubscriptionPlanCard({ plan, onEdit, onDelete }: PlanProps) {
  return (
    <Card className="flex flex-col border hover:border-blue-500 transition-all shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-center text-slate-800 font-bold uppercase">
          {plan.plan_name}
        </CardTitle>
        <div className="text-center mt-2">
          <span className="text-3xl font-bold text-blue-600">{formatCurrency(Number(plan.price))}</span>
          <span className="text-gray-500 text-sm font-medium"> / {plan.duration_days} ngày</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 bg-slate-50/50 py-6">
        <ul className="space-y-3 px-2">
          {plan.features?.map((feature, index) => (
            <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
              <div className="mt-0.5 p-0.5 bg-green-100 rounded-full">
                 <Check className="w-3 h-3 text-green-600 shrink-0" />
              </div>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-4 flex gap-2">
        <Button onClick={onEdit} variant="outline" className="flex-1 border-slate-200 hover:bg-blue-50 hover:text-blue-600">
          <Edit className="w-4 h-4 mr-2" /> Sửa
        </Button>
        {/* [MỚI] Nút Xóa */}
        <Button onClick={onDelete} variant="outline" className="flex-1 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200">
          <Trash2 className="w-4 h-4 mr-2" /> Xóa
        </Button>
      </CardFooter>
    </Card>
  );
}