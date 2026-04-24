import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  to?: string;
  className?: string;
  variant?: "ghost" | "outline" | "default";
}

export default function BackButton({ to, className, variant = "ghost" }: BackButtonProps) {
  const navigate = useNavigate();

  return (
    <Button
      variant={variant}
      size="icon"
      className={cn("rounded-full shrink-0", className)}
      onClick={() => to ? navigate(to) : navigate(-1)}
      aria-label="ফিরে যান"
      title="ফিরে যান"
    >
      <ArrowLeft className="h-5 w-5" />
    </Button>
  );
}
