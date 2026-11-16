import { Search } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export default function SearchInput({ value, onChange, placeholder }: Props) {
  return (
    <div className="relative flex-1">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint"
        size={18}
      />
      <input
        type="search"
        className="input pl-10"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder.replace(/\.{3}$/, "")}
      />
    </div>
  );
}
