'use client';

import { Search, X, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

export interface FilterState {
  q: string;
  department: string;
  category: string;
  city: string;
  state: string;
  status: string;
}

export const EMPTY_FILTERS: FilterState = {
  q: '',
  department: 'all',
  category: 'all',
  city: 'all',
  state: 'all',
  status: 'all',
};

export default function FilterBar({
  filters,
  onChange,
  options,
  resultCount,
}: {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  options: {
    departments: string[];
    categories: string[];
    cities: string[];
    states: string[];
  };
  resultCount: number;
}) {
  const [expanded, setExpanded] = useState(false);

  const activeCount = Object.entries(filters).filter(
    ([k, v]) => k !== 'q' && v !== 'all'
  ).length;

  const set = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch });

  return (
    <div className="bg-white/70 backdrop-blur-sm border border-ink-100 rounded-xl shadow-card p-3 sm:p-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300"
          />
          <input
            value={filters.q}
            onChange={(e) => set({ q: e.target.value })}
            placeholder="Search by name, designation, department, phone, email, ID..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white border border-ink-100 text-sm text-ink-800 placeholder:text-ink-300 focus-visible:outline-none focus-visible:border-brass-400 focus-visible:ring-1 focus-visible:ring-brass-300"
          />
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
            expanded || activeCount > 0
              ? 'bg-ink-900 text-paper border-ink-900'
              : 'bg-white text-ink-600 border-ink-100 hover:border-brass-400'
          }`}
        >
          <SlidersHorizontal size={15} />
          <span className="hidden sm:inline">Filters</span>
          {activeCount > 0 && (
            <span className="bg-brass-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-dashed border-ink-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          <Select
            label="Department"
            value={filters.department}
            onChange={(v) => set({ department: v })}
            options={options.departments}
          />
          <Select
            label="Category"
            value={filters.category}
            onChange={(v) => set({ category: v })}
            options={options.categories}
          />
          <Select
            label="City"
            value={filters.city}
            onChange={(v) => set({ city: v })}
            options={options.cities}
          />
          <Select
            label="State"
            value={filters.state}
            onChange={(v) => set({ state: v })}
            options={options.states}
          />
          <Select
            label="Status"
            value={filters.status}
            onChange={(v) => set({ status: v })}
            options={['active', 'inactive']}
          />
        </div>
      )}

      <div className="flex items-center justify-between mt-3 px-0.5">
        <p className="text-xs text-ink-400">
          <span className="font-semibold text-ink-600">{resultCount}</span> official
          {resultCount === 1 ? '' : 's'} found
        </p>
        {(activeCount > 0 || filters.q) && (
          <button
            onClick={() => onChange(EMPTY_FILTERS)}
            className="flex items-center gap-1 text-xs text-ink-400 hover:text-brass-700"
          >
            <X size={12} /> Clear all
          </button>
        )}
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-wide text-ink-400 mb-1 pl-0.5">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-xs sm:text-sm px-2 py-2 rounded-lg bg-white border border-ink-100 text-ink-700 focus-visible:outline-none focus-visible:border-brass-400"
      >
        <option value="all">All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
