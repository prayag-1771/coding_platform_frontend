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
                   hover:bg-white/10
                   disabled:opacity-40
                   disabled:cursor-not-allowed"
      >
        <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1.5V14.5L13 8L1 1.5Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
      </button>

      <button
        onClick={onSubmit}
        title="Submit"
        className="w-9 h-9 rounded-full
                   flex items-center justify-center
                   hover:bg-white/10"
      >
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 6L6 11L15 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}
