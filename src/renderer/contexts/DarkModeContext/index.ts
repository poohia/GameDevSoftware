import { createContext } from 'react';

type DarkModeContextType = {
  darkModeActived: boolean;
  toggleDarkMode: () => void;
};

const DarkModeContext = createContext<DarkModeContextType>({
  darkModeActived: true,
  toggleDarkMode: () => {},
});

export default DarkModeContext;
