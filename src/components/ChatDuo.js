import { useEffect, useState, useRef } from "react";
import Parse from "parse";
import { useUser } from "../context/UserContext";

Parse.initialize("106", "r:0acbe33d79ac68d743ef2a5406a9cd92");
Parse.serverURL = "http://localhost:2337/server";
// const sessionToken = "r:220a7f6a212a581d7d9401fd6446330c";

const ChatDuo = ({ userProps }) => {
  const [newMessage, setNewMessage] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [roomId, setRoomId] = useState("");
  const [userSelected, setUserSelected] = useState("");
  const [userLogged, setUserLogged] = useState("");

  const subscriptionMessageRef = useRef(null);

  // Este useEffect crea o encuentra la sala
  useEffect(() => {
    const initializeChatRoom = async () => {
      let user1 = await findUserByName(userProps.username);
      setUserSelected(user1);

      const storedUser = localStorage.getItem("user");
      const userParsed = JSON.parse(storedUser);

      const user2 = await findUserByName(userParsed.username);
      setUserLogged(user2);

      createOrFindDuoRoom(user1, user2);
    };

    initializeChatRoom();
  }, []);

  // Este useEffect se ejecuta cuando `chatRoomId` tiene un valor
  useEffect(() => {
    if (!roomId) return;

    const fetchMessagesAndSubscribe = async () => {
      try {

        console.log('roomId --> ', roomId);
        
        // Crear una conexión con la colección "Chat_Message"
        const ChatMessage = Parse.Object.extend("chatMessage");
        const query = new Parse.Query(ChatMessage);
        query.equalTo("chatRoomId", roomId);

        const data = await query.find();

        console.log('data: ', data);
        
        if (data) {
          const messagesHistory = data
            .filter((message) => message.get("content") !== "")
            .map((message) => ({
              content: message.get("content"),
              userId: message.get("userId"),
              chatRoomId: message.get("chatRoomId"),
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
            userId: message.get("userId"),
            chatRoomId: message.get("chatRoomId"),
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
      // let members = [userLogged, userSelected];
      let members = [user1, user2];

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
            "X-Parse-Application-Id": "106",
            "X-Parse-REST-API-Key": "r:06673cb764f52af0f7221e15945e6376", // hacerlo dinámico
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();
      console.log('result: ', result);
      
      const chatRoomId = result.result.data.chatroom.objectId;

      // Aquí seteamos el roomId una vez que lo obtengamos
      setRoomId(chatRoomId);
    } catch (error) {
      console.log("Error creando o encontrando la sala:", error);
    }
  }

  async function findUserByName(name) {
    try {
      let data = {
        userName: name,
      };

      const response = await fetch(
        `http://localhost:2337/server/functions/getUserByUserName`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": "106",
            "X-Parse-REST-API-Key": "Yzhl06W5O7Vhf8iwlYBQCxs6hY8Fs2PQewNGjsl0",
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      console.log(result.result.user.objectId);

      return result.result.user.objectId;
    } catch (error) {
      console.log(error);
    }
  }

  async function sendMessage() {
    try {
      if (!userLogged || !roomId) {
        console.log("Error: userLogged o roomId no están definidos.");
        return;
      }
  
      // Crear un nuevo mensaje en chatMessage
      const ChatMessage = Parse.Object.extend("chatMessage");
      const message = new ChatMessage();
      message.set("content", newMessage);
      message.set("userId", userLogged);
      message.set("chatRoomId", roomId);
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
            Chat Duo: {userProps ? userProps.username : ""}
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
                  msg.userId === userLogged
                    ? "justify-content-end"
                    : "justify-content-start"
                }`}
              >
                <div
                  className={`p-2 rounded-3 ${
                    msg.userId === userLogged
                      ? "bg-primary text-white"
                      : "bg-light text-dark"
                  }`}
                  style={{ maxWidth: "75%", wordBreak: "break-word" }}
                >
                  <strong>
                    {" "}
                    {userLogged == msg.userId
                      ? "Tú"
                      : userProps.username}:{" "}
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
