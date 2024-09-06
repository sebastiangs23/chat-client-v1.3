import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import JoinChat from "./components/JoinChat";
import CreateChatroom from "./components/CreateChatroom";
import { Login } from "./components/login/Login";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verifica si el usuario está autenticado al cargar la aplicación
    const token = sessionStorage.getItem("sessionToken");
    setIsAuthenticated(!!token);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
        <Route path="/join-chat" element={<JoinChat />} />
        <Route
          path="/create-chatroom"
          element={isAuthenticated ? <CreateChatroom /> : <Navigate to="/login" />}
        />
        {/* Puedes agregar más rutas protegidas aquí */}
        <Route path="/" element={<Navigate to="/join-chat" />} />
      </Routes>
    </Router>
  );
};

export default App;
