"use client";

import * as React from "react";
import { useToast, toast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import {
  CircleCheck,
  CircleX,
  Info,
  Loader2,
  TriangleAlert,
} from "lucide-react";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider swipeDirection="right">
      {toasts.map(function ({ id, title, description, action, variant = "default", icon, ...props }) {
        let statusIcon = icon;
        if (statusIcon === undefined) {
          if (variant === "destructive" || variant === "error") {
            statusIcon = (
              <CircleX
                className="size-4.5 shrink-0 text-destructive mt-0.5"
                aria-hidden="true"
              />
            );
          } else if (variant === "success") {
            statusIcon = (
              <CircleCheck
                className="size-4.5 shrink-0 text-accept mt-0.5"
                aria-hidden="true"
              />
            );
          } else if (variant === "warning") {
            statusIcon = (
              <TriangleAlert
                className="size-4.5 shrink-0 text-chart-3 mt-0.5"
                aria-hidden="true"
              />
            );
          } else if (variant === "info") {
            statusIcon = (
              <Info
                className="size-4.5 shrink-0 text-primary mt-0.5"
                aria-hidden="true"
              />
            );
          } else if (variant === "loading") {
            statusIcon = (
              <Loader2
                className="size-4.5 shrink-0 text-muted-foreground animate-spin mt-0.5"
                aria-hidden="true"
              />
            );
          }
        }

        return (
          <Toast key={id} variant={variant} {...props}>
            <div
              data-radix-toast-announce-exclude=""
              className="flex items-start gap-3 flex-1 min-w-0"
            >
              {statusIcon}
              <div className="grid flex-1 gap-1 min-w-0">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport aria-label="Notifications" />
    </ToastProvider>
  );
}

export { useToast, toast };
