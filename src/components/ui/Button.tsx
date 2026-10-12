import { cn } from "@/lib/utils";
import { LuLoaderCircle } from "react-icons/lu";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";

type ButtonSize = "sm" | "md" | "lg";


interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingText?:string;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-black text-white hover:bg-gray-800",

  secondary:
    "bg-gray-700 text-white hover:bg-gray-800",

  outline:
    "border border-black bg-transparent text-black hover:bg-black hover:text-white",

  ghost:
    "bg-transparent text-black hover:bg-gray-300",

  danger:
    "bg-red-500 text-white hover:bg-red-600",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "py-2 px-3 text-sm",
  md: "py-2.5 px-4 text-sm",
  lg: "py-3 px-6 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded font-medium transition-colors cursor-pointer",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {loading && (
        <LuLoaderCircle className="animate-spin"/>
      )}

      {children}
    </button>
  );
}