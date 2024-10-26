import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import ChatDuo from "./chatDuo";

export function MarketPlace() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    getAllUsers();
  }, []);

  async function getAllUsers() {
    try {

      let response = [
        {
          objectId : "zHr45CAaRd",
          username : "test",
          _wperm : [
              "zHr45CAaRd"
          ],
          user_chatrooms : [
          ]
      },
      {
          objectId : "M5xXaVoeLC",
          username : "test2",
          _wperm : [
            "M5xXaVoeLC"
          ],
          user_chatrooms : [
          ]
      }
      ]

      setUsers(response);
    } catch (error) {
      console.log(error);
    }
  }

  function openChat(id) {
    setSelectedUser(id);
    console.log("id", id);

    console.log("aqui esta mi logica");
  }

  return (
    <div className="d-flex">
      <div
        className="bg-light border"
        style={{ width: "250px", height: "100vh" }}
      >
        <h5 className="p-3">Usuarios</h5>
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
        <h1>Bienvenido al MarketPlace</h1>

        {selectedUser != null ? <ChatDuo /> : <h2>Seleccion un usuario</h2>}
      </div>
    </div>
  );
}
