"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button as MuiButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton } from "@mui/material";
import { Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { categoryService } from "@/services/product.service";

const slugify = (text: string) => text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-");

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");

  const { data: categories, isLoading } = useQuery({ queryKey: ["categories"], queryFn: categoryService.getAll });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["categories"] });

  const createMutation = useMutation({
    mutationFn: () => categoryService.create({ name, slug: slugify(name) }),
    onSuccess: () => {
      toast.success("Category added successfully");
      invalidate();
      closeDialog();
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Something went wrong"),
  });

  const updateMutation = useMutation({
    mutationFn: () => categoryService.update(editingId!, { name, slug: slugify(name) }),
    onSuccess: () => {
      toast.success("Category updated successfully");
      invalidate();
      closeDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryService.remove(id),
    onSuccess: () => {
      toast.success("Category deleted successfully");
      invalidate();
    },
    onError: () => toast.error("Can't delete a category linked to products"),
  });

  const closeDialog = () => {
    setOpen(false);
    setEditingId(null);
    setName("");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage categories</h1>
        <MuiButton variant="contained" startIcon={<Plus size={16} />} onClick={() => setOpen(true)} className="!bg-(--color-primary)">
          Add category
        </MuiButton>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          categories?.map((cat) => (
            <div key={cat._id} className="border rounded-2xl p-4 flex items-center justify-between">
              <span className="font-medium">{cat.name}</span>
              <div className="flex gap-1">
                <IconButton size="small" onClick={() => { setEditingId(cat._id); setName(cat.name); setOpen(true); }}>
                  <Pencil size={14} />
                </IconButton>
                <IconButton size="small" onClick={() => deleteMutation.mutate(cat._id)}>
                  <Trash2 size={14} className="text-red-500" />
                </IconButton>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={open} onClose={closeDialog} fullWidth maxWidth="xs">
        <DialogTitle>{editingId ? "Edit category" : "Add new category"}</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth label="Category name" value={name} onChange={(e) => setName(e.target.value)} className="!mt-2" />
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={closeDialog}>Cancel</MuiButton>
          <MuiButton
            variant="contained"
            className="!bg-(--color-primary)"
            disabled={!name}
            onClick={() => (editingId ? updateMutation.mutate() : createMutation.mutate())}
          >
            Save
          </MuiButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}
