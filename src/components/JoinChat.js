import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation,} from "react-router-dom";
import io from "socket.io-client";

const JoinChat = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [chatroomId, setChatroomId] = useState("");
  const [chatroomName, setChatroomName] = useState(""); // Agregado para manejar el nombre
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
        // Recuperar el nombre de usuario desde sessionStorage
        const storedUsername = sessionStorage.getItem("username");
        console.log(sessionStorage.getItem("username"));
        
        if (storedUsername) {
          setUsername(storedUsername);
        } else {
          console.error("No username found in sessionStorage");
        }

    const params = new URLSearchParams(location.search);
    console.log("params--->", params);

    const id = params.get("chatroomId");
    console.log("id--->", id);

    const username = params.get("username");
    console.log("username--->", username);

    const name = params.get("chatroomName"); // Obtener el nombre de la sala si está disponible
    console.log("name--->", name);

    if (!id) {
      alert("Chatroom ID missing");
      navigate("/");
      return;
    }
    setChatroomId(id);
    setChatroomName(name || ""); // Establecer el nombre de la sala si está disponible

    const fetchMessages = async () => {
      try {
        const data = {
          tableName: name,
        };  
        const response = await fetch("http://localhost:2337/server/functions/getAllMessages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": "000",
            "X-Parse-REST-API-Key": "Yzhl06W5O7Vhf8iwlYBQCxs6hY8Fs2PQewNGjsl0",
          },
          body: JSON.stringify(data),
        });
  
        if (!response.ok) {
          throw new Error(`Error fetching messages: ${response.statusText}`);
        }  
        const result = await response.json();
    // Accede a los mensajes dentro de result.result.data
    if (result.result && result.result.status === "success") {
      const formattedMessages = result.result.data[0].map((message) => ({
        username: username, // Asume que los mensajes antiguos son del usuario actual
        message: message,
      }));
      setMessages(formattedMessages); // Accede al array de mensajes directamente
    } else {
      console.error("Unexpected response structure:", result);
    }  // Asumiendo que los mensajes se encuentran en result.data
  
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

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

      // Llamar a la función para obtener los mensajes guardados al unirse a la sala
  fetchMessages();

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
    } else {
      console.log("Message not sent. Check conditions:", {
        message,
        chatroomName,
      });
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
