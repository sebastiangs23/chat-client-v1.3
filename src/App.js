// import React, { useState, useEffect, useRef } from "react";
// import { BrowserRouter as Router, Route, Switch, useHistory, useLocation } from "react-router-dom";
// import io from "socket.io-client";
// import "./App.css";

// const App = () => {
//   const [chatroomName, setChatroomName] = useState("");
//   const [chatroomId, setChatroomId] = useState(null);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const [message, setMessage] = useState("");
//   const [username, setUsername] = useState("");
//   const socketRef = useRef(null);
//   const messagesEndRef = useRef(null);

  

//   // Un solo useEffect para manejar la conexión a Socket.IO
//   useEffect(() => {
//     socketRef.current = io("http://localhost:2337"); // Conéctate una sola vez

//     socketRef.current.on("message", (msgData) => {
//       const { username, message } = msgData;
//       setMessages((prevMessages) => [...prevMessages, { username, message }]);
//     });

//     // Desconectar el socket cuando el componente se desmonte
//     return () => {
//       socketRef.current.disconnect();
//     };
//   }, []);

//   // Scroll automático cuando hay nuevos mensajes
//   useEffect(() => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]);

//   const createChatroom = async () => {
//     const data = {
//       objectData: { name: chatroomName },
//     };
//     try {
//       const response = await fetch(
//         "http://localhost:2337/server/functions/createChatroomGroup",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             "X-Parse-Application-Id": "000",
//             "X-Parse-REST-API-Key": "Yzhl06W5O7Vhf8iwlYBQCxs6hY8Fs2PQewNGjsl0",
//             "X-Parse-Session-Token": "r:ef7df36bf16e16d8b9c4e3d6665f5dba",
//           },
//           body: JSON.stringify(data),
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to create chatroom");
//       }

//       const responseData = await response.json(); // Convierte el cuerpo de la respuesta en un objeto JSON
//       console.log("response createChatroom data--->", responseData); // Muestra los datos JSON devueltos por el backend

//       const { chatroomId, link, members, username } = responseData.result.data;
//       setChatroomId(chatroomId);
//       setModalVisible(true);

//       // Emitir el evento join después de crear la sala de chat
//       socketRef.current.emit("join", chatroomId);

//       // Puedes acceder y usar las propiedades devueltas por el backend
//       console.log("Chatroom ID:", chatroomId);
//       console.log("Shareable Link:", link);
//       console.log("Members:", members);
//       console.log("Username:", username);
//     } catch (error) {
//       console.error("Error creating chatroom:", error);
//     }
//   };

//   const sendMessage = () => {
//     if (message.trim() && socketRef.current && chatroomName) {
//       const msgData = {
//         username: username, // Reemplaza esto con el nombre de usuario real
//         message: message.trim(),
//         chatroomId: chatroomId,
//       };
//       // Enviar el mensaje junto con el chatroomName
//       socketRef.current.emit("message", msgData, chatroomName);
//       setMessage("");
//     }
//   };

//   return (
//     <div className="App">
//       <h1>Create a Chatroom Group</h1>
//       <input
//         type="text"
//         value={chatroomName}
//         onChange={(e) => setChatroomName(e.target.value)}
//         placeholder="Enter chatroom name"
//       />
//       <button onClick={createChatroom}>Create Chatroom</button>

//       {modalVisible && (
//         <div className="modal">
//           <div className="modal-content">
//             <span className="close" onClick={() => setModalVisible(false)}>
//               &times;
//             </span>
//             <h2>Chatroom: {chatroomName}</h2>
//             <div className="chat-messages">
//               {messages.map((msg, index) => (
//                 <div key={index}>
//                   <strong>{msg.username}: </strong> {msg.message}
//                 </div>
//               ))}
//               <div ref={messagesEndRef} />
//             </div>
//             <div className="message-input">
//               <input
//                 type="text"
//                 value={message}
//                 onChange={(e) => setMessage(e.target.value)}
//                 placeholder="Type a message..."
//               />
//               <button onClick={sendMessage}>Send</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default App;

import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Route, useNavigate, useLocation, Routes } from "react-router-dom";
import io from "socket.io-client";
import "./App.css";

const JoinChat = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const chatroomId = params.get("chatroomId");

    if (!chatroomId) {
      alert("Chatroom ID missing");
      navigate('/');
      return;
    }

    socketRef.current = io("http://localhost:2337");

    socketRef.current.emit("join", chatroomId);

    socketRef.current.on("message", (msgData) => {
      const { username, message } = msgData;
      setMessages((prevMessages) => [...prevMessages, { username, message }]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [location, navigate]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = () => {
    if (message.trim() && socketRef.current) {
      const msgData = {
        username: "nombre_de_usuario", // Replace with actual username
        message: message.trim(),
      };
      socketRef.current.emit("message", msgData);
      setMessage("");
    }
  };

  return (
    <div className="chat-container">
      <h2>Chatroom</h2>
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

const CreateChatroom = () => {
  const [chatroomName, setChatroomName] = useState("");
  const [chatroomId, setChatroomId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [chatrooms, setChatrooms] = useState([]);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socketRef.current = io("http://localhost:2337");

    socketRef.current.on("message", (msgData) => {
      const { username, message } = msgData;
      setMessages((prevMessages) => [...prevMessages, { username, message }]);
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
  const fetchChatrooms = async (page = 1) => { // Añadir parámetro de página con valor predeterminado
    try {
      const response = await fetch(
        "http://localhost:2337/server/functions/getAllChatGroupsRooms",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": "000",
            "X-Parse-REST-API-Key": "Yzhl06W5O7Vhf8iwlYBQCxs6hY8Fs2PQewNGjsl0",
            "X-Parse-Session-Token": "r:ef7df36bf16e16d8b9c4e3d6665f5dba",
          },
          body: JSON.stringify({
            page: page // Incluir el número de página en el cuerpo de la solicitud
          })
        }
      );

      if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, details: ${JSON.stringify(errorDetails)}`);
      }

      const responseData = await response.json();
      console.log("response fetchChatrooms data--->", responseData);

      if (responseData.result && responseData.result.data && Array.isArray(responseData.result.data.chatrooms)) {
        setChatrooms(responseData.result.data.chatrooms);
      } else {
        throw new Error("Unexpected response structure");
      }
    } catch (error) {
      console.error("Error fetching chatrooms:", error);
      setError(`Error fetching chatrooms: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchChatrooms(); // Llama a la función de fetch con el número de página por defecto
  }, []);


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

      socketRef.current.emit("join", chatroomId);

      fetchChatrooms(); // Refresh the list after creating a new chatroom
    } catch (error) {
      console.error("Error creating chatroom:", error);
      setError(`Error creating chatroom: ${error.message}`);
    }
  };

  const sendMessage = () => {
    if (message.trim() && socketRef.current && chatroomId) {
      const msgData = {
        username: username,
        message: message.trim(),
        chatroomId: chatroomId,
      };
      socketRef.current.emit("message", msgData, chatroomName);
      setMessage("");
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

      <h2>Available Chatrooms</h2>
      {error && <p style={{color: 'red'}}>{error}</p>}
      <ul>
        {chatrooms.map((room) => (
          <li key={room.objectId}>
            <a href={room.link} target="_blank" rel="noopener noreferrer">
              Chatroom: {room.name || 'Unnamed'} (Link: {room.link})
            </a>
          </li>
        ))}
      </ul>

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
