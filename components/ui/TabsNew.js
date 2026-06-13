"use client";

import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

const TabsNew = ({
  tabs = [],
  onTabChange,
  tabChange = () => {},
  initialTab,
  tabClick = () => {},
  gap = true,
  count = false,
  classNames = "",
  buttonClassname = "",
  parentClassName = "",
  tabContent = true,
  styleClass = false,
  borderRadius = "",
  activeTabCountColor = "bg-white/20 text-white",
  textColor = "text-foreground",
  countClassName = "",
}) => {
  const [activeTab, setActiveTab] = useState(initialTab || tabs[0]?.id);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleTabClick = (tab) => {
    setActiveTab(tab.id);
    tabClick(tab.value, tab.id);
    tabChange(tab.navValue);
    onTabChange?.(tab.id, tab);
  };

  return (
    <div
      className={twMerge(
        "flex flex-col",
        gap && "gap-6",
        styleClass ? "w-fit" : "w-full",
        parentClassName,
      )}
    >
      <div
        className={twMerge(
          "flex flex-wrap gap-2 rounded-md border border-border bg-card p-[5px]",
          classNames,
        )}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              data-tour={tab.dataTour}
              style={borderRadius ? { borderRadius } : undefined}
              onClick={() => handleTabClick(tab)}
              className={twMerge(
                "group relative h-8 overflow-hidden whitespace-nowrap rounded-md px-2.5 text-xs font-medium transition-colors 2xl:h-10 2xl:text-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                buttonClassname,
              )}
            >
              <span
                style={borderRadius ? { borderRadius } : undefined}
                className={twMerge(
                  "pointer-events-none absolute inset-0 z-10 bg-primary transition-opacity duration-300 ease-in-out",
                  isActive ? "opacity-100" : "opacity-0",
                )}
              />

              <span
                className={twMerge(
                  "relative z-20 flex items-center justify-center gap-2 transition-colors",
                  isActive
                    ? "text-primary-foreground"
                    : `${textColor} group-hover:text-primary`,
                )}
              >
                {tab.icon}
                {tab.title}
                {count && (
                  <span
                    className={twMerge(
                      "flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-[11px] font-semibold",
                      isActive
                        ? activeTabCountColor
                        : "bg-primary/10 text-primary",
                      countClassName,
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {tabContent && (
        <div className="tab-content">
          {tabs.map((tab) => {
            if (activeTab !== tab.id) return null;

            return (
              <div
                key={tab.id}
                className="tab-panel active flex flex-col gap-4 2xl:gap-6"
              >
                {tab.content}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TabsNew;
