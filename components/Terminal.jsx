export default function Terminal({ output, height }) {
  return (
    <div
      className="bg-zinc-900 font-mono text-sm text-gray-200 overflow-y-auto p-3 border-t border-white/10"
      style={{ height }}
    >
      <pre className="whitespace-pre-wrap">
        {output}
      </pre>
    </div>
  );
}
