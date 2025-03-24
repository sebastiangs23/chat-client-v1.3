import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import ChatDuo from "./chatDuo";

export function CreateChatDuo() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    getAllUsers();
  }, []);

  async function getAllUsers() {
    try {
      const response = await axios.post(
        `http://localhost:2337/server/functions/getAllUsers`,
        {
          page: 2,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": "005",
            "X-Parse-REST-API-Key": "Yzhl06W5O7Vhf8iwlYBQCxs6hY8Fs2PQewNGjsl0",
          },
        }
      );

      console.log("los usuarios", response.data.result.users);
      setUsers(response.data.result.users);

    } catch (error) {
      console.log(error);
    }
  }

  function openChat(id) {
    setSelectedUser(id);
  }

  return (
    <div className="d-flex">
      <div
        className="bg-light border"
        style={{ width: "250px", height: "100vh" }}
      >
        <h5 className="p-3">Selecciona un usuario con el que quieras chatear</h5>
        <ul className="list-group list-group-flush">
          {users &&
            users.map((user, index) => (
              <li
                key={index}
                className="list-group-item"
                onClick={() => openChat(user.objectId)}
              >
                {user.username}
              </li>
            ))}
        </ul>
      </div>
      <div className="flex-grow-1 p-3">
        <h1>PRUEBA CHAT DUO</h1>

        <h3>PASOS:</h3>
        <span>1) Al seleccionar un usuario, se create un 'chat' con el en la bd, sin embargo si ya existe uno, solo lo trae</span>
        <br/>
        <span>2) Al aperturar el modal del chat, se traera los mensajes con Livequery </span>

        {selectedUser != null ? <ChatDuo userProps={selectedUser} /> : <h2>Seleccion un usuario</h2>}
      </div>
    </div>
  );
}
