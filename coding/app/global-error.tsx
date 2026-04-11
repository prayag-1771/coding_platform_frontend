"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <main className="min-h-screen flex items-center justify-center px-6">
          <section className="w-full max-w-xl rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <h1 className="text-2xl font-semibold text-red-800">
              Unexpected application error
            </h1>
            <p className="mt-2 text-red-700">
              Please refresh or try again in a moment.
            </p>
            <button
              type="button"
              onClick={() => reset()}
              className="mt-4 rounded-md bg-red-700 px-4 py-2 text-white hover:bg-red-800"
            >
              Retry
            </button>
            <p className="mt-3 text-xs text-red-600">
              {error?.digest ? `Error ID: ${error.digest}` : ""}
            </p>
          </section>
        </main>
      </body>
    </html>
  );
}
