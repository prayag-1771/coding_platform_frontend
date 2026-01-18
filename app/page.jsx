"use client";

export default function EditorPage() {
  return (
    <div className="h-screen bg-[#05060f] text-white flex">
      
      {/* LEFT: Problem */}
      <div className="w-1/2 border-r border-white/10 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">
          Two Sum
        </h1>

        <p className="text-gray-300 mb-4">
          Given an array of integers nums and an integer target, return
          indices of the two numbers such that they add up to target.
        </p>

        <h2 className="font-semibold mt-6 mb-2">Example</h2>
        <pre className="bg-black/30 p-4 rounded-xl text-sm">
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
        </pre>

        <h2 className="font-semibold mt-6 mb-2">Constraints</h2>
        <ul className="text-gray-400 list-disc ml-6 text-sm">
          <li>2 ≤ nums.length ≤ 10⁴</li>
          <li>-10⁹ ≤ nums[i] ≤ 10⁹</li>
        </ul>
      </div>

      {/* RIGHT: Editor */}
      <div className="w-1/2 p-6 flex flex-col">
        
        {/* Editor Header */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-400">
            JavaScript
          </span>

          <div className="space-x-3">
            <button className="px-4 py-2 rounded-lg bg-white/10">
              Run
            </button>
            <button className="px-4 py-2 rounded-lg bg-green-500 text-black font-semibold">
              Submit
            </button>
          </div>
        </div>

        {/* Editor Area (Placeholder) */}
        <textarea
          className="flex-1 bg-black/40 rounded-xl p-4 font-mono text-sm outline-none resize-none"
          placeholder="// write your code here"
        />

      </div>
    </div>
  );
}
