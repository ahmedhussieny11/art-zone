"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

interface Category {
  value: string;
  label: string;
}

export default function PortfolioFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("cat") || "";
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((s) => {
        if (s.projectCategories?.length) setCategories(s.projectCategories);
        else setCategories([
          { value: "residential", label: "سكني" },
          { value: "commercial", label: "تجاري" },
          { value: "classic", label: "كلاسيكي" },
          { value: "modern", label: "عصري" },
        ]);
      })
      .catch(() => {});
  }, []);

  const handleFilter = (category: string) => {
    const params = new URLSearchParams();
    if (category) params.set("cat", category);
    router.push(`/portfolio${params.toString() ? `?${params}` : ""}`, {
      scroll: false,
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
      <button
        onClick={() => handleFilter("")}
        className={`relative px-5 py-2.5 text-xs font-medium tracking-widest transition-colors ${
          activeCategory === "" ? "text-gold" : "text-warmgray hover:text-charcoal"
        }`}
      >
        الكل
        {activeCategory === "" && (
          <motion.div
            layoutId="activeFilter"
            className="absolute inset-x-0 bottom-0 h-0.5 bg-gold"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </button>
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => handleFilter(cat.value)}
          className={`relative px-5 py-2.5 text-xs font-medium tracking-widest transition-colors ${
            activeCategory === cat.value ? "text-gold" : "text-warmgray hover:text-charcoal"
          }`}
        >
          {cat.label}
          {activeCategory === cat.value && (
            <motion.div
              layoutId="activeFilter"
              className="absolute inset-x-0 bottom-0 h-0.5 bg-gold"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
