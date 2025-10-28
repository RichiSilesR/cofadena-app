"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

// Extiende las props para aceptar indicatorClassName
interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, indicatorClassName, ...props }, ref) => ( // <-- FIX: indicatorClassName está separado de ...props
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props} // Solo las props válidas para el DOM se pasan aquí
  >
    <ProgressPrimitive.Indicator
      className={cn(
        "h-full w-full flex-1 transition-transform duration-500 ease-in-out",
        "bg-primary", 
        indicatorClassName // <-- Se aplica correctamente al indicador
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }