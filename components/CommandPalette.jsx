import { useEffect, useState } from "react";

export default function CommandPalette({
  open,
  onClose,
  commands
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!open) return;
    setActive(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onKey(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive(v => Math.min(v + 1, commands.length - 1));
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive(v => Math.max(v - 1, 0));
      }

      if (e.key === "Enter") {
        e.preventDefault();
        commands[active]?.action();
        onClose();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, active, commands, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-32"
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-[420px]
                   bg-[#0b0e14]
                   border border-white/10
                   rounded-xl
                   shadow-2xl
                   overflow-hidden"
      >
        <div className="px-4 py-3 text-sm text-white/60 border-b border-white/10">
          Command Palette
        </div>

        <div className="max-h-[300px] overflow-y-auto">
          {commands.map((cmd, i) => (
            <div
              key={cmd.id}
              className={`px-4 py-2 text-sm cursor-pointer
                ${i === active ? "bg-white/10" : "hover:bg-white/5"}
              `}
              onMouseEnter={() => setActive(i)}
              onClick={() => {
                cmd.action();
                onClose();
              }}
            >
              {cmd.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
