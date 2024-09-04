import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import "./Chat.css";

const CreateChatroom = () => {
  const [chatroomName, setChatroomName] = useState("");
  const [chatroomId, setChatroomId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [chatrooms, setChatrooms] = useState([]);
  const [tables, setTables] = useState([]);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

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
        console.log("responseData---->", responseData);

        const tableNames = responseData.result.data.filter(
          (table) => table !== "_User" && table !== "_Role" && table !== "_Session"
        );
        console.log("tableNames---->", tableNames);

        const chatroomsWithLinks = await Promise.all(tableNames.map(async (tableName) => {
          const data = {
            tableName: tableName
          };
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
            console.log("tableData---->", tableData);

            return {
              name: tableName,
              link: tableData.result.data.link
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
      console.log("Received message data CreateChatroom:", msgData);
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
    const data = {
      objectData: { name: chatroomName },
    };
    try {
      const response = await fetch(
        "http://localhost:2337/server/functions/createChatroomGroup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": "000",
            "X-Parse-REST-API-Key": "Yzhl06W5O7Vhf8iwlYBQCxs6hY8Fs2PQewNGjsl0",
            "X-Parse-Session-Token": "r:ef7df36bf16e16d8b9c4e3d6665f5dba",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create chatroom");
      }

      const responseData = await response.json();
      console.log("response createChatroom data--->", responseData);

      const { chatroomId, link, members, username } = responseData.result.data;
      setChatroomId(chatroomId);
      setModalVisible(true);
      setUsername(username)

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
    if (message.trim() && socketRef.current && chatroomName) {
      const finalUsername = username;

      const msgData = {
        username: finalUsername,
        message: message.trim(),
        chatroomId: chatroomId,
        chatroomName: chatroomName,
      };
      console.log("msgData---->", msgData);

      socketRef.current.emit("message", msgData, chatroomId);
      setMessages((prevMessages) => [...prevMessages, { username: finalUsername, message: message.trim() }]);
      setMessage("");
    } else {
      console.log("Message not sent. Check conditions:", { message, chatroomName });
    }
  };

  return (
    <div className="App">
      <h1>Create a Chatroom Group</h1>
      <input
        type="text"
        value={chatroomName}
        onChange={(e) => setChatroomName(e.target.value)}
        placeholder="Enter chatroom name"
      />
      <button onClick={createChatroom}>Create Chatroom</button>

      <div>
        <h1>Available Chatrooms</h1>
        <ul>
          {chatrooms.map((chatroom, index) => (
            <li key={index}>
              {chatroom.link ? (
                <a
                  href={chatroom.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {chatroom.name}
                </a>
              ) : (
                <span>{chatroom.name}</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {modalVisible && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setModalVisible(false)}>
              &times;
            </span>
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
        </div>
      )}
    </div>
  );
};

export default CreateChatroom;
