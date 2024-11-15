import { useEffect, useState, useRef } from "react";
import Parse from "parse";
import axios from "axios";

Parse.initialize("008");
Parse.serverURL = "http://localhost:2337/server";

const ChatDuo = ({ companySelected }) => {
  const [newMessage, setNewMessage] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [roomId, setRoomId] = useState("");
  const [userLogged, setUserLogged] = useState("");

  const subscriptionMessageRef = useRef(null);

  // Este useEffect crea o encuentra la sala
  useEffect(() => {
    const initializeChatRoom = async () => {
      const storedUser = localStorage.getItem("user");
      const userParsed = JSON.parse(storedUser);

      console.log("companySelected", companySelected);
      console.log("userParsed", userParsed.objectId);

      setUserLogged(userParsed.companyId);

      createOrFindDuoRoom(userParsed.companyId, companySelected.objectId); //companySelected.objectId ahora es la compañia con la que voy a crear un chat
    };

    initializeChatRoom();
  }, []);

  // Este useEffect se ejecuta cuando `chatroomId` tiene un valor
  useEffect(() => {
    if (!roomId) return;

    const fetchMessagesAndSubscribe = async () => {
      try {
        // Crear una conexión con la colección "Chat_Message"
        const ChatMessage = Parse.Object.extend("chatMessage");
        const query = new Parse.Query(ChatMessage);
        query.equalTo("chatroomId", roomId);

        const data = await query.find();
        if (data) {
          const messagesHistory = data
            .filter((message) => message.get("content") !== "")
            .map((message) => ({
              content: message.get("content"),
              companyId: message.get("companyId"),
              chatroomId: message.get("chatroomId"),
              createdAt: message.get("createdAt"),
            }));

          setAllMessages(messagesHistory);
        }

        // Aquí es donde configuramos la suscripción a Parse LiveQuery
        const subscriptionMessage = await query.subscribe();

        // Escuchar la creación de nuevos mensajes en tiempo real
        subscriptionMessage.on("create", (message) => {
          const newMsg = {
            content: message.get("content"),
            companyId: message.get("companyId"),
            chatroomId: message.get("chatroomId"),
            createdAt: message.get("createdAt"),
          };

          // Actualizamos el estado con el nuevo mensaje
          setAllMessages((prevMessages) => [...prevMessages, newMsg]);
          // setNewMessage((prevState) => [...prevState, newMsg]);
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
      let members = [user1, user2];

      let data = {
        objectData: {
          members,
        },
      };

      const response = await fetch(
        `http://localhost:2337/server/functions/createChatroom`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": "008",
            "X-Parse-REST-API-Key": "Yzhl06W5O7Vhf8iwlYBQCxs6hY8Fs2PQewNGjsl0", // hacerlo dinámico
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();
      const chatroomId = result.result.data.chatroom.objectId;

      setRoomId(chatroomId);
    } catch (error) {
      console.log("Error creando o encontrando la sala:", error);
    }
  }

  async function sendMessage() {
    try {
      const ChatMessage = Parse.Object.extend("chatMessage");
      const message = new ChatMessage();

      message.set("content", newMessage);
      message.set("companyId", userLogged);
      message.set("chatroomId", roomId);
      message.save().catch((error) => {
        console.log("Error al enviar mensaje: ", error);
      });
      setNewMessage("");
    } catch (error) {
      console.log(error);
    }
  }

  async function createAlliance() {
    try {
      const storedUser = localStorage.getItem("user");
      const userParsed = JSON.parse(storedUser);

      const allCompaniesId = [userParsed.companyId, companySelected.objectId];

      const response = await axios.post(
        `http://localhost:2337/server/functions/createAlliance`,
        {
          objectData: {
            name: "Alianza de test",
            allCompaniesId,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": "008",
            "X-Parse-REST-API-Key": "Yzhl06W5O7Vhf8iwlYBQCxs6hY8Fs2PQewNGjsl0",
          },
        }
      );
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div>
      <div class="p-3 d-flex justify-content-center">
        <button class="btn btn-success" onClick={() => createAlliance()}>
          Crear alianza{" "}
        </button>
      </div>
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
            Chat Duo: {companySelected ? companySelected.name : ""}
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
                  msg.companyId === userLogged
                    ? "justify-content-end"
                    : "justify-content-start"
                }`}
              >
                <div
                  className={`p-2 rounded-3 ${
                    msg.companyId === userLogged
                      ? "bg-primary text-white"
                      : "bg-light text-dark"
                  }`}
                  style={{ maxWidth: "75%", wordBreak: "break-word" }}
                >
                  <strong>
                    {" "}
                    {userLogged == msg.companyId
                      ? "Tú"
                      : companySelected.name}:{" "}
                  </strong>
                  <p className="mb-0">{msg.content}</p>
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
