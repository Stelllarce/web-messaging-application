import React from "react"

type SearchInputType = {
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

const SearchInput: React.FC<SearchInputType> = ({ searchQuery, onSearchChange }) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onSearchChange(event.target.value)
    }

    return (
        <input
          type="text"
          placeholder="Search messages..."
          value={searchQuery}
          onChange={handleChange}
        />
      );
}

export default SearchInput;