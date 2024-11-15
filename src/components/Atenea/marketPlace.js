import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import ChatDuo from "./chatDuo";

export function MarketPlace() {
  const [companies, setCompanies] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);

  useEffect(() => {
    getAllCompanies();
  }, []);

  async function getAllCompanies() {
    try {
      const response = await axios.post(
        `http://localhost:2337/server/functions/getAllCompanies`,
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

      console.log("COMPAÑIAS -->", response.data);
      setCompanies(response.data.result.companies);
    } catch (error) {
      console.log(error);
    }
  }

  function openChat(id) {
    // setSelectedUser(id);
    setSelectedCompany(id);
  }

  return (
    <div className="d-flex">
      <div
        className="bg-light border"
        style={{ width: "250px", height: "100vh" }}
      >
        <h5 className="p-3">Compañias</h5>
        <ul>
          {companies &&
            companies.map((company, index) => (
              <li
                key={index}
                className="list-group-item"
                onClick={() => openChat(company)}
              >
                {company.name} / {company.objectId}
              </li>
            ))}
        </ul>
      </div>
      <div className="flex-grow-1 p-3">
        <h1>Chatea con otras compañias!</h1>

        {selectedCompany != null ? (
          <ChatDuo companySelected={selectedCompany} />
        ) : (
          <h2>Selecciona una compañia</h2>
        )}
      </div>
    </div>
  );
}
