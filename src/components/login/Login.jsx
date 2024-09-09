import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";

export function Login() {
  const navigate = useNavigate();
  const { loginUser } = useUser(); // Usamos el contexto para actualizar el estado global
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
          "Content-Type": "application/json",
          "X-Parse-REST-API-Key": "Yzhl06W5O7Vhf8iwlYBQCxs6hY8Fs2PQewNGjsl0",
          "X-Parse-Application-Id": "000",
        },
        body: JSON.stringify(data),
      });

      let result = await response.json();

      if (result && result.sessionToken) {
        // Guardamos el username y el token en el contexto
        const userData = {
          username: result.username,
          sessionToken: result.sessionToken,
        };
        loginUser(userData);
        // También guardamos los datos en sessionStorage para persistencia
        localStorage.setItem("user", JSON.stringify(userData));
        navigate("/create-chatroom"); // Redirigimos al crear chatroom
      } else {
        alert("Credenciales incorrectas");
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
          <h2>Usuario</h2>
          <input type="text" onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <h2>Contraseña</h2>
          <input
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>
      <button onClick={signIn}>INGRESAR</button>
    </div>
  );
}
