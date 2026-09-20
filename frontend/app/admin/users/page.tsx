"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Switch, Chip } from "@mui/material";
import toast from "react-hot-toast";
import { adminService } from "@/services/admin.service";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { data: users, isLoading } = useQuery({ queryKey: ["admin-users"], queryFn: adminService.getUsers });

  const toggleStatus = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => adminService.updateUserStatus(id, isActive),
    onSuccess: () => {
      toast.success("Account status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage users</h1>

      <div className="border rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-start">Name</th>
              <th className="p-3 text-start">Email</th>
              <th className="p-3 text-start">Phone</th>
              <th className="p-3 text-start">Role</th>
              <th className="p-3 text-start">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="p-6 text-center text-gray-500">Loading...</td></tr>
            ) : (
              users?.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="p-3 font-medium">{user.name}</td>
                  <td className="p-3 text-gray-500">{user.email}</td>
                  <td className="p-3 text-gray-500">{user.phone || "—"}</td>
                  <td className="p-3">
                    <Chip
                      size="small"
                      label={user.role === "admin" ? "Admin" : "User"}
                      color={user.role === "admin" ? "secondary" : "default"}
                    />
                  </td>
                  <td className="p-3">
                    <Switch
                      size="small"
                      checked={(user as any).isActive !== false}
                      disabled={user.role === "admin"}
                      onChange={(e) => toggleStatus.mutate({ id: user.id, isActive: e.target.checked })}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 mt-3">
        * Promoting a user to &quot;admin&quot; is disabled from the UI for security reasons - it can only be done manually in the database.
      </p>
    </div>
  );
}
