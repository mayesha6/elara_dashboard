"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useDeleteOwnAccountMutation } from "@/redux/api/userApi";
import { useAppDispatch } from "@/redux/hook";
import { logout } from "@/redux/features/authSlice";
import { useGetMeQuery } from "@/redux/api/authApi";
import { toast } from "sonner";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";

import { getWebsiteUrl } from "@/config/env";
import { formatErrorMessage } from "@/utils/formatError";

export default function DangerZone() {
  const dispatch = useAppDispatch();
  const { data: profileRes } = useGetMeQuery(undefined);
  const user = profileRes?.data;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteOwnAccount, { isLoading: isDeleting }] = useDeleteOwnAccountMutation();

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = `${getWebsiteUrl()}/login`;
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteOwnAccount(undefined).unwrap();
      toast.success("Account deleted successfully.");
      handleLogout();
    } catch (error: unknown) {
      toast.error(formatErrorMessage(error, "Failed to delete account. Please try again."));
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm flex flex-col justify-between h-full min-h-[220px]">
      <div>
        <div className="flex items-center gap-2 text-red-600 mb-4">
          <AlertTriangle className="w-6 h-6 shrink-0" />
          <h3 className="font-light text-2xl">Danger Zone</h3>
        </div>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Once you delete your account, there is no going back. All of your data will be permanently removed. Please be certain.
        </p>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setIsDeleteModalOpen(true)}
          className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer"
        >
          Delete Account
        </button>
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Your Account"
        itemName={user?.name}
        description={
          user?.role === "ORGANIZATION_ADMIN"
            ? "Are you sure you want to delete your organization account? This will permanently remove your organization and all user accounts under it. This action cannot be undone."
            : "Are you sure you want to delete your account? This action is permanent and cannot be undone."
        }
        isLoading={isDeleting}
        requireConfirmInput={true}
        confirmInputLabel="Type DELETE to confirm permanent account deletion:"
        confirmInputPlaceholder="DELETE"
        expectedInputValue="DELETE"
      />
    </div>
  );
}
