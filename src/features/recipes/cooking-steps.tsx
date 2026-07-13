"use client";

import { useEffect, useState } from "react";

type CookingStepsProps = {
  steps: string[];
  recipeId: string;
};

export default function CookingSteps({ steps, recipeId }: CookingStepsProps) {
  const [stepMode, setStepMode] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [progressReady, setProgressReady] = useState(false);
  const progressKey = `marytaste:recipe-progress:${recipeId}:cooking`;

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(progressKey) || "null");
      if (saved && typeof saved.activeStep === "number") {
        setActiveStep(Math.max(0, Math.min(steps.length - 1, saved.activeStep)));
        setStepMode(saved.activeStep > 0 && saved.activeStep < steps.length);
      }
    } catch {
      // Ignore damaged local progress and start from the first step.
    }
    setProgressReady(true);
  }, [progressKey, steps.length]);

  useEffect(() => {
    if (!progressReady) return;
    localStorage.setItem(progressKey, JSON.stringify({ activeStep }));
  }, [activeStep, progressKey, progressReady]);

  if (!steps.length) return null;

  function openStepMode() {
    setActiveStep(0);
    setStepMode(true);
  }

  return (
    <section className="rounded-3xl border border-[#E5DFE9] bg-[#FFFDFF] p-7 md:p-9">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-serif text-3xl">Приготування</h2>
        <button
          type="button"
          onClick={() => (stepMode ? setStepMode(false) : openStepMode())}
          className="print-hidden rounded-xl bg-[#F0EBF3] px-4 py-2.5 text-sm font-bold text-[#756A8A] transition hover:bg-[#E7DFEB] active:translate-y-px"
        >
          {stepMode ? "Показати всі кроки" : "Готувати покроково"}
        </button>
      </div>

      <div className="print-hidden">
        {stepMode ? (
          <div className="mt-7">
            <div className="flex items-center justify-between gap-4 text-xs font-bold uppercase tracking-[.14em] text-[#847D89]">
              <span>
                Крок {activeStep + 1} з {steps.length}
              </span>
              <span>{Math.round(((activeStep + 1) / steps.length) * 100)}%</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#EEE9F0]">
              <div
                className="h-full rounded-full bg-[#756A8A] transition-[width] duration-300"
                style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
              />
            </div>
            <div className="mt-8 min-h-52 rounded-2xl bg-[#F7F4F8] p-6 md:p-8">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[#756A8A] text-sm font-bold text-white">
                {activeStep + 1}
              </span>
              <p className="mt-5 text-lg leading-8 text-[#504A55]">
                {steps[activeStep]}
              </p>
            </div>
            <div className="mt-5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setActiveStep((current) => current - 1)}
                disabled={activeStep === 0}
                className="rounded-xl border border-[#D8D0DC] px-4 py-3 text-sm font-bold text-[#756A8A] transition hover:bg-[#F7F4F8] disabled:cursor-not-allowed disabled:opacity-35"
              >
                ← Назад
              </button>
              {activeStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setActiveStep((current) => current + 1)}
                  className="rounded-xl bg-[#756A8A] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#665C78] active:translate-y-px"
                >
                  Далі →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStepMode(false)}
                  className="rounded-xl bg-[#756A8A] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#665C78] active:translate-y-px"
                >
                  Готово ✓
                </button>
              )}
            </div>
          </div>
        ) : (
          <StepList steps={steps} />
        )}
      </div>
      <div className="print-only">
        <StepList steps={steps} />
      </div>
    </section>
  );
}

function StepList({ steps }: Pick<CookingStepsProps, "steps">) {
  return (
    <ol className="mt-7 space-y-7">
      {steps.map((step, index) => (
        <li key={`${step}-${index}`} className="flex gap-5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#756A8A] text-sm font-bold text-white">
            {index + 1}
          </span>
          <p className="pt-1 leading-7 text-[#655F69]">{step}</p>
        </li>
      ))}
    </ol>
  );
}
