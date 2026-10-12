"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

type DropdownContextType = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const DropdownContext = createContext<DropdownContextType | null>(null);

function useDropdown() {
  const context = useContext(DropdownContext);

  if (!context) {
    throw new Error(
      "Dropdown components must be used inside <Dropdown />"
    );
  }

  return context;
}

type DropdownProps = {
  children: React.ReactNode;
  className?: string;
};

export function Dropdown({
  children,
  className,
}: DropdownProps) {
  const [open, setOpen] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div
        ref={ref}
        className={cn("relative inline-block", className)}
      >
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

type DropdownTriggerProps = {
  children: React.ReactNode;
  className?: string;
};

export function DropdownTrigger({
  children,
  className,
}: DropdownTriggerProps) {
  const { open, setOpen } = useDropdown();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => setOpen(!open)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setOpen(!open);
        }
      }}
      aria-expanded={open}
      className={cn("cursor-pointer", className)}
    >
      {children}
    </div>
  );
}

type DropdownContentProps = {
  children: React.ReactNode;
  className?: string;
};

export function DropdownContent({
  children,
  className,
}: DropdownContentProps) {
  const { open } = useDropdown();

  if (!open) return null;

  return (
    <div
      className={cn(
        "absolute right-0 top-full z-50 mt-2 min-w-48 rounded-lg border border-[#1a181825] bg-gray-100 p-2 shadow-md",
        className
      )}
    >
      {children}
    </div>
  );
}