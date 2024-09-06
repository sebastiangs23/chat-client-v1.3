import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function Login({ onLogin }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function signIn() {
    try {
      let data = {
        username: username,
        password: password,
      };

      const response = await fetch(`http://localhost:2337/server/login`, {
        method: "POST",
        headers: {
          "X-Parse-REST-API-Key": "Yzhl06W5O7Vhf8iwlYBQCxs6hY8Fs2PQewNGjsl0",
          "X-Parse-Application-Id": "000",
        },
        body: JSON.stringify(data),
      });

      let result = await response.json();

      if (result.objectId) {
        sessionStorage.setItem("idUser", result.objectId);
        sessionStorage.setItem("sessionToken", result.sessionToken);
        sessionStorage.setItem("username", result.username);

        onLogin(); // Actualiza el estado de autenticación en App
        navigate("/create-chatroom"); // Redirige al usuario a la página principal después de iniciar sesión
      } else {
        alert('Credenciales incorrectas');
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div>
      <h1>LOGIN</h1>
      <div>
        <div>
          <h2>Correo</h2>
          <input type="text" onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <h2>Contraseña</h2>
          <input type="password" onChange={(e) => setPassword(e.target.value)} />
        </div>
      </div>
      <button onClick={signIn}>INGRESAR</button>
    </div>
  );
}
