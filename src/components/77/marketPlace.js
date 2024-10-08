import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

export function MarketPlace() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getAllUsers();
  }, []);

  async function getAllUsers() {
    try {
      const response = await axios.post(
        `http://localhost:2337/server/functions/getAllUsers`,
        {
          page: 1,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": "000",
            "X-Parse-REST-API-Key": "Yzhl06W5O7Vhf8iwlYBQCxs6hY8Fs2PQewNGjsl0",
          },
        }
      );

      console.log("los usuarios", response.data.result.users.users);
      setUsers(response.data.result.users.users);
    } catch (error) {
      console.log(error);
    }
  }

  function openChat(){
    console.log('aqui esta mi logica');
  }

  return (
    <div className="d-flex">
      <div
        className="bg-light border"
        style={{ width: "250px", height: "100vh" }}
      >
        <h5 className="p-3">Usuarios</h5>
        <ul className="list-group list-group-flush">
          {users && users.map((user, index) => (
            <li key={index} className="list-group-item" onClick={openChat} >
              {user.username}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-grow-1 p-3">

        <h1>Bienvenido al MarketPlace</h1>
      </div>
    </div>
  );
}
