import React, { useState, useEffect, useRef } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom"; // Importa useNavigate
import io from "socket.io-client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Chat.css";

const CreateChatroom = () => {
  const { user } = useUser();
  const navigate = useNavigate(); // Usa useNavigate para redirigir
  const [chatroomName, setChatroomName] = useState("");
  const [chatroomId, setChatroomId] = useState(null);
  const [chatVisible, setChatVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [chatrooms, setChatrooms] = useState([]);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user) {
      console.log("user create Chatroom--->", user);    
      console.log("username create Chatroom--->", user.username);    
      console.log("sessionToken create Chatroom--->", user.sessionToken);
      setUsername(user.username);
    }
  }, [user]);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await fetch(
          "http://localhost:2337/server/functions/getAllChatGroupsRooms",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Parse-Application-Id": "077",
              "X-Parse-REST-API-Key": "Yzhl06W5O7Vhf8iwlYBQCxs6hY8Fs2PQewNGjsl0",
              // "X-Parse-Session-Token": user.sessionToken,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch tables");
        }

        const responseData = await response.json();

        const tableNames = responseData.result.data.filter(
          (table) =>
            table !== "_User" && table !== "_Role" && table !== "_Session"
        );

        const chatroomsWithLinks = await Promise.all(
          tableNames.map(async (tableName) => {
            const data = { tableName };
            try {
              const tableResponse = await fetch(
                "http://localhost:2337/server/functions/getTableLink",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "X-Parse-Application-Id": "077",
                    "X-Parse-REST-API-Key":
                      "Yzhl06W5O7Vhf8iwlYBQCxs6hY8Fs2PQewNGjsl0",
                    // "X-Parse-Session-Token": "r:ef7df36bf16e16d8b9c4e3d6665f5dba",
                  },
                  body: JSON.stringify(data),
                }
              );

              if (!tableResponse.ok) {
                throw new Error(`Failed to fetch link for ${tableName}`);
              }

              const tableData = await tableResponse.json();
              console.log("tableData:", tableData);

              return {
                name: tableName,
                link: tableData.result?.data?.link || "#",
              };
            } catch (error) {
              console.error(
                `Error fetching link for table ${tableName}:`,
                error
              );
              return {
                name: tableName,
                link: "#",
              };
            }
          })
        );

        setChatrooms(chatroomsWithLinks);
      } catch (error) {
        console.error("Error fetching tables:", error);
      }
    };

    fetchTables();

    socketRef.current = io("http://localhost:2337");

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
  }, []);

  useEffect(() => {
    console.log("Messages updated:", messages);
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const createChatroom = async () => {
    const data = { objectData: { name: chatroomName } };
    try {
      const response = await fetch(
        "http://localhost:2337/server/functions/createChatroomGroup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": "077",
            "X-Parse-REST-API-Key": "Yzhl06W5O7Vhf8iwlYBQCxs6hY8Fs2PQewNGjsl0",
            "X-Parse-Session-Token": user.sessionToken,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create chatroom");
      }

      const responseData = await response.json();
      console.log("Chatroom creation response:", responseData);

      const { chatroomId, link, members, username } = responseData.result.data;
      setChatroomId(chatroomId);
      setChatVisible(true);
      // setUsername(username);

      socketRef.current.emit("join", chatroomId);

      console.log("Chatroom ID:", chatroomId);
      console.log("Link:", link);
      console.log("Members:", members);
      console.log("Username:", username);
    } catch (error) {
      console.error("Error creating chatroom:", error);
    }
  };

  const sendMessage = () => {
    if (message.trim() && socketRef.current && chatroomId) {

      const msgData = {
        username,
        message: message.trim(),
        chatroomId,
        chatroomName: chatroomName,
      };

      console.log("Sending message:", msgData);

      socketRef.current.emit("message", msgData);
      setMessage("");
    } else {
      console.log("Message not sent. Check conditions:", {
        message,
        chatroomId,
      });
    }
  };

  return (
    <div className="container-fluid mt-4">
      <h1 className="mb-2">Comunidades</h1>
      <div className="col-md-3 mb-2">
        <input
          type="text"
          className="form-control"
          value={chatroomName}
          onChange={(e) => setChatroomName(e.target.value)}
          placeholder="Enter chatroom name"
        />
      </div>
      <button className="btn btn-primary mb-4" onClick={createChatroom}>
        Crear comunidad
      </button>

      <div className="row">
        {/* Sección de chatrooms disponibles */}
        <div className="col-md-3">
          <div className="chatrooms-container">
            <h2>Comunidades Disponibles</h2>
            <div className="list-group">
              {chatrooms.map((chatroom, index) => (
                <div
                  key={index}
                  className="list-group-item list-group-item-action d-flex align-items-center"
                >
                  <div className="me-3">
                    <img
                      src="https://via.placeholder.com/50" // Placeholder for chatroom icon
                      alt="Chatroom Icon"
                      className="rounded-circle"
                    />
                  </div>
                  <div>
                    <a
                      href={chatroom.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-decoration-none text-dark"
                    >
                      {chatroom.name}
                    </a>
                    <p className="text-muted mb-0">Last message preview...</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sección de chat activo */}
        <div className="col-md-5">
          {chatVisible && (
            <div className="chatroom-container mt-2">
              <h5>Chatroom: {chatroomName}</h5>
              <div
                className="chat-messages mb-3"
                style={{ maxHeight: "300px", overflowY: "scroll" }}
              >
                {messages.map((msg, index) => (
                  <div key={index}>
                    <strong>{msg.username}:</strong> {msg.message}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                />
                <button className="btn btn-primary" onClick={sendMessage}>
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateChatroom;
