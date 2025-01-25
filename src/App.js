import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import JoinChat from "./components/JoinChat";
import CreateChatroom from "./components/CreateChatroom";
import Notifications from "./components/notifications/notifications";
import NotificationsTransactions from "./components/notifications/notificationsTransactions";
import NotificationsLicence from "./components/notifications/notificationsLicence";
import { MarketPlace } from "./components/77/marketPlace";
import { Login } from "./components/login/Login";
import { UserProvider, useUser } from "./context/UserContext";

const App = () => {

  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/join-chat" element={<JoinChat />} />
          <Route path="/create-chatroom" element={<ProtectedCreateChatroom />} />
          <Route path="/market-place" element={<MarketPlace />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/notifications-transactions" element={<NotificationsTransactions />} />
          <Route path="/notifications-licence" element={<NotificationsLicence />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

// Rutas protegidas según si el usuario está autenticado
const ProtectedCreateChatroom  = ({ element, ...rest }) => {
  const { user } = useUser();
  return user ? <CreateChatroom /> : <Navigate to="/login" />;
};

export default App;
