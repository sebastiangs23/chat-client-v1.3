import React, { useState, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Route,
  useNavigate,
  useLocation,
  Routes,
} from "react-router-dom";
import io from "socket.io-client";


const JoinChat = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("Tú");
  const [chatroomId, setChatroomId] = useState("");
  const [chatroomName, setChatroomName] = useState(""); // Agregado para manejar el nombre
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    console.log("params--->", params);
    
    const id = params.get("chatroomId");
    console.log("id--->", id);

    const name = params.get("chatroomName"); // Obtener el nombre de la sala si está disponible
    console.log("name--->", name);

    if (!id) {
      alert("Chatroom ID missing");
      navigate("/");
      return;
    }
    setChatroomId(id);
    setChatroomName(name || ""); // Establecer el nombre de la sala si está disponible

    socketRef.current = io("http://localhost:2337");

    socketRef.current.on("connect", () => {
      console.log("Connected to the socket server");
    });

    // Emitir un evento para unirse a la sala de chat
    socketRef.current.emit("join", chatroomId);

    // Escuchar los mensajes entrantes
    socketRef.current.on("message", (msgData) => {
      console.log("Received message data:", msgData);
      const { username, message } = msgData;
      if (username && message) {
        setMessages((prevMessages) => [...prevMessages, { username, message }]);
      } else {
        console.error("Received incomplete message data:", msgData);
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [chatroomId, location, navigate]);

  useEffect(() => {
    console.log("Messages updated:", messages);
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = () => {
    if (message.trim() && socketRef.current && chatroomName) {
      const msgData = {
        username: username, // Reemplaza con el nombre de usuario real
        message: message.trim(),
        chatroomId: chatroomId,
        chatroomName: chatroomName, // Enviar el nombre de la sala
      };
      console.log("msgData---->", msgData);
      
      socketRef.current.emit("message", msgData, chatroomId);
      setMessage("");
    }  else {
      console.log("Message not sent. Check conditions:", { message, chatroomName });
    }
  };

  return (
    <div className="chat-container">
      <h2>Chatroom: {chatroomName}</h2>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.username}: </strong> {msg.message}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="message-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};


export default JoinChat;
