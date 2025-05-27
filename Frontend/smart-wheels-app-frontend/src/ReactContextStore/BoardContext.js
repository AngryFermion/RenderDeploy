import React, { createContext, useContext, useState } from "react";

// Create a context
const BoardContext = createContext();

// Create a provider component
export const BoardProvider = ({ children }) => {
  const [boardIdList, setBoardIdList] = useState([]);

  return (
    <BoardContext.Provider value={{ boardIdList, setBoardIdList }}>
      {children}
    </BoardContext.Provider>
  );
};

// Custom hook to use the board context
export const useBoardContext = () => useContext(BoardContext);
