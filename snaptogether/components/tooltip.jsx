// components/tooltip.jsx
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import React from 'react';

// Provides context for tooltips (wrap your app or part of it)
const TooltipProvider = TooltipPrimitive.Provider;

// Groups the tooltip trigger and content together
const Tooltip = TooltipPrimitive.Root;

// The element that triggers the tooltip (e.g., a button or text)
const TooltipTrigger = TooltipPrimitive.Trigger;

// The content of the tooltip that appears on hover/focus
const TooltipContent = React.forwardRef(({ children, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      {...props}
      side="top"      // Positions tooltip above the trigger
      align="center"  // Centers tooltip horizontally
      className="tooltip-content"
      style={{
        backgroundColor: '#333',
        color: '#fff',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '14px',
      }}
    >
      {children}
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = 'TooltipContent';

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
