import { createContext, useState, useContext, useEffect  } from "react";

// Crea el contexto
const UserContext = createContext();

// Proveedor del contexto
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Aquí se almacena el username y sessionToken

    // Restaura el usuario desde sessionStorage cuando la aplicación se carga
    useEffect(() => {
      const storedUser = sessionStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }, []);

  const loginUser = (userData) => {
    sessionStorage.setItem('user', JSON.stringify(userData)); 
    setUser(userData);
  };

  const logoutUser = () => {
    sessionStorage.removeItem("user");
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
