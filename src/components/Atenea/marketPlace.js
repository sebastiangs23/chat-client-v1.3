import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import ChatDuo from "./chatDuo";

export function MarketPlace() {
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    getAllUsers();
  }, []);

  async function getAllCompanies() {
    try {
      //Aqui se traeran todas las compañias para chatear con ellas
    } catch (error) {
      console.log(error);
    }
  }

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
            "X-Parse-Application-Id": "008",
            "X-Parse-REST-API-Key": "Yzhl06W5O7Vhf8iwlYBQCxs6hY8Fs2PQewNGjsl0",
          },
        }
      );

      setUsers(response.data.result.users);
    } catch (error) {
      console.log(error);
    }
  }

  function openChat(id) {
    setSelectedUser(id);
  }

  async function createAlliance(company){
    alert(`Crearas una aliance con la empresa "${company.username}"`)
  }

  return (
    <div className="d-flex">
      <div
        className="bg-light border"
        style={{ width: "250px", height: "100vh" }}
      >
        <h5 className="p-3">Usuarios</h5>
        <ul className="list-group list-group-flush">
          {users.length > 1 &&
            users.map((user, index) => (
              <li
                key={index}
                className="list-group-item"
                onClick={() => openChat(user)}
              >
                {user.username}
              </li>
            ))}
        </ul>
        <h5 className="p-3">Compañias</h5>
      </div>
      <div className="flex-grow-1 p-3">
        <h1>Chatea con otras compañias!</h1>

        {selectedUser != null ? (
          <div class="p-3 d-flex justify-content-center">
            <button class="btn btn-success" onClick={() => createAlliance(selectedUser)}>Crear alianza </button>
          </div>
        ) : (
          <></>
        )}
        {selectedUser != null ? (
          <ChatDuo userSelected={selectedUser} />
        ) : (
          <h2>Selecciona una compañia</h2>
        )}
      </div>
    </div>
  );
}
