import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import JoinChat from "./components/JoinChat";
import { CreateChatDuo } from "./components/Duo/createChatDuo";
import { Login } from "./components/login/Login";
import { UserProvider, useUser } from "./context/UserContext";

const App = () => {

  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/join-chat" element={<JoinChat />} />
          <Route path="/create-chat-duo" element={<ProtectedCreateChatroom />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

// Rutas protegidas según si el usuario está autenticado
const ProtectedCreateChatroom  = ({ element, ...rest }) => {
  const { user } = useUser();
  console.log('user??', user)
  return user ? <CreateChatDuo /> : <Navigate to="/login" />;
};

export default App;
