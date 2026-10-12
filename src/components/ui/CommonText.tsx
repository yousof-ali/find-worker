import { cn } from "@/lib/utils";


type CommonTextProps = {
  children: React.ReactNode;
  className?: string;
};

export default function CommonText({
  children,
  className,
}: CommonTextProps) {
  return (
    <p
      className={cn(
        "text-sm leading-tight",
        className
      )}
    >
      {children}
    </p>
  );
}