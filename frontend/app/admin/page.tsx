"use client";

import { useQuery } from "@tanstack/react-query";
import { DollarSign, ShoppingBag, Users, Package } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { adminService } from "@/services/admin.service";

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="border rounded-2xl p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-(--color-primary)/10 text-(--color-primary) flex items-center justify-center">
        <Icon size={22} />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}

export default function AdminOverviewPage() {
  const { data, isLoading } = useQuery({ queryKey: ["admin-dashboard"], queryFn: adminService.getDashboardStats });

  if (isLoading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Overview</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={DollarSign} label="Total revenue" value={`$${data?.totalRevenue.toFixed(2)}`} />
        <StatCard icon={ShoppingBag} label="Total orders" value={data?.totalOrders || 0} />
        <StatCard icon={Users} label="Total users" value={data?.totalUsers || 0} />
        <StatCard icon={Package} label="Total products" value={data?.totalProducts || 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border rounded-2xl p-5">
          <h3 className="font-bold mb-4">Best sellers</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data?.topProducts}>
              <XAxis dataKey="_id" hide />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalSold" fill="#6C2BD9" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="border rounded-2xl p-5">
          <h3 className="font-bold mb-4">Recent orders</h3>
          <div className="space-y-3">
            {data?.recentOrders.map((order: any) => (
              <div key={order._id} className="flex justify-between text-sm border-b pb-2">
                <span>{order.user?.name || "User"}</span>
                <span className="text-gray-500">${order.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
