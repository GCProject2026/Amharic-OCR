"use client";

import * as React from "react";
import { GripVerticalIcon } from "lucide-react";
import { Group, Panel, type GroupProps, type PanelProps } from "react-resizable-panels";

import { cn } from "./utils";

function ResizablePanelGroup({
  className,
  ...props
}: GroupProps & { className?: string }) {
  return (
    <Group
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
        className
      )}
      {...props}
    />
  );
}

function ResizablePanel(props: PanelProps) {
  return <Panel data-slot="resizable-panel" {...props} />;
}

/**
 * Fallback handle that compiles with any react-resizable-panels version.
 * (This is a visual divider. If you need drag-to-resize behavior, install a newer version
 * and switch to PanelResizeHandle / ResizeHandle depending on exports.)
 */
function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  withHandle?: boolean;
}) {
  return (
    <div
      data-slot="resizable-handle"
      role="separator"
      aria-orientation="vertical"
      className={cn(
        "bg-border relative flex w-px items-center justify-center " +
          "after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 " +
          "focus-visible:ring-ring focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-offset-1 " +
          "data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full " +
          "data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 " +
          "data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 " +
          "data-[panel-group-direction=vertical]:after:translate-x-0 " +
          "[&[data-panel-group-direction=vertical]>div]:rotate-90",
        className
      )}
      tabIndex={0}
      {...props}
    >
      {withHandle && (
        <div className="bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border">
          <GripVerticalIcon className="size-2.5" />
        </div>
      )}
    </div>
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
