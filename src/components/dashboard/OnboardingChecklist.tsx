"use client";
// src/components/dashboard/OnboardingChecklist.tsx
import { useState } from "react";
import Link from "next/link";
import { CheckCircle, Circle, ChevronDown, ChevronUp } from "lucide-react";

interface Step {
  key: string;
  title: string;
  desc: string;
  href: string;
  required: boolean;
}

interface Props {
  steps: Step[];
  onboarding: Record<string, unknown> | null;
  completed: number;
  total: number;
}

export default function OnboardingChecklist({ steps, onboarding, completed, total }: Props) {
  const [expanded, setExpanded] = useState(true);
  const pct = Math.round((completed / total) * 100);

  return (
    <div className="card border-[#00B4C8] border overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer bg-gradient-to-r from-[#E0F7FA] to-purple-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="text-sm font-semibold text-gray-800">
            🎓 Get Started with LeadFlow: {completed} of {total} completed
          </div>
          <div className="hidden sm:flex items-center gap-2 flex-1 min-w-[120px]">
            <div className="h-2 w-32 bg-white/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00B4C8] rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{pct}%</span>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </div>

      {expanded && (
        <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {steps.map((step) => {
            const done = onboarding?.[step.key] === true;
            return (
              <Link
                key={step.key}
                href={step.href}
                className={`flex flex-col gap-2 p-4 rounded-xl border transition-all cursor-pointer ${
                  done
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200 bg-white hover:border-[#00B4C8] hover:bg-[#E0F7FA]/30"
                }`}
              >
                {done ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300" />
                )}
                <div>
                  <div className={`text-sm font-medium ${done ? "text-green-700 line-through" : "text-gray-800"}`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{step.desc}</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
