import type React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`flex w-full rounded-lg border border-[#A6ACA6] bg-white text-black px-3 py-2 text-sm placeholder:text-[#CFD7CF] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}
