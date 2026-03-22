"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Calculator, Clock, Users, DollarSign, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function ROICalculator() {
  const [messagesPerDay, setMessagesPerDay] = useState(20);
  const [timePerMessage, setTimePerMessage] = useState(5);
  const [hourlyRate, setHourlyRate] = useState(25);
  const [showResults, setShowResults] = useState(false);

  // Calculate savings
  const dailyHoursSaved = (messagesPerDay * timePerMessage) / 60;
  const monthlyHoursSaved = dailyHoursSaved * 22;
  const monthlyCostSaved = monthlyHoursSaved * hourlyRate;
  const yearlySavings = monthlyCostSaved * 12;

  // SynapseForge cost (Pro plan)
  const synapseforgeCost = 89;
  const netMonthlySavings = monthlyCostSaved - synapseforgeCost;
  const roi = (netMonthlySavings / synapseforgeCost) * 100;

  return (
    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
          <Calculator className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Calculate Your Savings</h3>
          <p className="text-sm text-zinc-500">See how much time and money you could save</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Messages per day */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-zinc-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-zinc-500" />
              Customer messages per day
            </label>
            <span className="text-sm font-medium text-white">{messagesPerDay}</span>
          </div>
          <input
            type="range"
            min="5"
            max="200"
            step="5"
            value={messagesPerDay}
            onChange={(e) => {
              setMessagesPerDay(Number(e.target.value));
              setShowResults(true);
            }}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-violet-500"
          />
          <div className="flex justify-between text-xs text-zinc-600 mt-1">
            <span>5</span>
            <span>100</span>
            <span>200+</span>
          </div>
        </div>

        {/* Time per message */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-zinc-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-500" />
              Minutes to respond per message
            </label>
            <span className="text-sm font-medium text-white">{timePerMessage} min</span>
          </div>
          <input
            type="range"
            min="1"
            max="15"
            step="1"
            value={timePerMessage}
            onChange={(e) => {
              setTimePerMessage(Number(e.target.value));
              setShowResults(true);
            }}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-violet-500"
          />
          <div className="flex justify-between text-xs text-zinc-600 mt-1">
            <span>1 min</span>
            <span>8 min</span>
            <span>15 min</span>
          </div>
        </div>

        {/* Hourly rate */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-zinc-300 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-zinc-500" />
              Staff hourly rate (€/$)
            </label>
            <span className="text-sm font-medium text-white">${hourlyRate}/hr</span>
          </div>
          <input
            type="range"
            min="15"
            max="100"
            step="5"
            value={hourlyRate}
            onChange={(e) => {
              setHourlyRate(Number(e.target.value));
              setShowResults(true);
            }}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-violet-500"
          />
          <div className="flex justify-between text-xs text-zinc-600 mt-1">
            <span>$15</span>
            <span>$50</span>
            <span>$100</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div
        className={cn(
          "mt-8 pt-6 border-t border-white/10 transition-all duration-500",
          showResults ? "opacity-100" : "opacity-50"
        )}
      >
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-2xl font-bold text-emerald-400">
              {Math.round(monthlyHoursSaved)}h
            </div>
            <div className="text-xs text-zinc-500">Hours saved per month</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-2xl font-bold text-emerald-400">
              ${Math.round(monthlyCostSaved).toLocaleString()}
            </div>
            <div className="text-xs text-zinc-500">Monthly cost savings</div>
          </div>
        </div>

        <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-violet-300 mb-1">Net savings with SynapseForge</div>
              <div className="text-3xl font-bold text-white">
                ${Math.round(netMonthlySavings).toLocaleString()}/mo
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-violet-300 mb-1">ROI</div>
              <div className="text-3xl font-bold text-emerald-400">
                {Math.round(roi)}%
              </div>
            </div>
          </div>
          <div className="text-xs text-zinc-500 mt-2">
            Based on Pro plan ($89/mo) vs. handling messages manually
          </div>
        </div>

        <Link
          href="/sign-up"
          className="flex items-center justify-center gap-2 w-full bg-violet-600 hover:bg-violet-500 transition-colors py-3 rounded-xl font-semibold text-white"
        >
          Start Saving Time
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
