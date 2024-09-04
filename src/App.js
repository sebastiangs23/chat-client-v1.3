import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import JoinChat from "./components/JoinChat";
import CreateChatroom from "./components/CreateChatroom";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/join-chat" element={<JoinChat />} />
        <Route path="/" element={<CreateChatroom />} />
      </Routes>
    </Router>
  );
};

export default App;