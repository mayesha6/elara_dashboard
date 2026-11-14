"use client";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  useGetCategoriesQuery,
  useGetTonesQuery,
  useGetRecognitionValuesQuery,
  useGetMyBalanceQuery,
} from "@/redux/api/recognitionApi";
import { useEffect, useState } from "react";
import { Sparkles, Pencil, Check, X, Send, Coins, ArrowLeft } from "lucide-react";
import {
  useSendRecognitionMutation,
  useGenerateMessageMutation,
  useRegenerateMessageMutation,
  useEditMessageMutation
} from "@/redux/api/userApi";
import { toast } from "react-toastify";
import { formatErrorMessage } from "@/utils/formatError";

export default function Step4Preview({ onBack, onClose }: any) {
  const { watch, setValue } = useFormContext();
  const data = watch();

  // Queries to backend
  const { data: categoriesRes } = useGetCategoriesQuery();
  const { data: tonesRes } = useGetTonesQuery();
  const { data: valuesRes } = useGetRecognitionValuesQuery();
  const { data: balanceRes } = useGetMyBalanceQuery();

  const [sendRecognition, { isLoading: isSending }] = useSendRecognitionMutation();
  const [generateMessage, { isLoading: isGenerating }] = useGenerateMessageMutation();
  const [regenerateMessage, { isLoading: isRegenerating }] = useRegenerateMessageMutation();
  const [editMessage, { isLoading: isEditingApi }] = useEditMessageMutation();
  const [isEditingText, setIsEditingText] = useState(false);
  const [tempMessage, setTempMessage] = useState(data.message || "");

  const categories = categoriesRes?.data || [];
  const tones = tonesRes?.data || [];
  const recognitionValues = valuesRes?.data || [];
  const availableBalance = balanceRes?.data?.balance || 0;

  // Resolve IDs to names
  const selectedCategoryObj = categories.find((c: any) => c._id === data.categoryId);
  const selectedToneObj = tones.find((t: any) => t._id === data.toneId);
  const selectedValuesObjs = recognitionValues.filter((v: any) => data.valueIds?.includes(v._id));
  const primaryValueName = selectedValuesObjs[0]?.name || "Teamwork";

  const handleGenerate = async () => {
    try {
      const payload = {
        category: selectedCategoryObj?.name || "Peer-to-Peer",
        department: data.department || "General",
        recipient_name: data.recipientName || "",
        recognition_values: selectedValuesObjs.map((v: any) => v.name),
        tone: selectedToneObj?.name || "Professional",
        userPrompt: data.userPrompt || undefined,
      };

      const res = await generateMessage(payload).unwrap();
      if (res?.data?.message) {
        setValue("message", res.data.message);
      }
      if (res?.data?.messageId) {
        setValue("messageId", res.data.messageId);
      }
    } catch (error) {
      console.error("Failed to generate AI message:", error);
      toast.error(formatErrorMessage(error, "Failed to generate AI message. Please try again."));
    }
  };

  const handleRegenerate = async () => {
    try {
      const payload = {
        category: selectedCategoryObj?.name || "Peer-to-Peer",
        department: data.department || "General",
        recipient_name: data.recipientName || "",
        recognition_values: selectedValuesObjs.map((v: any) => v.name),
        tone: selectedToneObj?.name || "Professional",
        userPrompt: data.userPrompt || undefined,
      };

      const res = await regenerateMessage(payload).unwrap();
      if (res?.data?.message) {
        setValue("message", res.data.message);
      }
      if (res?.data?.messageId) {
        setValue("messageId", res.data.messageId);
      }
    } catch (error) {
      console.error("Failed to regenerate AI message:", error);
      toast.error(formatErrorMessage(error, "Failed to regenerate AI message. Please try again."));
    }
  };

  useEffect(() => {
    if (!data.message && categories.length > 0 && tones.length > 0 && recognitionValues.length > 0) {
      handleGenerate();
    }
  }, [categories, tones, recognitionValues]);

  useEffect(() => {
    if (data.message) {
      setTempMessage(data.message);
    }
  }, [data.message]);

  const handleSaveEdit = async () => {
    if (!tempMessage.trim()) return;
    try {
      if (data.messageId) {
        await editMessage({
          messageId: data.messageId,
          newMessage: tempMessage
        }).unwrap();
      }
      setValue("message", tempMessage);
      setIsEditingText(false);
      toast.success("Message updated successfully!");
    } catch (error) {
      console.error("Failed to edit message on backend:", error);
      toast.error(formatErrorMessage(error, "Failed to save changes. Please try again."));
    }
  };

  const handleCancelEdit = () => {
    setTempMessage(data.message || "");
    setIsEditingText(false);
  };

  const handleSend = async () => {
    try {
      const payload = {
        receiverEmail: data.receiverEmail,
        points: Number(data.points ?? 100),
        image: data.imageId,
        message: data.message,
        messageId: data.messageId,
        recipient_name: data.recipientName,
        department: data.department
      };

      await sendRecognition(payload).unwrap();
      toast.success("Recognition sent successfully!");
      if (onClose) onClose();
    } catch (err: any) {
      console.error("Error sending recognition:", err);
      toast.error(formatErrorMessage(err, "Failed to send recognition. Please generate AI message first."));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
      {/* বাম পাশ: প্রিভিউ কার্ড */}
      <div
        className="bg-gradient-to-br from-[#555DE3] via-[#656EEB] to-[#958AFF] p-8 rounded-2xl text-white shadow-xl shadow-indigo-500/20 flex flex-col justify-between min-h-[420px] relative overflow-hidden"
      >
        {/* Background decorative glow elements */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-indigo-900/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-extrabold tracking-tight drop-shadow-xs">Elara</h2>
            <span className="text-xs bg-white/20 backdrop-blur-md px-3 py-1 rounded-full font-semibold border border-white/20">
              {selectedCategoryObj?.name || "Recognition"}
            </span>
          </div>

          <p className="text-xs uppercase tracking-wider text-indigo-100/80 mb-0.5">Recipient:</p>
          <h3 className="text-2xl font-bold tracking-tight">{data.recipientName}</h3>
          {data.department && <p className="text-xs text-indigo-100/90 mb-6">{data.department}</p>}

          <div className="bg-white/15 p-5 rounded-2xl text-sm leading-relaxed backdrop-blur-md border border-white/20 min-h-[110px] relative group flex flex-col justify-start shadow-inner">
            {isGenerating || isRegenerating ? (
              <div className="flex flex-col items-center gap-2 py-4 w-full">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs opacity-90 font-medium">Generating personalized message with AI...</span>
              </div>
            ) : isEditingText ? (
              <div className="w-full flex flex-col gap-2">
                <textarea
                  className="w-full bg-white/20 text-white placeholder:text-white/50 border border-white/40 rounded-xl p-2.5 text-sm outline-none focus:border-white/80 resize-none min-h-[85px]"
                  value={tempMessage}
                  onChange={(e) => setTempMessage(e.target.value)}
                  disabled={isEditingApi}
                  rows={3}
                />
                <div className="flex justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isEditingApi}
                    className="px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <X size={12} /> Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={isEditingApi}
                    className="px-3 py-1.5 bg-indigo-900/80 hover:bg-indigo-900 rounded-lg flex items-center gap-1 font-semibold transition-colors shadow-xs"
                  >
                    {isEditingApi ? (
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Check size={12} />
                    )}
                    Save Message
                  </button>
                </div>
              </div>
            ) : (
              <>
                {data.message && (
                  <button
                    type="button"
                    onClick={() => setIsEditingText(true)}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-white/15 hover:bg-white/30 transition-all duration-200"
                    title="Edit message"
                  >
                    <Pencil size={14} className="text-white" />
                  </button>
                )}
                <p className="w-full pr-6 text-slate-50 font-normal">
                  {data.message || `We are recognizing you for showing exceptional values under the ${selectedCategoryObj?.name || "Peer-to-Peer"} category!`}
                </p>
              </>
            )}

            {data.imageId && (
              <div className="mt-4 rounded-xl overflow-hidden flex items-center justify-center border border-white/20 bg-black/10">
                <img
                  src={data.imageId}
                  alt="Recognition Image"
                  className="max-h-56 w-auto object-contain rounded-lg"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/15 relative z-10">
          <div className="flex items-center gap-1.5">
            <span className="bg-white/20 px-3.5 py-1 rounded-xl text-xs font-semibold backdrop-blur-md border border-white/20">
              {primaryValueName}
            </span>
          </div>
          <div className="flex items-center gap-1 bg-amber-500 text-white font-extrabold px-3.5 py-1 rounded-xl text-sm shadow-md">
            <span>{data.points ?? 100} Pts</span>
          </div>
        </div>
      </div>

      {/* ডান পাশ: অ্যাকশন কার্ড */}
      <div className="border border-slate-200/80 rounded-2xl p-6 shadow-md shadow-slate-200/50 bg-white h-fit relative overflow-hidden">
        {/* Top Decorative Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#555DE3] via-purple-500 to-[#00C985]" />

        <h3 className="font-bold text-xl mb-6 text-[#555DE3] flex items-center gap-2 pt-1">
          <Coins className="w-5 h-5 text-[#555DE3]" />
          Actions & Points
        </h3>

        {/* পয়েন্ট স্লাইডার */}
        <div className="mb-6 bg-slate-50/60 p-4 rounded-xl border border-slate-100">
          <Slider
            value={[data.points ?? 100]}
            min={0}
            max={availableBalance}
            step={1}
            disabled={availableBalance === 0}
            className="mb-4 cursor-pointer"
            onValueChange={(val) => setValue("points", val[0])}
          />
          <div className="flex items-center justify-center gap-2 mt-2">
            <input
              type="number"
              value={data.points ?? 100}
              min={0}
              max={availableBalance}
              onChange={(e) => {
                let val = parseInt(e.target.value, 10);
                if (isNaN(val)) val = 0;
                if (val < 0) val = 0;
                if (val > availableBalance) val = availableBalance;
                setValue("points", val);
              }}
              className="w-28 text-center text-3xl font-extrabold text-[#555DE3] bg-white border border-slate-200 rounded-xl py-2 shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#555DE3] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-sm font-bold text-slate-500 bg-slate-200/70 px-2.5 py-1.5 rounded-lg uppercase tracking-wider">pts</span>
          </div>
        </div>

        <div className="space-y-3 text-sm border-t border-slate-100 pt-4">
          <div className="flex justify-between items-center text-slate-600">
            <span>Available Balance:</span>
            <span className="font-bold text-slate-800">{availableBalance.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span>Remaining after award:</span>
            <span className="font-bold text-emerald-600">{(availableBalance - (data.points ?? 100)).toLocaleString()}</span>
          </div>
        </div>

        {/* AI Message Generation / Regeneration */}
        <div className="border-t border-slate-100 pt-4 mt-6">
          <h4 className="font-bold text-sm text-slate-800 mb-2 flex items-center gap-1.5">
            <Sparkles size={16} className="text-[#555DE3]" />
            AI Message Controls
          </h4>
          <textarea
            className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-[#555DE3] focus:ring-2 focus:ring-indigo-500/15 placeholder:text-slate-400 bg-slate-50/50 resize-none"
            placeholder="Optional prompt for AI (e.g. 'Make it more formal', 'Highlight leadership')"
            value={data.userPrompt ?? ""}
            onChange={(e) => setValue("userPrompt", e.target.value)}
            rows={2}
          />
          <button
            type="button"
            className="w-full mt-2.5 text-xs py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 border border-indigo-200 text-[#555DE3] bg-indigo-50/50 hover:bg-indigo-100/60 transition-colors cursor-pointer"
            onClick={handleRegenerate}
            disabled={isGenerating || isRegenerating}
          >
            {isGenerating || isRegenerating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-[#555DE3] border-t-transparent rounded-full animate-spin"></div>
                Regenerating AI Message...
              </>
            ) : (
              <>
                <Sparkles size={14} className="text-[#555DE3]" />
                Regenerate AI Message
              </>
            )}
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 space-y-3 text-sm">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Recognition Details</h4>
          <div className="space-y-2 bg-slate-50/80 p-3 rounded-xl border border-slate-100 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Occasion:</span>
              <span className="font-semibold text-slate-800">{selectedCategoryObj?.name || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tone:</span>
              <span className="font-semibold text-slate-800">{selectedToneObj?.name || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Values:</span>
              <span className="font-semibold text-[#555DE3] text-right truncate max-w-[150px]">
                {selectedValuesObjs.map((v: { name: any; }) => v.name).join(", ") || "-"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            type="button"
            className="w-full sm:w-1/3 py-3.5 rounded-xl text-sm font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            onClick={onBack}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            type="button"
            className="w-full sm:w-2/3 bg-gradient-to-r from-[#555DE3] to-[#7B82F6] hover:from-[#454dc7] hover:to-[#686ee8] py-3.5 rounded-xl text-sm text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-xl transition-all duration-200 cursor-pointer disabled:opacity-50"
            onClick={handleSend}
            disabled={isSending}
          >
            {isSending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sending...
              </>
            ) : (
              <>
                <span>Send Recognition</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}