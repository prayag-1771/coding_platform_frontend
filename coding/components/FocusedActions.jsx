export default function FocusActions({ onRun, onSubmit, disabled }) {
  return (
    <div
      className="absolute right-3 top-1/2 -translate-y-1/2 z-40
                 flex flex-col gap-2
                 bg-black/40 backdrop-blur-md
                 border border-white/10
                 rounded-full p-1"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onRun}
        disabled={disabled}
        title="Run"
        className="w-9 h-9 rounded-full
                   flex items-center justify-center
                   text-sm
                   hover:bg-white/10
                   disabled:opacity-40
                   disabled:cursor-not-allowed"
      >
        ▶
      </button>

      <button
        onClick={onSubmit}
        title="Submit"
        className="w-9 h-9 rounded-full
                   flex items-center justify-center
                   text-sm
                   hover:bg-white/10"
      >
        ✓
      </button>
    </div>
  );
}
