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
      // const response = await axios.post(
      //   `http://localhost:2337/server/functions/getAllUsers`,
      //   {
      //     page: 1,
      //   },
      //   {
      //     headers: {
      //       "Content-Type": "application/json",
      //       "X-Parse-Application-Id": "000",
      //       "X-Parse-REST-API-Key": "Yzhl06W5O7Vhf8iwlYBQCxs6hY8Fs2PQewNGjsl0",
      //     },
      //   }
      // );

      // console.log("los usuarios", response.data.result.users.users);
      // setUsers(response.data.result.users.users);

      let response = [
        {
          objectId : "F7YCjUfoT1",
          username : "F7YCjUfoT1",
          _hashed_password : "$2y$10$obM66PXjDc9n2dVXddx4nub/T8kzCRbwYHOjfqS6kGFOvH3uYs5W2",
          _wperm : [
              "94c56DabuS"
          ],
          user_chatrooms : [
          ]
      },
      {
          objectId : "lR5CWue9sZ",
          username : "lR5CWue9sZ",
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

        {selectedUser != null ? <ChatDuo userProps={"Yo"} /> : <h2>Seleccion un usuario</h2>}
      </div>
    </div>
  );
}
