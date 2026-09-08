"use client";
import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Sparkles, Layers, Smile, Award, Check, Coins, MessageSquarePlus } from "lucide-react";
import {
  useGetCategoriesQuery,
  useGetTonesQuery,
  useGetRecognitionValuesQuery,
  useGetMyBalanceQuery,
} from "@/redux/api/recognitionApi";

export default function Configuration({ onNext, onBack }: any) {
  const { watch, setValue } = useFormContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Queries to backend
  const { data: categoriesRes, isLoading: loadingCategories } = useGetCategoriesQuery();
  const { data: tonesRes, isLoading: loadingTones } = useGetTonesQuery();
  const { data: valuesRes, isLoading: loadingValues } = useGetRecognitionValuesQuery();
  const { data: balanceRes, isLoading: loadingBalance } = useGetMyBalanceQuery();

  const categories = categoriesRes?.data || [];
  const tones = tonesRes?.data || [];
  const recognitionValues = valuesRes?.data || [];
  const availableBalance = balanceRes?.data?.balance || 0;

  // Form state watching
  const selectedCategory = watch("categoryId");
  const selectedTone = watch("toneId");
  const selectedValues = watch("valueIds") || [];
  const points = watch("points") ?? 100;
  const userPrompt = watch("userPrompt") ?? "";

  // Ensure points are capped at available balance if balance changes
  useEffect(() => {
    if (points > availableBalance) {
      setValue("points", availableBalance);
    }
  }, [availableBalance, points, setValue]);

  const toggleValue = (valId: string) => {
    const current = selectedValues;
    if (current.includes(valId)) {
      setValue("valueIds", current.filter((i: string) => i !== valId));
    } else if (current.length < 3) {
      setValue("valueIds", [...current, valId]);
    }
  };

  const selectedCategoryObj = categories.find((cat: any) => cat._id === selectedCategory);
  const selectedToneObj = tones.find((tone: any) => tone._id === selectedTone);

  if (loadingCategories || loadingTones || loadingValues || loadingBalance) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
        <div className="w-10 h-10 border-4 border-[#555DE3] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium text-sm animate-pulse">Loading recognition configuration...</p>
      </div>
    );
  }

  // Calculate percentage of points used vs available balance
  const balancePercentage = availableBalance > 0 ? Math.min(100, Math.round((points / availableBalance) * 100)) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* বাম পাশের কনফিগারেশন সেকশন */}
      <div className="lg:col-span-2 space-y-8">
        {/* Category Section */}
        <section className="bg-white/40 p-1 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20 shadow-xs">
                <Layers className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800 tracking-tight">Select Category</h3>
                <p className="text-xs text-slate-400">Choose the primary occasion for this recognition</p>
              </div>
            </div>
            {selectedCategoryObj && (
              <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200/60 animate-fade-in">
                {selectedCategoryObj.name}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2.5">
            {categories.map((cat: any) => {
              const isSelected = selectedCategory === cat._id;
              return (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => {
                    setValue("categoryId", cat._id);
                    setValue("imageId", ""); // image selections are category dependent
                    if (cat.images && cat.images.length > 0) {
                      setIsModalOpen(true);
                    }
                  }}
                  className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-2 transform active:scale-95 ${
                    isSelected
                      ? "bg-gradient-to-r from-[#555DE3] to-[#7B82F6] text-white shadow-md shadow-indigo-500/25 border border-transparent"
                      : "bg-white text-slate-700 border border-slate-200 hover:border-[#555DE3] hover:text-[#555DE3] hover:bg-indigo-50/30 shadow-2xs"
                  }`}
                >
                  {isSelected && <Check className="w-4 h-4 text-white stroke-[3] animate-scale-in" />}
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Tone Section */}
        <section className="bg-white/40 p-1 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center shrink-0 border border-teal-500/20 shadow-xs">
                <Smile className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800 tracking-tight">Choose Tone of Value</h3>
                <p className="text-xs text-slate-400">Sets the emotional tone for AI message generation</p>
              </div>
            </div>
            {selectedToneObj && (
              <span className="text-xs font-semibold px-2.5 py-1 bg-teal-50 text-teal-700 rounded-full border border-teal-200/60 animate-fade-in">
                {selectedToneObj.name}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2.5">
            {tones.map((tone: any) => {
              const isSelected = selectedTone === tone._id;
              return (
                <button
                  key={tone._id}
                  type="button"
                  onClick={() => setValue("toneId", tone._id)}
                  className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-2 transform active:scale-95 ${
                    isSelected
                      ? "bg-gradient-to-r from-[#00C985] to-teal-500 text-white shadow-md shadow-emerald-500/25 border border-transparent"
                      : "bg-white text-slate-700 border border-slate-200 hover:border-[#00C985] hover:text-[#00C985] hover:bg-emerald-50/30 shadow-2xs"
                  }`}
                >
                  {isSelected && <Check className="w-4 h-4 text-white stroke-[3] animate-scale-in" />}
                  <span>{tone.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Value Section */}
        <section className="bg-white/40 p-1 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20 shadow-xs">
                <Award className="w-5 h-5 text-[#555DE3]" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800 tracking-tight">
                  Employee Recognition Value{" "}
                  <span className="font-normal text-xs text-slate-500">(Choose up to 3)</span>
                </h3>
                <p className="text-xs text-slate-400">Select key virtues demonstrated by the recipient</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-[#555DE3] rounded-full border border-indigo-100">
              {selectedValues.length} / 3 Selected
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {recognitionValues.map((val: any) => {
              const isSelected = selectedValues.includes(val._id);
              return (
                <button
                  key={val._id}
                  type="button"
                  onClick={() => toggleValue(val._id)}
                  className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-2 transform active:scale-95 ${
                    isSelected
                      ? "bg-gradient-to-r from-[#555DE3] to-[#8087F8] text-white shadow-md shadow-indigo-500/20 border border-transparent"
                      : "bg-white text-slate-700 border border-slate-200 hover:border-[#555DE3] hover:text-[#555DE3] hover:bg-indigo-50/30 shadow-2xs"
                  }`}
                >
                  {isSelected && <Check className="w-4 h-4 text-white stroke-[3] animate-scale-in" />}
                  <span>{val.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* AI Message Control (Optional Prompt) */}
        <section className="bg-white/40 p-1 rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20 shadow-xs">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800 tracking-tight">
                AI Message Guidance <span className="font-normal text-xs text-slate-400">(Optional)</span>
              </h3>
              <p className="text-xs text-slate-400">Give custom instructions to tweak the generated message</p>
            </div>
          </div>
          <div className="relative">
            <textarea
              className="w-full border border-slate-200 rounded-xl p-3.5 text-sm bg-white outline-none focus:border-[#555DE3] focus:ring-3 focus:ring-indigo-500/15 transition-all duration-200 placeholder:text-slate-400 shadow-2xs resize-none"
              placeholder="e.g., 'Emphasize strong teamwork during the product launch', 'Make it concise and enthusiastic'"
              value={userPrompt}
              onChange={(e) => setValue("userPrompt", e.target.value)}
              rows={3}
            />
            <MessageSquarePlus className="w-4 h-4 text-slate-300 absolute bottom-3.5 right-3.5 pointer-events-none" />
          </div>
        </section>

        {/* Image Selection Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-xl bg-white p-6 rounded-2xl border border-slate-100 shadow-xl">
            <style>{`
              .no-scrollbar::-webkit-scrollbar {
                display: none;
              }
              .no-scrollbar {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
            `}</style>

            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h2 className="font-bold text-lg text-[#555DE3]">
                Select Card Banner for {selectedCategoryObj?.name}
              </h2>
            </div>

            <div className="max-h-[60vh] overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-3 gap-4">
                {selectedCategoryObj?.images?.map((img: string) => {
                  const isSelected = watch("imageId") === img;
                  return (
                    <div
                      key={img}
                      onClick={() => {
                        setValue("imageId", img);
                        setIsModalOpen(false);
                      }}
                      className={`h-28 bg-slate-100 rounded-xl cursor-pointer overflow-hidden border-2 transition-all duration-200 relative group ${
                        isSelected
                          ? "border-[#555DE3] ring-4 ring-indigo-100 shadow-md"
                          : "border-transparent hover:border-indigo-400 hover:shadow-md"
                      }`}
                    >
                      <img src={img} alt="Category option" className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-[#555DE3] text-white p-1 rounded-full shadow-md">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {(!selectedCategoryObj?.images || selectedCategoryObj.images.length === 0) && (
                <p className="text-slate-400 text-sm text-center py-6">No custom banners available for this category.</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ডান পাশের Action Card (Keep same container layout, margins, and responsiveness) */}
      <div className="border border-slate-200/80 rounded-2xl p-6 shadow-md shadow-slate-200/50 bg-white h-fit relative overflow-hidden">
        {/* Top Decorative Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#555DE3] via-purple-500 to-[#00C985]" />

        <div className="flex items-center justify-between mb-6 pt-1">
          <h3 className="font-bold text-xl text-[#555DE3] flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-500" />
            Assign Points
          </h3>
          <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-[#555DE3] rounded-full border border-indigo-100">
            Available: {availableBalance.toLocaleString()}
          </span>
        </div>

        {/* Points Slider Controls */}
        <div className="mb-6 bg-slate-50/60 p-4 rounded-xl border border-slate-100">
          <Slider
            value={[points]}
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
              value={points}
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

        {/* Balance Status */}
        <div className="space-y-3 text-sm border-t border-slate-100 pt-4">
          <div className="flex justify-between items-center text-slate-600">
            <span>Available Balance:</span>
            <span className="font-bold text-slate-800">{availableBalance.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span>Remaining after award:</span>
            <span className={`font-bold ${availableBalance - points < 0 ? "text-red-500" : "text-emerald-600"}`}>
              {(availableBalance - points).toLocaleString()}
            </span>
          </div>

          {/* Balance Usage Bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-gradient-to-r from-[#555DE3] to-[#00C985] transition-all duration-300"
              style={{ width: `${balancePercentage}%` }}
            />
          </div>
        </div>

        {/* Recognition Summary */}
        <div className="mt-6 pt-4 border-t border-slate-100 space-y-3 text-sm">
          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400">Recognition Summary</h4>
          <div className="space-y-2 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Occasion:</span>
              <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                {selectedCategoryObj?.name || "-"}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Tone:</span>
              <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                {selectedToneObj?.name || "-"}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Selected Values:</span>
              <span className="font-semibold text-[#555DE3]">
                {selectedValues.length} selected
              </span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          type="button"
          className="w-full mt-6 bg-gradient-to-r from-[#555DE3] to-[#7B82F6] hover:from-[#454dc7] hover:to-[#686ee8] text-white py-4 rounded-xl text-base font-bold shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/35 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          onClick={onNext}
        >
          <span>Review and Validate Recognition</span>
          <Sparkles className="w-4 h-4 text-amber-300" />
        </button>
      </div>
    </div>
  );
}