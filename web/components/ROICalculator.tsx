"use client";

import { useState, useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { Calculator, Clock, Users, DollarSign, ArrowRight, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

function SliderInput({
  icon: Icon,
  label,
  value,
  displayValue,
  min,
  max,
  step,
  marks,
  color,
  onChange,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  displayValue: string;
  min: number;
  max: number;
  step: number;
  marks: string[];
  color: string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <label className="text-sm text-gray-600 dark:text-white/60 flex items-center gap-2.5">
          <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="w-4 h-4" />
          </span>
          {label}
        </label>
        <span className="text-sm font-semibold tabular-nums text-gray-900 dark:text-white">
          {displayValue}
        </span>
      </div>
      <div className="relative">
        <div className="absolute top-1/2 left-0 right-0 h-1.5 -translate-y-1/2 rounded-full bg-gray-100 dark:bg-white/[0.06] pointer-events-none" />
        <div
          className="absolute top-1/2 left-0 h-1.5 -translate-y-1/2 rounded-full bg-blue-500 pointer-events-none transition-[width] duration-75"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="roi-slider relative w-full h-6 bg-transparent cursor-pointer z-10"
        />
      </div>
      <div className="flex justify-between text-[11px] text-gray-400 dark:text-white/30 mt-1 px-0.5">
        {marks.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </div>
  );
}

export function ROICalculator() {
  const t = useTranslations("roiCalculator");
  const [messagesPerDay, setMessagesPerDay] = useState(20);
  const [timePerMessage, setTimePerMessage] = useState(5);
  const [hourlyRate, setHourlyRate] = useState(25);
  const [showResults, setShowResults] = useState(true);

  const stats = useMemo(() => {
    const dailyHoursSaved = (messagesPerDay * timePerMessage) / 60;
    const monthlyHoursSaved = dailyHoursSaved * 22;
    const monthlyCostSaved = monthlyHoursSaved * hourlyRate;
    const synapseforgeCost = 49;
    const netMonthlySavings = Math.max(0, monthlyCostSaved - synapseforgeCost);
    const roi = synapseforgeCost > 0 ? Math.max(0, Math.round(((monthlyCostSaved - synapseforgeCost) / synapseforgeCost) * 100)) : 0;
    return { monthlyHoursSaved, monthlyCostSaved, netMonthlySavings, roi };
  }, [messagesPerDay, timePerMessage, hourlyRate]);

  const handleChange = (setter: (v: number) => void) => (v: number) => {
    setter(v);
    setShowResults(true);
  };

  return (
    <div className="rounded-2xl border border-gray-200/60 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold tracking-tight">{t("title")}</h3>
          <p className="text-[13px] text-gray-500 dark:text-white/45">{t("subtitle")}</p>
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-6">
        <SliderInput
          icon={Users}
          label={t("messagesLabel")}
          value={messagesPerDay}
          displayValue={String(messagesPerDay)}
          min={5}
          max={200}
          step={5}
          marks={["5", "100", "200+"]}
          color="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
          onChange={handleChange(setMessagesPerDay)}
        />
        <SliderInput
          icon={Clock}
          label={t("timeLabel")}
          value={timePerMessage}
          displayValue={`${timePerMessage} ${t("timeUnit")}`}
          min={1}
          max={15}
          step={1}
          marks={[`1 ${t("timeUnit")}`, `8 ${t("timeUnit")}`, `15 ${t("timeUnit")}`]}
          color="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          onChange={handleChange(setTimePerMessage)}
        />
        <SliderInput
          icon={DollarSign}
          label={t("rateLabel")}
          value={hourlyRate}
          displayValue={`$${hourlyRate}/hr`}
          min={15}
          max={100}
          step={5}
          marks={["$15", "$50", "$100"]}
          color="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
          onChange={handleChange(setHourlyRate)}
        />
      </div>

      {/* Results */}
      <div
        className={cn(
          "mt-8 pt-6 border-t border-gray-100 dark:border-white/[0.06] transition-all duration-500",
          showResults ? "opacity-100" : "opacity-50"
        )}
      >
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="text-center rounded-lg p-4 bg-blue-50/50 dark:bg-blue-500/[0.06] ring-1 ring-blue-100 dark:ring-blue-500/10">
            <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 tabular-nums">
              {Math.round(stats.monthlyHoursSaved)}h
            </div>
            <div className="text-[11px] font-medium text-gray-500 dark:text-white/45 mt-0.5">{t("hoursSaved")}</div>
          </div>
          <div className="text-center rounded-lg p-4 bg-emerald-50/50 dark:bg-emerald-500/[0.06] ring-1 ring-emerald-100 dark:ring-emerald-500/10">
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
              ${Math.round(stats.monthlyCostSaved).toLocaleString()}
            </div>
            <div className="text-[11px] font-medium text-gray-500 dark:text-white/45 mt-0.5">{t("monthlySavings")}</div>
          </div>
          <div className="text-center rounded-lg p-4 bg-amber-50/50 dark:bg-amber-500/[0.06] ring-1 ring-amber-100 dark:ring-amber-500/10">
            <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 tabular-nums flex items-center justify-center gap-1">
              <TrendingUp className="w-4 h-4" />
              {stats.roi.toLocaleString()}%
            </div>
            <div className="text-[11px] font-medium text-gray-500 dark:text-white/45 mt-0.5">{t("roiLabel")}</div>
          </div>
        </div>

        {/* Net savings */}
        <div className="flex items-center justify-between rounded-lg border border-blue-200 dark:border-blue-500/15 bg-blue-50/50 dark:bg-blue-500/[0.04] p-4 mb-5">
          <div>
            <div className="text-[12px] text-gray-500 dark:text-white/45">{t("netSavingsLabel")}</div>
            <div className="text-2xl font-extrabold text-gray-900 dark:text-white tabular-nums">
              ${Math.round(stats.netMonthlySavings).toLocaleString()}<span className="text-sm font-medium text-gray-400 dark:text-white/30">/mo</span>
            </div>
          </div>
          <div className="text-[11px] text-gray-500 dark:text-white/45 max-w-[200px] text-right leading-relaxed">
            {t("footnote")}
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/sign-up"
          className="flex items-center justify-center gap-2 w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-lg font-semibold text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm"
        >
          {t("cta")}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
