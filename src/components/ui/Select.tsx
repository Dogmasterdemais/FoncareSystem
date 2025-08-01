import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

const Select = ({ 
  value: controlledValue, 
  defaultValue, 
  onValueChange, 
  children, 
  className 
}: SelectProps) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "");
  const [open, setOpen] = React.useState(false);
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  
  const handleValueChange = React.useCallback((newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
    setOpen(false);
  }, [controlledValue, onValueChange]);

  return (
    <SelectContext.Provider value={{ value, onValueChange: handleValueChange, open, setOpen }}>
      <div className={cn("relative", className)}>
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("SelectTrigger must be used within a Select component");
  }

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={() => context.setOpen(!context.open)}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & { placeholder?: string }
>(({ className, placeholder, ...props }, ref) => {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("SelectValue must be used within a Select component");
  }

  return (
    <span
      ref={ref}
      className={cn("block truncate", className)}
      {...props}
    >
      {context.value || placeholder}
    </span>
  );
});
SelectValue.displayName = "SelectValue";

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("SelectContent must be used within a Select component");
  }

  if (!context.open) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn(
        "absolute top-full z-50 w-full rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SelectContent.displayName = "SelectContent";

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, value, ...props }, ref) => {
    const context = React.useContext(SelectContext);
    if (!context) {
      throw new Error("SelectItem must be used within a Select component");
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          className
        )}
        onClick={() => context.onValueChange(value)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SelectItem.displayName = "SelectItem";

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
