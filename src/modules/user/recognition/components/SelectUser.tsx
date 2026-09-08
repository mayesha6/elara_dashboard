"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, UserCheck } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SendRecognitionFormValues } from "../validation/recognition.schema";

interface SelectUserProps {
  prefilledUser: any;
  onContinue: () => void;
  onClose: () => void;
}

export default function SelectUser({ prefilledUser, onContinue }: SelectUserProps) {
  const { setValue, watch, trigger, formState: { errors } } = useFormContext<SendRecognitionFormValues>();

  const getNormalizedDepartment = (user: any) => {
    if (!user) return "";
    const dept = user?.departmentId || user?.department?.name || user?.departmentName || user?.department || "";
    if (typeof dept !== "string") return "";
    return dept.trim();
  };

  useEffect(() => {
    if (prefilledUser) {
      const recipientId = prefilledUser?._id || prefilledUser?.id || "";
      const departmentId = getNormalizedDepartment(prefilledUser);
      setValue("recipientId", recipientId, { shouldValidate: true });
      setValue("departmentId", departmentId);
      setValue("recipientName", prefilledUser?.name || "");
      setValue("department", departmentId);
      setValue("receiverEmail", prefilledUser?.email || "");
    } else {
      // Guest Recognition flow: prefill recipientId as "guest" and department as "Guest"
      setValue("recipientId", "guest", { shouldValidate: true });
      setValue("departmentId", "Guest");
      setValue("department", "Guest");
    }
  }, [prefilledUser, setValue]);

  const recipientName = watch("recipientName") || "";
  const receiverEmail = watch("receiverEmail") || "";
  const department = watch("department") || "Guest";

  const handleNext = async () => {
    // Validate Step 1 fields before proceeding
    const isValid = await trigger(["recipientId", "recipientName", "receiverEmail"]);
    if (isValid) {
      onContinue();
    }
  };

  return (
    <div className="flex justify-center items-start mt-10">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md shadow-slate-200/50 w-full max-w-lg p-8 relative overflow-hidden">
        {/* Top Decorative Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#555DE3] via-purple-500 to-[#00C985]" />

        <div className="mb-8 pt-1">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-3 border border-indigo-100 text-[#555DE3]">
            <UserCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Who would you like to recognize?</h2>
          <p className="text-slate-500 text-sm">Enter recipient details or select a team member</p>
        </div>

        <div className="space-y-6">
          {/* Full Name Field */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-slate-700 font-semibold text-sm">Full Name</Label>
            <Input
              id="fullName"
              placeholder="e.g. Saifur Rahman"
              value={recipientName}
              onChange={(e) => setValue("recipientName", e.target.value, { shouldValidate: true })}
              disabled={!!prefilledUser}
              className="h-12 border border-slate-200 focus:border-[#555DE3] focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-slate-800 placeholder:text-slate-400"
            />
            {errors.recipientName && (
              <p className="text-red-500 text-xs mt-1 font-medium">{errors.recipientName.message}</p>
            )}
          </div>

          {/* Email Address Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700 font-semibold text-sm">Email Address</Label>
            <Input
              id="email"
              placeholder="example@gmail.com"
              value={receiverEmail}
              onChange={(e) => setValue("receiverEmail", e.target.value, { shouldValidate: true })}
              disabled={!!prefilledUser}
              className="h-12 border border-slate-200 focus:border-[#555DE3] focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-slate-800 placeholder:text-slate-400"
            />
            {errors.receiverEmail && (
              <p className="text-red-500 text-xs mt-1 font-medium">{errors.receiverEmail.message}</p>
            )}
          </div>

          {/* Department Field */}
          <div className="space-y-2">
            <Label htmlFor="department" className="text-slate-700 font-semibold text-sm">
              Department <span className="text-slate-400 font-normal text-xs">(Optional)</span>
            </Label>
            <Select
              disabled={true}
              value={department}
            >
              <SelectTrigger className="h-12 border border-slate-200 rounded-xl text-slate-800">
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={department}>{department}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleNext}
            className="w-full h-12 bg-gradient-to-r from-[#555DE3] to-[#7B82F6] hover:from-[#454dc7] hover:to-[#686ee8] text-white rounded-xl text-base font-bold mt-4 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all duration-200 cursor-pointer"
          >
            <span>Continue to Details</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}