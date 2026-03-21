import React from "react";

interface Tab {
  label: string;
  value: string;
}

interface FilterTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (value: string) => void;
}

const FilterTabs: React.FC<FilterTabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex flex-wrap gap-3">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={`
              px-6 py-2.5 rounded-full text-sm font-medium transition-all
              ${
                isActive
                  ? "bg-primary text-black font-bold shadow-md shadow-primary/40"
                  : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
              }
            `}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default FilterTabs;
