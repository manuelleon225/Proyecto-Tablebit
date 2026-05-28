import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

const Command = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-xl bg-popover text-popover-foreground",
      className
    )}
    {...props}
  />
));
Command.displayName = "Command";

const CommandInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <div className="flex items-center gap-2 border-b border-border/20 px-3 py-2.5">
    <Search className="h-4 w-4 shrink-0 text-muted-foreground/60" />
    <input
      ref={ref}
      className={cn(
        "flex h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/50 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  </div>
));
CommandInput.displayName = "CommandInput";

const CommandList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("max-h-60 overflow-y-auto overflow-x-hidden", className)}
    {...props}
  />
));
CommandList.displayName = "CommandList";

const CommandEmpty = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("py-6 text-center text-sm text-muted-foreground", className)}
    {...props}
  />
));
CommandEmpty.displayName = "CommandEmpty";

const CommandItem = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { onSelect?: () => void }
>(({ className, onSelect, onClick, children, ...props }, ref) => (
  <button
    ref={ref}
    onClick={(e) => {
      onSelect?.();
      onClick?.(e);
    }}
    className={cn(
      "relative flex w-full cursor-default items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm outline-none transition-colors hover:bg-muted/50 aria-selected:bg-muted/50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    {children}
  </button>
));
CommandItem.displayName = "CommandItem";

const CommandGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { heading?: string }
>(({ className, heading, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("overflow-hidden p-1 text-foreground", className)}
    {...props}
  >
    {heading && (
      <div className="px-2.5 py-1.5 text-xs font-medium text-muted-foreground/60">
        {heading}
      </div>
    )}
    {children}
  </div>
));
CommandGroup.displayName = "CommandGroup";

export { Command, CommandInput, CommandList, CommandEmpty, CommandItem, CommandGroup };
