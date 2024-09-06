import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Chat.css";

const CreateChatroom = () => {
  const [chatroomName, setChatroomName] = useState("");
  const [chatroomId, setChatroomId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [chatrooms, setChatrooms] = useState([]);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await fetch("http://localhost:2337/server/functions/getAllChatGroupsRooms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": "000",
            "X-Parse-REST-API-Key": "Yzhl06W5O7Vhf8iwlYBQCxs6hY8Fs2PQewNGjsl0",
            "X-Parse-Session-Token": "r:ef7df36bf16e16d8b9c4e3d6665f5dba",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch tables");
        }

        const responseData = await response.json();

        const tableNames = responseData.result.data.filter(
          (table) => table !== "_User" && table !== "_Role" && table !== "_Session"
        );

        const chatroomsWithLinks = await Promise.all(tableNames.map(async (tableName) => {
          const data = { tableName };
          try {
            const tableResponse = await fetch("http://localhost:2337/server/functions/getTableLink", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Parse-Application-Id": "000",
                "X-Parse-REST-API-Key": "Yzhl06W5O7Vhf8iwlYBQCxs6hY8Fs2PQewNGjsl0",
                "X-Parse-Session-Token": "r:ef7df36bf16e16d8b9c4e3d6665f5dba",
              },
              body: JSON.stringify(data),
            });

            if (!tableResponse.ok) {
              throw new Error(`Failed to fetch link for ${tableName}`);
            }

            const tableData = await tableResponse.json();
            const link = tableData.result?.data?.link || "#";

            return {
              name: tableName,
              link: link,
            };
          } catch (error) {
            console.error(`Error fetching link for table ${tableName}:`, error);
            return {
              name: tableName,
              link: "#",
            };
          }
        }));

        setChatrooms(chatroomsWithLinks);
      } catch (error) {
        console.error("Error fetching tables:", error);
      }
    };

    fetchTables();

    socketRef.current = io("http://localhost:2337");

    socketRef.current.on("message", (msgData) => {
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
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const createChatroom = async () => {
    const data = { objectData: { name: chatroomName } };
    try {
      const response = await fetch("http://localhost:2337/server/functions/createChatroomGroup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": "000",
          "X-Parse-REST-API-Key": "Yzhl06W5O7Vhf8iwlYBQCxs6hY8Fs2PQewNGjsl0",
          "X-Parse-Session-Token": "r:d221a041e069b119330d9822a2781724",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create chatroom");
      }

      const responseData = await response.json();
      const { chatroomId, username } = responseData.result.data;
      setChatroomId(chatroomId);
      setModalVisible(true);
      setUsername(username);

      socketRef.current.emit("join", chatroomId);

      // Redirecciona a la ruta del chatroom
      navigate(`/join-chat/${chatroomId}`);
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
      };

      socketRef.current.emit("message", msgData);
      setMessages((prevMessages) => [...prevMessages, { username, message: message.trim() }]);
      setMessage("");
    }
  };

  return (
    <div className="container mt-4">
      <div className="chatrooms-sidebar">
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            value={chatroomName}
            onChange={(e) => setChatroomName(e.target.value)}
            placeholder="Enter chatroom name"
          />
          <button className="btn btn-primary btn-sm" onClick={createChatroom}>Create Chat</button>
        </div>
        <div className="list-group">
          {chatrooms.map((chatroom, index) => (
            <div key={index} className="list-group-item list-group-item-action d-flex align-items-center">
              <div className="me-3">
                <img
                  src="https://via.placeholder.com/50"
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

      <div className="flex-grow-1 d-flex flex-column">
        {modalVisible && (
          <div className="modal show" style={{ display: 'block' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Chatroom: {chatroomName}</h5>
                  <button type="button" className="btn-close" onClick={() => setModalVisible(false)}></button>
                </div>
                <div className="modal-body d-flex flex-column">
                  <div className="chat-messages mb-3">
                    {messages.map((msg, index) => (
                      <div key={index}>
                        <strong>{msg.username}: </strong>{msg.message}
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
                      placeholder="Type your message"
                    />
                    <button className="btn btn-primary btn-sm" onClick={sendMessage}>Send</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateChatroom;
