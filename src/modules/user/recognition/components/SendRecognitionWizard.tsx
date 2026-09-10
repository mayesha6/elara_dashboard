"use client";
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sendRecognitionSchema, SendRecognitionFormValues } from "../validation/recognition.schema";
import SelectUser from "./SelectUser";
import Configuration from "./Configuration";
import Preview from "./Preview";
import { UserCheck, SlidersHorizontal, Sparkles, Check } from "lucide-react";

export default function SendRecognitionWizard({ prefilledUser, onClose }: any) {
  const [step, setStep] = useState(prefilledUser ? 2 : 1);
  const methods = useForm<SendRecognitionFormValues>({
    resolver: zodResolver(sendRecognitionSchema),
    defaultValues: {
      recipientId: prefilledUser?._id || prefilledUser?.id || "",
      receiverEmail: prefilledUser?.email || "",
      departmentId: prefilledUser?.departmentId || prefilledUser?.department || "",
      recipientName: prefilledUser?.name || "",
      department: prefilledUser?.department || prefilledUser?.departmentName || "",
      categoryId: "",
      toneId: "",
      valueIds: [],
      points: 100,
      imageId: "",
      userPrompt: ""
    }
  });

  const handleStepChange = async (targetStep: number) => {
    if (targetStep > 1) {
      const isValid = await methods.trigger(["recipientId", "recipientName", "receiverEmail"]);
      if (!isValid) return;
    }
    setStep(targetStep);
  };

  const steps = [
    { number: 1, label: "Select Recipient", icon: UserCheck },
    { number: 2, label: "Configure Details", icon: SlidersHorizontal },
    { number: 4, label: "Review & Send", icon: Sparkles },
  ];

  return (
    <FormProvider {...methods}>
      <div className="w-full space-y-8">
        {/* Step Progress Indicator Header */}
        <div className="py-3 w-full bg-white/60 backdrop-blur-md rounded-2xl border border-slate-100 shadow-xs mb-8">
          <div className="flex items-center justify-between max-w-3xl mx-auto relative px-6">
            {/* Connecting Progress Line */}
            <div className="absolute top-5 left-16 right-16 h-[3px] bg-slate-100 -z-0 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#00C985] via-teal-400 to-[#555DE3] transition-all duration-500 ease-out"
                style={{ 
                  width: step === 1 ? "0%" : step === 2 ? "50%" : "100%" 
                }}
              />
            </div>

            {steps.map((s) => {
              const Icon = s.icon;
              const isCompleted = (s.number === 1 && step > 1) || (s.number === 2 && step > 2);
              const isActive = step === s.number;

              return (
                <div 
                  key={s.number} 
                  className="flex flex-col items-center gap-2 relative z-10 cursor-pointer group"
                  onClick={() => {
                    if (s.number <= step || s.number === step + 1) {
                      handleStepChange(s.number);
                    }
                  }}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      isCompleted
                        ? "bg-[#00C985] text-white shadow-md shadow-emerald-500/20 ring-4 ring-emerald-50 scale-100"
                        : isActive
                        ? "bg-[#555DE3] text-white shadow-lg shadow-indigo-500/25 ring-4 ring-indigo-100 scale-105"
                        : "bg-white border-2 border-slate-200 text-slate-400 group-hover:border-indigo-300 group-hover:text-indigo-500"
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5 stroke-[3]" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span
                    className={`text-xs font-semibold whitespace-nowrap transition-colors ${
                      isActive ? "text-[#555DE3] font-bold" : isCompleted ? "text-slate-700" : "text-slate-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wizard Step Views */}
        {step === 1 && <SelectUser prefilledUser={prefilledUser} onContinue={() => setStep(2)} onClose={onClose} />}
        {step === 2 && <Configuration onNext={() => setStep(4)} onBack={() => setStep(1)} />}
        {step === 4 && <Preview onBack={() => setStep(2)} onClose={onClose} />}
      </div>
    </FormProvider>
  );
}