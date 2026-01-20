"use client";

import type { ReactNode } from "react";

type CategoryTab = {
  label: string;
  value: string;
  icon?: ReactNode;
};

type Accent = "green" | "blue" | "emerald";

type CategoryTabsProps<Value extends string = string> = {
  categories: ReadonlyArray<CategoryTab>;
  activeValue: Value;
  onChange: (value: Value) => void;
  accent?: Accent;
  className?: string;
  scrollable?: boolean;
};

const ACTIVE_STYLES: Record<Accent, string> = {
  green: "bg-green-600 text-white shadow",
  blue: "bg-blue-600 text-white shadow",
  emerald: "bg-emerald-600 text-white shadow",
};

const INACTIVE_STYLES: Record<Accent, string> = {
  green: "bg-white text-gray-700 shadow-sm hover:bg-green-50",
  blue: "bg-white text-gray-700 shadow-sm hover:bg-blue-50",
  emerald: "bg-white text-gray-700 shadow-sm hover:bg-emerald-50",
};

export default function CategoryTabs<Value extends string = string>({
  categories,
  activeValue,
  onChange,
  accent = "green",
  className = "",
  scrollable = true,
}: CategoryTabsProps<Value>) {
  return (
    <div
      className={`flex flex-wrap gap-2 ${
        scrollable ? "overflow-x-auto pb-2" : ""
      } ${className}`}
    >
      {categories.map((category) => {
        const isActive = category.value === activeValue;
        return (
          <button
            key={category.value}
            type="button"
            onClick={() => onChange(category.value as Value)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
              isActive ? ACTIVE_STYLES[accent] : INACTIVE_STYLES[accent]
            }`}
          >
            {category.icon && <span className="text-base">{category.icon}</span>}
            <span>{category.label}</span>
          </button>
        );
      })}
    </div>
  );
}

