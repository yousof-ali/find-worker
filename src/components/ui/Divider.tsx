import { cn } from "@/lib/utils";
import CommonText from "./CommonText";

interface DividerProps {
  text?: string;
  className?: string;
}

export default function Divider({ text, className }: DividerProps) {
  return (
    <div className={cn("flex w-full items-center gap-3", className)}>
      <div className="h-px flex-1 bg-border" />

      {text && (
        <>
          <CommonText>{text}</CommonText>

          <div className="h-px flex-1 bg-border" />
        </>
      )}
    </div>
  );
}