"use client";

import { useState, useRef } from "react";

interface Props {
  label: string;
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export default function TagInput({ label, value, onChange, placeholder = "اكتب ثم اضغط Enter" }: Props) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function addTag() {
    const tag = input.trim();
    if (!tag || value.includes(tag)) return;
    onChange([...value, tag]);
    setInput("");
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === "،" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
    if (e.key === "Backspace" && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  }

  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-charcoal">{label}</label>
      <div
        className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 transition-colors focus-within:border-gold"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <span key={tag} className="flex items-center gap-1 rounded-full bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
            {tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
              className="mr-0.5 rounded-full p-0.5 transition-colors hover:bg-gold/20"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={value.length === 0 ? placeholder : ""}
          className="min-w-[100px] flex-1 border-none bg-transparent py-1 text-sm outline-none placeholder:text-warmgray/50"
        />
      </div>
      <p className="mt-1 text-[10px] text-warmgray">اضغط Enter بعد كل وسم لإضافته</p>
    </div>
  );
}
