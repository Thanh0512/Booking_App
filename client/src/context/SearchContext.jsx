import { createContext, useContext, useState } from 'react';

const SearchContext = createContext();

export const useSearch = () => useContext(SearchContext);

export const SearchProvider = ({ children }) => {
  const [searchData, setSearchData] = useState(null);

  const updateSearch = (data) => {
    setSearchData(data);
  };

  return (
    <SearchContext.Provider value={{ searchData, updateSearch }}>
      {children}
    </SearchContext.Provider>
  );
};