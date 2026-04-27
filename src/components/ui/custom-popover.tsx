"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface CustomPopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
}

export function CustomPopover({ trigger, children, align = "left", className }: CustomPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative inline-block", className)} ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer"
      >
        {trigger}
      </div>

      {isOpen && (
        <div 
          className={cn(
            "absolute z-[100] mt-2 min-w-[280px] overflow-hidden rounded-xl border border-border bg-popover p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-100",
            align === "left" && "left-0",
            align === "right" && "right-0",
            align === "center" && "left-1/2 -translate-x-1/2"
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}
