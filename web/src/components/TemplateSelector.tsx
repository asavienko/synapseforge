"use client";

import { useState } from "react";
import { 
  Headphones, 
  Briefcase, 
  Calendar, 
  HelpCircle, 
  Target, 
  Settings,
  Check,
  ArrowRight
} from "lucide-react";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  headphones: Headphones,
  briefcase: Briefcase,
  calendar: Calendar,
  "help-circle": HelpCircle,
  target: Target,
  settings: Settings,
};

interface Template {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  suggestedChannels: string[];
  icon: string;
}

interface TemplateSelectorProps {
  templates: Template[];
  selected: string | null;
  onSelect: (templateId: string) => void;
  onContinue: () => void;
}

export function TemplateSelector({ 
  templates, 
  selected, 
  onSelect, 
  onContinue 
}: TemplateSelectorProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose a Template</h2>
        <p className="text-zinc-400">Start with a pre-configured agent or build your own</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => {
          const Icon = ICONS[template.icon] || Settings;
          const isSelected = selected === template.id;
          const isHovered = hovered === template.id;

          return (
            <button
              key={template.id}
              onClick={() => onSelect(template.id)}
              onMouseEnter={() => setHovered(template.id)}
              onMouseLeave={() => setHovered(null)}
              className={`relative text-left p-5 rounded-xl border transition-all duration-200 ${
                isSelected
                  ? "border-violet-500 bg-violet-500/10"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
              }`}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  isSelected || isHovered
                    ? "bg-violet-500/20"
                    : "bg-white/5"
                }`}>
                  <Icon className={`w-5 h-5 ${
                    isSelected || isHovered ? "text-violet-400" : "text-zinc-400"
                  }`} />
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{template.name}</h3>
                  <p className="text-sm text-zinc-500">{template.description}</p>

                  {template.suggestedChannels.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {template.suggestedChannels.map((channel) => (
                        <span
                          key={channel}
                          className="text-[10px] px-2 py-0.5 bg-white/5 rounded-full text-zinc-500 capitalize"
                        >
                          {channel}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="flex justify-end">
          <button
            onClick={onContinue}
            className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl font-medium transition-colors"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
