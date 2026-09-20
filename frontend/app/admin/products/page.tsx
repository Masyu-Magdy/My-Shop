"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button as MuiButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  IconButton,
  Switch,
} from "@mui/material";
import { Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { productService, categoryService } from "@/services/product.service";
import { Product } from "@/types";
import ImageUploadField from "@/components/admin/ImageUploadField";

const emptyForm = {
  title: "",
  description: "",
  price: 0,
  discountPercentage: 0,
  category: "",
  brand: "",
  thumbnail: "",
  stock: 0,
};

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => productService.getAll({ limit: 50 }),
  });

  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: categoryService.getAll });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-products"] });

  const createMutation = useMutation({
    mutationFn: () => productService.create({ ...form, images: [form.thumbnail] }),
    onSuccess: () => {
      toast.success("Product added successfully");
      invalidate();
      closeDialog();
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Something went wrong"),
  });

  const updateMutation = useMutation({
    mutationFn: () => productService.update(editing!._id, form),
    onSuccess: () => {
      toast.success("Product updated successfully");
      invalidate();
      closeDialog();
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Something went wrong"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.remove(id),
    onSuccess: () => {
      toast.success("Product deleted successfully");
      invalidate();
    },
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => productService.update(id, { isActive } as any),
    onSuccess: invalidate,
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      title: product.title,
      description: product.description,
      price: product.price,
      discountPercentage: product.discountPercentage,
      category: typeof product.category === "string" ? product.category : product.category._id,
      brand: product.brand,
      thumbnail: product.thumbnail,
      stock: product.stock,
    });
    setOpen(true);
  };

  const closeDialog = () => setOpen(false);

  const isFormValid = form.title && form.description && form.category && form.thumbnail;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage products</h1>
        <MuiButton variant="contained" startIcon={<Plus size={16} />} onClick={openCreate} className="!bg-(--color-primary)">
          Add product
        </MuiButton>
      </div>

      <div className="border rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-start">
            <tr>
              <th className="p-3 text-start">Image</th>
              <th className="p-3 text-start">Product</th>
              <th className="p-3 text-start">Price</th>
              <th className="p-3 text-start">Stock</th>
              <th className="p-3 text-start">Status</th>
              <th className="p-3 text-start">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="p-6 text-center text-gray-500">Loading...</td></tr>
            ) : (
              data?.items.map((product) => (
                <tr key={product._id} className="border-t">
                  <td className="p-3">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden">
                      <Image src={product.thumbnail} alt={product.title} fill className="object-cover" />
                    </div>
                  </td>
                  <td className="p-3 font-medium">{product.title}</td>
                  <td className="p-3">${product.price}</td>
                  <td className="p-3">{product.stock}</td>
                  <td className="p-3">
                    <Switch
                      size="small"
                      checked={(product as any).isActive !== false}
                      onChange={(e) => toggleActive.mutate({ id: product._id, isActive: e.target.checked })}
                    />
                  </td>
                  <td className="p-3 flex gap-1">
                    <IconButton size="small" onClick={() => openEdit(product)}><Pencil size={16} /></IconButton>
                    <IconButton size="small" onClick={() => deleteMutation.mutate(product._id)}><Trash2 size={16} className="text-red-500" /></IconButton>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? "Edit product" : "Add new product"}</DialogTitle>
        <DialogContent className="!space-y-4 !pt-2">
          <ImageUploadField value={form.thumbnail} onChange={(url) => setForm({ ...form, thumbnail: url })} />
          <TextField label="Product name" fullWidth value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <TextField label="Description" fullWidth multiline rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Price" type="number" fullWidth value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            <TextField label="Discount %" type="number" fullWidth value={form.discountPercentage} onChange={(e) => setForm({ ...form, discountPercentage: Number(e.target.value) })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Brand" fullWidth value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            <TextField label="Stock quantity" type="number" fullWidth value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
          </div>
          <Select fullWidth value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} displayEmpty>
            <MenuItem value="" disabled>Select a category</MenuItem>
            {categories?.map((c) => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
          </Select>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={closeDialog}>Cancel</MuiButton>
          <MuiButton
            variant="contained"
            className="!bg-(--color-primary)"
            disabled={!isFormValid}
            onClick={() => (editing ? updateMutation.mutate() : createMutation.mutate())}
          >
            Save
          </MuiButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}
