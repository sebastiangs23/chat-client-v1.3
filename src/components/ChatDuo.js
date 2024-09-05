import { useEffect, useState, useRef } from "react";
import Parse from "parse";

Parse.initialize("000");
Parse.serverURL = "http://localhost:2337/server";
const sessionToken = "r:220a7f6a212a581d7d9401fd6446330c";

const ChatDuo = ({ user }) => {
  const [newMessage, setNewMessage] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const subscriptionMessageRef = useRef(null);
  const clientRef = useRef(null);
  const [roomId, setRoomId] = useState("");

  // Este useEffect crea o encuentra la sala
  useEffect(() => {
    async function createOrFindDuoRoom() {
      try {
        let members = ["SveOWrOEqL", "270qnOS11A"]; //NECESITO QUE ME LLEGUE POR PROPS EL id_otrosuario y el mio

        let objectData = {
          members,
        };

        let data = {
          objectData,
        };

        // Crea o encuentra la sala
        const response = await fetch(
          `http://localhost:2337/server/functions/createChatroom`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Parse-Application-Id": "000",
              "X-Parse-REST-API-Key": "r:06673cb764f52af0f7221e15945e6376", // hacerlo dinámico
            },
            body: JSON.stringify(data),
          }
        );

        const result = await response.json();
        const chatroomId = result.result.data.chatroom.objectId;

        // Aquí seteamos el roomId una vez que lo obtengamos
        setRoomId(chatroomId);
      } catch (error) {
        console.log("Error creando o encontrando la sala:", error);
      }
    }

    createOrFindDuoRoom();
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
              clientId: message.get("clientId"),
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
            clientId: message.get("clientId"),
            chatroomId: message.get("chatroomId"),
            createdAt: message.get("createdAt"),
          };

          // Actualizamos el estado con el nuevo mensaje
          setAllMessages((prevMessages) => [...prevMessages, newMsg]);
          setNewMessage((prevState) => [...prevState, newMsg]);
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

  async function sendMessage() {
    const ChatMessage = Parse.Object.extend("chatMessage");
    const message = new ChatMessage();

    message.set("content", newMessage);
    message.set("clientId", "SveOWrOEqL");
    message.set("chatroomId", roomId);
    message.save().catch((error) => {
      console.log("Error al enviar mensaje: ", error);
    });
    setNewMessage("");
  }

  return (
    <div>
      <div
        className="container mt-3 d-flex flex-column"
        style={{
          height: "90vh",
          maxWidth: "600px",
          margin: "0 auto",
          border: "1px solid #ccc",
          borderRadius: "10px",
        }}
      >
        <div
          className="bg-primary text-white p-3 rounded-top text-center"
          style={{ cursor: "pointer" }}
        >
          <h5 className="mb-0">Estas hablando con: {user.username}</h5>
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
              <div key={index} className={`d-flex mb-2 justify-content-end`}>
                <div
                  className={`p-2 rounded-3 bg-primary text-white`}
                  style={{ maxWidth: "75%", wordBreak: "break-word" }}
                >
                  <strong> {msg.clientId}: </strong>
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
