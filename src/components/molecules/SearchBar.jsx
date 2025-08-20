import { useState } from "react";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";

const SearchBar = ({ onSearch, placeholder = "Search...", className = "" }) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        icon="Search"
        className="flex-1"
      />
      <Button type="submit" icon="Search">
        Search
      </Button>
    </form>
  );
};

export default SearchBar;