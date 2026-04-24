import { ReactNode } from "react";
import BackButton from "./BackButton";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  children?: ReactNode;
  backTo?: string;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  icon: Icon,
  iconBgColor = "bg-primary/10",
  iconColor = "text-primary",
  children,
  backTo = "/",
  className
}: PageHeaderProps) {
  return (
    <div className={cn("p-6 sm:p-8 border-b border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-4", className)}>
      <div className="flex items-center gap-4">
        <BackButton to={backTo} className={cn("hover:", iconBgColor.replace('bg-', 'hover:bg-'))} />
        <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm", iconBgColor)}>
          <Icon className={cn("h-6 w-6", iconColor)} />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground font-medium mt-1">{subtitle}</p>}
        </div>
      </div>
      
      {children && (
        <div className="flex items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
}
