import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext.js";
import io from "socket.io-client";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button } from "react-bootstrap";
import ChatDuo from "./ChatDuo.js";

// Componente para mostrar la información del grupo
const GroupInfoModal = ({ show, handleClose, groupName }) => {
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{groupName} - Información del Grupo</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Aquí puedes poner detalles sobre el grupo como:</p>
        <ul>
          <li>Descripción del grupo</li>
          <li>Miembros del grupo</li>
          <li>Configuraciones del grupo</li>
        </ul>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const JoinChat = () => {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [chatroomId, setChatroomId] = useState("");
  const [chatroomName, setChatroomName] = useState("");
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [userSelected, setUserSelected] = useState(null);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  
  useEffect(() => {
    if(user){
      console.log("user Join Chat--->", user); 
      console.log("username Join Chat--->", user.username);    
      console.log("sessionToken Join Chat--->", user.sessionToken);
      setUsername(user.username);
    } else {
      console.warn("User is not defined or username is missing");
    }
    
    const params = new URLSearchParams(location.search);
    const id = params.get("chatroomId");
    const name = params.get("chatroomName");

    if (!id) {
      alert("Chatroom ID missing");
      navigate("/");
      return;
    }
    
    setChatroomId(id);
    setChatroomName(name || "");

    const fetchMessages = async () => {
      try {
        const data = { tableName: name };
        const response = await fetch(
          "http://localhost:2337/server/functions/getAllMessages",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Parse-Application-Id": "000",
              "X-Parse-REST-API-Key": "Yzhl06W5O7Vhf8iwlYBQCxs6hY8Fs2PQewNGjsl0",
            },
            body: JSON.stringify(data),
          }
        );

        if (!response.ok) {
          throw new Error(`Error fetching messages: ${response.statusText}`);
        }

        const result = await response.json();
        if (result && result.result.status === "success" && Array.isArray(result.result.data)) {
          const formattedMessages = result.result.data.map((messageObject) => ({
            username: messageObject.username,
            message: messageObject.message,
          }));
          setMessages(formattedMessages); 
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    if (!socketRef.current) {
      socketRef.current = io("http://localhost:2337");
      
      socketRef.current.on("connect", () => {
        console.log("Connected to the socket server");
        socketRef.current.emit("join", id);
      });

      socketRef.current.on("message", (msgData) => {
        console.log("Received message data Join Chat--->:", msgData);
        const { username, message } = msgData;
        if (username && message) {
          setMessages((prevMessages) => [...prevMessages, { username, message }]);
        }
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [chatroomId, location, navigate, chatroomName, user]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = () => {
    if (message.trim() && socketRef.current && chatroomName) {
      const msgData = {
        username,
        message: message.trim(),
        chatroomId: chatroomId,
        chatroomName: chatroomName,
      };

      console.log("username emit---->", username)

      socketRef.current.emit("message", msgData);
      setMessage("");
    }
  };

  // const handleSaveUsername = (newUsername) => {
  //   setUsername(newUsername);
  //   sessionStorage.setItem("username", newUsername);
  // };

  const openDuoChat = (user) => {
    console.log('el elejido :',  user);
    setUserSelected(user);
  };

  return (
    <div className="container d-flex" style={{ padding: 0 }}>
      <div
        style={{
          height: "90vh",
          maxWidth: "700px",
          margin: "0",
          border: "1px solid #ccc",
          borderRadius: "10px",
        }}
      >
        <div
          className="bg-primary text-white p-3 rounded-top text-center"
          style={{ cursor: "pointer" }}
          onClick={() => setShowGroupInfo(true)}
        >
          <h5 className="mb-0">{chatroomName}</h5>
        </div>
        <div
          className="flex-grow-1 p-3"
          style={{
            width: "600px",
            height: "530px",
            overflowY: "auto",
            backgroundColor: "#f5f5f5",
            borderBottom: "1px solid #ccc",
          }}
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`d-flex mb-2 ${
                msg.username === username
                  ? "justify-content-end"
                  : "justify-content-start"
              }`}
            >
              <div
                className={`p-2 rounded-3 ${
                  msg.username === username
                    ? "bg-primary text-white"
                    : "bg-light text-dark"
                }`}
                style={{ maxWidth: "75%", wordBreak: "break-word" }}
              >
                <strong onClick={() => openDuoChat(msg)}>
                  {msg.username === username ? "Tú" : msg.username}
                </strong>
                <p className="mb-0">{msg.message}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-3 d-flex align-items-center">
          <input
            type="text"
            className="form-control me-2"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            style={{ borderRadius: "20px" }}
          />
          <button
            className="btn btn-primary"
            onClick={sendMessage}
            style={{ borderRadius: "20px" }}
          >
            Enviar
          </button>
        </div>

        <GroupInfoModal
          show={showGroupInfo}
          handleClose={() => setShowGroupInfo(false)}
          groupName={chatroomName}
        />
      </div>

      {userSelected && (
        <div className="container" style={{ width: "700px", marginLeft: "10px" }}>
          <ChatDuo userProps={userSelected} chatroomId={chatroomId} />
        </div>
      )}
    </div>
  );
};

export default JoinChat;
