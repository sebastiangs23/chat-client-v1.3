import { useEffect, useState, useRef } from "react";
import Parse from "parse";

Parse.initialize("005", "Yzhl06W5O7Vhf8iwlYBQCxs6hY8Fs2PQewNGjsl0");
Parse.serverURL = "http://localhost:2337/server";

const ChatDuo = ({ userProps }) => {
  const [newMessage, setNewMessage] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [roomId, setRoomId] = useState("");
  const [userLogged, setUserLogged] = useState("");

  const subscriptionMessageRef = useRef(null);

  // Este useEffect crea o encuentra la sala
  useEffect(() => {
    const initializeChatRoom = async () => {

      const user1 = JSON.parse(localStorage.getItem('user')).objectId;
      const user2 = userProps; 

      setUserLogged(user1);
      createOrFindDuoRoom(user1, user2);
    };

    initializeChatRoom();
  }, []);

  useEffect(() => {
    if (!roomId) return;

    const fetchMessagesAndSubscribe = async () => {
      try {
        // Crear una conexión con la colección "chatMessages"
        const ChatMessage = Parse.Object.extend("chatMessages");
        const query = new Parse.Query(ChatMessage);
        query.equalTo("chatId", roomId);
        const data = await query.find();

        if (data) {
          const messagesHistory = data
            .filter((message) => message.get("chatContent") !== "")
            .map((message) => ({
              chatContent: message.get("chatContent"),
              chatClientId: message.get("chatClientId"),
              chatId: message.get("chatId"),
              createdAt: message.get("createdAt"),
            }));
          
          setAllMessages(messagesHistory);
        }

        // Aquí es donde configuramos la suscripción a Parse LiveQuery
        const subscriptionMessage = await query.subscribe();

        // Escuchar la creación de nuevos mensajes en tiempo real
        subscriptionMessage.on("create", (message) => {
          const newMsg = {
            chatContent: message.get("chatContent"),
            chatClientId: message.get("chatClientId"),
            chatId: message.get("chatId"),
            createdAt: message.get("createdAt"),
          };

          // Actualizamos el estado con el nuevo mensaje
          setAllMessages((prevMessages) => [...prevMessages, newMsg]);
        });
      } catch (error) {
        console.log("Error al obtener los mensajes o suscribirse:", error);
      }
    };

    fetchMessagesAndSubscribe();

    return () => {
      if (subscriptionMessageRef.current) {
        subscriptionMessageRef.current.unsubscribe();
      }
    };
  }, [roomId]);

  async function createOrFindDuoRoom(user1, user2) {
    try {
      let chaMembers = [user1, user2];

      let data = {
        objectData: {
          chaMembers,
          chatDuo: true 
        }
      };

      // Crea o encuentra la sala
      const response = await fetch(
        `http://localhost:2337/server/functions/createChats`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": "005",
            "X-Parse-REST-API-Key": "Yzhl06W5O7Vhf8iwlYBQCxs6hY8Fs2PQewNGjsl0",
            "X-Parse-Session-Token": "r:1c596489babc9aacbeea1e65ecb7999a"

          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();     
      const chatRoomId = result.result.chats.chat.objectId;  

      setRoomId(chatRoomId);
    } catch (error) {
      console.log("Error creando o encontrando la sala:", error);
    }
  }

  async function sendMessage() {
    try {
      if (!userLogged || !roomId) {
        console.log("Error: userLogged o roomId no están definidos.");
        return;
      }
  
      // Crear un nuevo mensaje en chatMessage
      const ChatMessage = Parse.Object.extend("chatMessages");
      const message = new ChatMessage();
      message.set("chatContent", newMessage);
      message.set("chatClientId", userLogged);
      message.set("chatId", roomId);
      await message.save();

      setNewMessage("");
      console.log("Mensaje enviado con éxito.");
  
    } catch (error) {
      console.log("Error en el controlador sendMessage: ", error);
    }
  }
  
  return (
    <div>
      <div
        className="container mt-3 d-flex flex-column"
        style={{
          width: "600px",
          height: "630px",
          backgroundColor: "#f5f5f5",
          borderBottom: "1px solid #ccc",
        }}
      >
        <div
          className="bg-primary text-white p-3 rounded-top text-center"
          style={{ cursor: "pointer" }}
        >
          <h5 className="mb-0">
            Chat Duo con '{userProps}'
          </h5>
        </div>
        <div
          className="flex-grow-1 p-3"
          style={{
            overflowY: "auto",
            backgroundColor: "#f5f5f5",
            borderBottom: "1px solid #ccc",
          }}
        >
          {allMessages &&
            allMessages.map((msg, index) => (
              <div
                key={index}
                className={`d-flex mb-2 ${
                  msg.chatClientId === userLogged
                    ? "justify-content-end"
                    : "justify-content-start"
                }`}
              >
                <div
                  className={`p-2 rounded-3 ${
                    msg.chatClientId === userLogged
                      ? "bg-primary text-white"
                      : "bg-light text-dark"
                  }`}
                  style={{ maxWidth: "75%", wordBreak: "break-word" }}
                >
                  <strong>
                    {" "}
                    {userLogged == msg.chatClientId
                      ? "Tú"
                      : userProps}:{" "}
                  </strong>
                  <p className="mb-0">{msg.chatContent}</p>
                </div>
              </div>
            ))}
          <div />
        </div>
        <div className="p-3 d-flex align-items-center">
          <input
            type="text"
            className="form-control me-2"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
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
      </div>
    </div>
  );
};

export default ChatDuo;
