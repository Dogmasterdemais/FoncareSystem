import React from "react";

export function Button({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="px-3 py-1 rounded bg-cyan-600 text-white font-medium hover:bg-cyan-700 transition"
      {...props}
    >
      {children}
    </button>
  );
}
