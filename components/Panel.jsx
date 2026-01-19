import { useRef } from "react";

export default function Panel({ children, onClick }) {
  const ref = useRef(null);

  return (
    <div
      ref={ref}
      onClick={onClick}
      className="
        relative
        bg-white/5
        backdrop-blur-xl
        border border-white/10
        rounded-2xl
        shadow-2xl
        transition-transform
        will-change-transform
      "
    >
      {children}
    </div>
  );
}
