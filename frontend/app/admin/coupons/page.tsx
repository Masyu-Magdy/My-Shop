"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button as MuiButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  IconButton,
  Chip,
} from "@mui/material";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { adminCouponService } from "@/services/coupon.service";

const emptyForm = {
  code: "",
  discountType: "percentage" as "percentage" | "fixed",
  discountValue: 10,
  expirationDate: "",
  maxUses: 100,
  minimumOrderAmount: 0,
};

export default function AdminCouponsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data: coupons, isLoading } = useQuery({ queryKey: ["admin-coupons"], queryFn: adminCouponService.getAll });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });

  const createMutation = useMutation({
    mutationFn: () => adminCouponService.create(form),
    onSuccess: () => {
      toast.success("Coupon created successfully");
      invalidate();
      setOpen(false);
      setForm(emptyForm);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Something went wrong"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminCouponService.remove(id),
    onSuccess: () => {
      toast.success("Coupon deleted successfully");
      invalidate();
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage coupons</h1>
        <MuiButton variant="contained" startIcon={<Plus size={16} />} onClick={() => setOpen(true)} className="!bg-(--color-primary)">
          Create coupon
        </MuiButton>
      </div>

      <div className="border rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-start">Code</th>
              <th className="p-3 text-start">Discount type</th>
              <th className="p-3 text-start">Value</th>
              <th className="p-3 text-start">Expires on</th>
              <th className="p-3 text-start">Usage</th>
              <th className="p-3 text-start"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="p-6 text-center text-gray-500">Loading...</td></tr>
            ) : (
              coupons?.map((c) => (
                <tr key={c._id} className="border-t">
                  <td className="p-3"><Chip label={c.code} size="small" /></td>
                  <td className="p-3">{c.discountType === "percentage" ? "Percentage %" : "Fixed amount"}</td>
                  <td className="p-3">{c.discountType === "percentage" ? `${c.discountValue}%` : `$${c.discountValue}`}</td>
                  <td className="p-3">{new Date(c.expirationDate).toLocaleDateString()}</td>
                  <td className="p-3">{c.usedCount} / {c.maxUses}</td>
                  <td className="p-3">
                    <IconButton size="small" onClick={() => deleteMutation.mutate(c._id)}>
                      <Trash2 size={16} className="text-red-500" />
                    </IconButton>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create new coupon</DialogTitle>
        <DialogContent className="!space-y-4 !pt-2">
          <TextField label="Coupon code" fullWidth value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
          <div className="grid grid-cols-2 gap-3">
            <Select fullWidth value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value as any })}>
              <MenuItem value="percentage">Percentage %</MenuItem>
              <MenuItem value="fixed">Fixed amount</MenuItem>
            </Select>
            <TextField label="Value" type="number" fullWidth value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} />
          </div>
          <TextField
            label="Expiration date"
            type="date"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            value={form.expirationDate}
            onChange={(e) => setForm({ ...form, expirationDate: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Maximum uses" type="number" fullWidth value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: Number(e.target.value) })} />
            <TextField label="Minimum order amount" type="number" fullWidth value={form.minimumOrderAmount} onChange={(e) => setForm({ ...form, minimumOrderAmount: Number(e.target.value) })} />
          </div>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setOpen(false)}>Cancel</MuiButton>
          <MuiButton variant="contained" className="!bg-(--color-primary)" onClick={() => createMutation.mutate()}>
            Create
          </MuiButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}
