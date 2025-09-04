import { toast as notify, type ToastOptions } from "react-toastify";

type ToastVariant = "default" | "destructive" | "success" | "info" | "warning";

export type ToastParams = {
  title?: string;
  description?: string;
  duration?: number;
  variant?: ToastVariant;
  options?: ToastOptions;
};

export const useToast = () => {
  const toast = ({
    title,
    description,
    duration,
    variant,
    options,
  }: ToastParams) => {
    const message = [title, description].filter(Boolean).join(" — ");
    const base: ToastOptions = {
      autoClose: duration ?? 5000,
      ...options,
    };

    switch (variant) {
      case "destructive":
        notify.error(message || "", base);
        break;
      case "success":
        notify.success(message || "", base);
        break;
      case "info":
        notify.info(message || "", base);
        break;
      case "warning":
        notify.warning(message || "", base);
        break;
      default:
        notify(message || "", base);
    }
  };

  return { toast };
};

export type UseToastReturn = ReturnType<typeof useToast>;
