"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled route error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="w-full max-w-xl rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <h2 className="text-2xl font-semibold text-red-800">
          Something went wrong
        </h2>
        <p className="mt-2 text-red-700">
          We could not load this page. Please try again.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-4 rounded-md bg-red-700 px-4 py-2 text-white hover:bg-red-800"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
