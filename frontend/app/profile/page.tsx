"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TextField,
  Button as MuiButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Chip,
} from "@mui/material";
import { MapPin, Pencil, Trash2, Plus, MailWarning } from "lucide-react";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/providers/AuthProvider";
import { authService } from "@/services/auth.service";
import { Address } from "@/types";

const emptyAddress: Omit<Address, "_id"> = {
  fullName: "",
  phone: "",
  governorate: "",
  city: "",
  details: "",
  isDefault: false,
};

function ProfileContent() {
  const { user, refetchUser, logout } = useAuth();
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [saving, setSaving] = useState(false);
  const [resending, setResending] = useState(false);

  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState(emptyAddress);

  const handleUpdateInfo = async () => {
    setSaving(true);
    try {
      await authService.updateMe(form);
      await refetchUser();
      toast.success("Your profile has been updated");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwords.next !== passwords.confirm)
      return toast.error("Passwords don't match");
    setSaving(true);
    try {
      await authService.changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.next,
      });
      toast.success("Password changed successfully");
      setPasswords({ current: "", next: "", confirm: "" });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    try {
      await authService.resendVerification();
      toast.success("Verification email sent - check your inbox");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setResending(false);
    }
  };

  const openAddDialog = () => {
    setEditingAddress(null);
    setAddressForm(emptyAddress);
    setAddressDialogOpen(true);
  };

  const openEditDialog = (addr: Address) => {
    setEditingAddress(addr);
    setAddressForm({ ...addr });
    setAddressDialogOpen(true);
  };

  const handleSaveAddress = async () => {
    setSaving(true);
    try {
      if (editingAddress?._id) {
        await authService.updateAddress(editingAddress._id, addressForm);
        toast.success("Address updated successfully");
      } else {
        await authService.addAddress(addressForm);
        toast.success("Address added successfully");
      }
      await refetchUser();
      setAddressDialogOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (id?: string) => {
    if (!id) return;
    if (!confirm("Delete this address?")) return;
    try {
      await authService.deleteAddress(id);
      await refetchUser();
      toast.success("Address deleted successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">My account</h1>

      {user && !user.isEmailVerified && (
        <div className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 mb-6 text-sm">
          <div className="flex items-center gap-2">
            <MailWarning size={18} />
            Please verify your email address to unlock all features.
          </div>
          <button
            onClick={handleResendVerification}
            disabled={resending}
            className="font-semibold underline shrink-0"
          >
            {resending ? "Sending..." : "Resend email"}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
        <aside className="flex md:flex-col gap-2">
          {["Personal info", "Password", "Addresses"].map((label, i) => (
            <button
              key={label}
              onClick={() => setTab(i)}
              className={`text-start px-4 py-2 rounded-xl text-sm font-medium ${
                tab === i
                  ? "bg-(--color-primary) text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              {label}
            </button>
          ))}
          <Link
            href="/profile/orders"
            className="text-start px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-100"
          >
            My orders
          </Link>
          <button
            onClick={() => logout()}
            className="text-start px-4 py-2 rounded-xl text-sm font-medium text-red-500"
          >
            Sign out
          </button>
        </aside>

        <div className="border rounded-2xl p-6">
          {tab === 0 && (
            <div className="space-y-4 max-w-sm">
              <div>
                {" "}
                <TextField
                  label="Name"
                  fullWidth
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                {" "}
                <TextField
                  label="Email address"
                  fullWidth
                  value={user?.email}
                  disabled
                />
              </div>
              <div>
                {" "}
                <TextField
                  label="Phone number"
                  fullWidth
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <MuiButton
                variant="contained"
                disabled={saving}
                onClick={handleUpdateInfo}
                className="!bg-(--color-primary) !rounded-full"
              >
                Save changes
              </MuiButton>
            </div>
          )}

          {tab === 1 && (
            <div className="space-y-4 max-w-sm">
              <div>
              <TextField
                label="Current password"
                type="password"
                fullWidth
                value={passwords.current}
                onChange={(e) =>
                  setPasswords({ ...passwords, current: e.target.value })
                }
              />                
              </div>
              <div>
              <TextField
                label="New password"
                type="password"
                fullWidth
                value={passwords.next}
                onChange={(e) =>
                  setPasswords({ ...passwords, next: e.target.value })
                }
              />
              </div>
              <div>
              <TextField
                label="Confirm new password"
                type="password"
                fullWidth
                value={passwords.confirm}
                onChange={(e) =>
                  setPasswords({ ...passwords, confirm: e.target.value })
                }
              />
              </div>



              <MuiButton
                variant="contained"
                disabled={saving}
                onClick={handleChangePassword}
                className="!bg-(--color-primary) !rounded-full"
              >
                Change password
              </MuiButton>
            </div>
          )}

          {tab === 2 && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <MuiButton
                  startIcon={<Plus size={16} />}
                  onClick={openAddDialog}
                  className="!text-(--color-primary)"
                >
                  Add address
                </MuiButton>
              </div>

              {user?.addresses?.length ? (
                user.addresses.map((addr) => (
                  <div
                    key={addr._id}
                    className="border rounded-xl p-4 text-sm flex justify-between items-start gap-3"
                  >
                    <div className="flex gap-3">
                      <MapPin
                        size={18}
                        className="text-gray-400 shrink-0 mt-0.5"
                      />
                      <div>
                        <p className="font-semibold flex items-center gap-2">
                          {addr.fullName}
                          {addr.isDefault && (
                            <Chip
                              label="Default"
                              size="small"
                              color="primary"
                            />
                          )}
                        </p>
                        <p className="text-gray-500">{addr.phone}</p>
                        <p className="text-gray-500">
                          {addr.governorate}, {addr.city} - {addr.details}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => openEditDialog(addr)}
                        className="p-1.5 rounded-lg hover:bg-gray-100"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(addr._id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">
                  No saved addresses yet. Add one to speed up checkout.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={addressDialogOpen}
        onClose={() => setAddressDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingAddress ? "Edit address" : "Add a new address"}
        </DialogTitle>
        <DialogContent className="!space-y-4 !pt-2">
          <TextField
            label="Full name"
            fullWidth
            margin="dense"
            value={addressForm.fullName}
            onChange={(e) =>
              setAddressForm({ ...addressForm, fullName: e.target.value })
            }
          />
          <TextField
            label="Phone number"
            fullWidth
            margin="dense"
            value={addressForm.phone}
            onChange={(e) =>
              setAddressForm({ ...addressForm, phone: e.target.value })
            }
          />
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Governorate"
              fullWidth
              margin="dense"
              value={addressForm.governorate}
              onChange={(e) =>
                setAddressForm({ ...addressForm, governorate: e.target.value })
              }
            />
            <TextField
              label="City"
              fullWidth
              margin="dense"
              value={addressForm.city}
              onChange={(e) =>
                setAddressForm({ ...addressForm, city: e.target.value })
              }
            />
          </div>
          <TextField
            label="Address details"
            fullWidth
            margin="dense"
            multiline
            rows={2}
            value={addressForm.details}
            onChange={(e) =>
              setAddressForm({ ...addressForm, details: e.target.value })
            }
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={!!addressForm.isDefault}
                onChange={(e) =>
                  setAddressForm({
                    ...addressForm,
                    isDefault: e.target.checked,
                  })
                }
              />
            }
            label="Set as default address"
          />
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setAddressDialogOpen(false)}>
            Cancel
          </MuiButton>
          <MuiButton
            variant="contained"
            disabled={saving}
            onClick={handleSaveAddress}
            className="!bg-(--color-primary)"
          >
            Save address
          </MuiButton>
        </DialogActions>
      </Dialog>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
