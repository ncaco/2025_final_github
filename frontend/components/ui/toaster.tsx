"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/hooks/useToast"
import { CheckCircle2, AlertCircle, Info, AlertTriangle, Circle } from "lucide-react"

const getToastIcon = (variant?: string) => {
  switch (variant) {
    case "success":
      return <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
    case "destructive":
      return <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0" />
    case "info":
      return <Info className="h-5 w-5 text-blue-600 shrink-0" />
    default:
      return <Circle className="h-5 w-5 text-gray-400 shrink-0" />
  }
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {getToastIcon(variant)}
              <div className="flex-1 min-w-0 space-y-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

