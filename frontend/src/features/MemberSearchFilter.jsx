import React from 'react';
import { Search } from 'lucide-react';

const MemberSearchFilter = ({ searchQuery, onSearchChange, roleFilter, onRoleFilterChange }) => (
  <div className="flex items-center gap-3 mb-4 flex-wrap">
    <div className="flex items-center gap-2 px-4 py-2.5 bg-foreground/5 border border-border rounded-xl flex-1 min-w-[200px]">
      <Search size={18} className="text-foreground/40" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search by member name..."
        className="bg-transparent text-sm text-foreground placeholder:text-foreground/40 focus:outline-none flex-grow"
      />
    </div>
    <div className="flex gap-2">
      {['all', 'faculty', 'student'].map((role) => (
        <button
          key={role}
          onClick={() => onRoleFilterChange(role)}
          className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all capitalize ${
            roleFilter === role
              ? 'bg-primary text-white border-primary'
              : 'bg-foreground/5 border-border text-foreground/70'
          }`}
        >
          {role}
        </button>
      ))}
    </div>
  </div>
);

export default MemberSearchFilter;
