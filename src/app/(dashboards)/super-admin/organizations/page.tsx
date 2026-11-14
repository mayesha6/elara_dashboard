"use client";

import { Input } from "@/components/ui/input";
import OrganizationTable from "@/modules/super-admin/organization/OrganizationTable";
import ViewOrganizationModal from "@/modules/super-admin/organization/ViewOrganizationModal";
import DeleteConfirmationModal from "@/modules/super-admin/organization/DeleteConfirmationModal";
import RestoreConfirmationModal from "@/components/common/RestoreConfirmationModal";
import SuspendConfirmationModal from "@/modules/super-admin/organization/SuspendConfirmationModal";
import Pagination from "@/components/common/pagination";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { slugify } from "@/utils/slugify";
import { useGetDepartmentUsersQuery } from "@/redux/api/userApi";
import { 
  useDeleteOrganizationMutation, 
  useRestoreOrganizationMutation, 
  useUpdateOrganizationStatusMutation,
  useApproveOrganizationMutation,
  useRejectOrganizationMutation 
} from "@/redux/api/superAdminApi";

export default function OrganizationManagement() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"active" | "deleted">("active");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);

  // States for delete and suspend modals
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [selectedOrgForAction, setSelectedOrgForAction] = useState<any>(null);

  // Debounce search term to prevent overloading the server on quick typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to page 1 on new search
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // API query hook for fetching organizations
  const { data: orgsRes, isLoading, refetch } = useGetDepartmentUsersQuery({
    accountType: "ORGANIZATION",
    page: currentPage,
    limit: 10,
    searchTerm: debouncedSearch || undefined,
    isDeleted: activeTab === "deleted" ? "true" : undefined,
  });

  const organizations = orgsRes?.data || [];
  const meta = orgsRes?.meta || { total: 0, limit: 10, page: 1, totalPage: 1 };
  const totalPages = meta.totalPage;

  const [deleteOrganization, { isLoading: isDeleting }] = useDeleteOrganizationMutation();
  const [restoreOrganization, { isLoading: isRestoring }] = useRestoreOrganizationMutation();
  const [updateOrganizationStatus] = useUpdateOrganizationStatusMutation();
  const [approveOrganization] = useApproveOrganizationMutation();
  const [rejectOrganization] = useRejectOrganizationMutation();

  const handleApprove = async (id: string) => {
    try {
      await approveOrganization(id).unwrap();
      toast.success("Organization approved successfully");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to approve organization");
      console.error("Failed to approve:", err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectOrganization(id).unwrap();
      toast.success("Organization rejected successfully");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to reject organization");
      console.error("Failed to reject:", err);
    }
  };

  const handleSuspendClick = (id: string) => {
    const org = organizations.find((o: any) => (o._id || o.id) === id);
    if (!org) return;
    setSelectedOrgForAction(org);
    setIsSuspendModalOpen(true);
  };

  const handleSuspendConfirm = async () => {
    if (!selectedOrgForAction) return;
    const id = selectedOrgForAction._id || selectedOrgForAction.id;
    const nextStatus = selectedOrgForAction.isActive === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await updateOrganizationStatus({ id, isActive: nextStatus }).unwrap();
      setIsSuspendModalOpen(false);
      toast.success("Organization status updated successfully");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to update status");
      console.error("Failed to update status:", err);
    }
  };

  const handleDeleteClick = (id: string) => {
    const org = organizations.find((o: any) => (o._id || o.id) === id);
    if (!org) return;
    setSelectedOrgForAction(org);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async (reason?: string) => {
    if (!selectedOrgForAction) return;
    const id = selectedOrgForAction._id || selectedOrgForAction.id;
    try {
      await deleteOrganization({ id, reason }).unwrap();
      setIsDeleteModalOpen(false);
      toast.success("Organization deleted successfully");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to delete organization");
      console.error("Failed to delete organization:", err);
    }
  };

  const handleRestoreClick = (org: any) => {
    setSelectedOrgForAction(org);
    setIsRestoreModalOpen(true);
  };

  const handleRestoreConfirm = async (reason?: string) => {
    if (!selectedOrgForAction) return;
    const id = selectedOrgForAction._id || selectedOrgForAction.id;
    try {
      await restoreOrganization({ id, reason }).unwrap();
      setIsRestoreModalOpen(false);
      toast.success("Organization restored successfully");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to restore organization");
      console.error("Failed to restore organization:", err);
    }
  };

  const handleView = (org: any) => {
    const orgSlug = slugify(org.companyName || org.name);
    router.push(`/super-admin/organizations/${orgSlug}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-[28px] font-medium text-gray-900">Organization Management</h2>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center bg-gray-100 rounded-lg px-3 w-full sm:w-64 border border-gray-200">
            <Search className="w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full focus-visible:ring-0 focus-visible:ring-offset-0 border-none bg-transparent" 
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6">
        <button
          onClick={() => {
            setActiveTab("active");
            setCurrentPage(1);
          }}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === "active"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Active Organizations
        </button>
        <button
          onClick={() => {
            setActiveTab("deleted");
            setCurrentPage(1);
          }}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === "deleted"
              ? "border-rose-600 text-rose-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Deleted Organizations
        </button>
      </div>



      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="text-sm text-gray-500 font-medium animate-pulse">Loading organizations...</p>
        </div>
      ) : (
        <>
          <OrganizationTable
            orgs={organizations}
            onView={handleView}
            onSuspend={handleSuspendClick}
            onDelete={handleDeleteClick}
            onRestore={handleRestoreClick}
            onApprove={handleApprove}
            onReject={handleReject}
          />

          {totalPages > 1 && (
            <div className="flex justify-end mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </>
      )}

      <ViewOrganizationModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        org={selectedOrg}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        orgName={selectedOrgForAction?.companyName || selectedOrgForAction?.name || ""}
        isLoading={isDeleting}
      />

      <RestoreConfirmationModal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        onConfirm={handleRestoreConfirm}
        title="Restore Organization"
        itemName={selectedOrgForAction?.companyName || selectedOrgForAction?.name || ""}
        description={`Are you sure you want to restore organization "${selectedOrgForAction?.companyName || selectedOrgForAction?.name || ""}"? All associated departments and employees will also be restored.`}
        isLoading={isRestoring}
      />

      <SuspendConfirmationModal
        isOpen={isSuspendModalOpen}
        onClose={() => setIsSuspendModalOpen(false)}
        onConfirm={handleSuspendConfirm}
        orgName={selectedOrgForAction?.name || ""}
        isActive={selectedOrgForAction?.isActive === "ACTIVE"}
      />
    </div>
  );
}