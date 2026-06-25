"use client";

import { cn } from "@/lib/utils";
import { ReactNode, useEffect, useRef } from "react";

type SheetState = "closed" | "collapsed" | "half" | "full";

interface BottomSheetProps {
  open: boolean;
  state?: SheetState;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
}

const stateHeights: Record<Exclude<SheetState, "closed">, string> = {
  collapsed: "h-[88px]",
  half: "h-[45vh]",
  full: "h-[85vh]",
};

export function BottomSheet({
  open,
  state = "half",
  onClose,
  children,
  className,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:bg-black/30"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={sheetRef}
        className={cn(
          "fixed z-50 flex flex-col border border-border bg-surface shadow-2xl transition-all duration-300 ease-out",
          "inset-x-0 bottom-0 rounded-t-3xl",
          "lg:inset-y-0 lg:right-0 lg:left-auto lg:bottom-auto lg:h-full lg:w-[420px] lg:rounded-none lg:rounded-l-3xl lg:border-l lg:border-t-0",
          state !== "closed" && stateHeights[state],
          "lg:!h-full",
          className
        )}
      >
        <div className="flex justify-center pt-3 pb-2 lg:hidden">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-6 lg:px-6 lg:py-6">{children}</div>
      </div>
    </>
  );
}
