import { createContext, useState, useContext } from "react";

// Crea el contexto
const UserContext = createContext();

// Proveedor del contexto
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Aquí se almacena el username y sessionToken

  const loginUser = (userData) => {
    console.log('cuando se logea', userData)
    setUser(userData);
  };

  const logoutUser = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook para usar el contexto
export const useUser = () => useContext(UserContext);
