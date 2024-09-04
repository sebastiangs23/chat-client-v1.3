import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

  useEffect(() => {
    // signIn();
  }, []);

  async function signIn() {
    try {
      let data = {
        username: email,
        password: password,
      };

      console.log(data)

      const response = await fetch(
        `http://localhost:2337/server/login`,
        {
          method: "POST",
          headers: {
            "X-Parse-REST-API-Key": "Yzhl06W5O7Vhf8iwlYBQCxs6hY8Fs2PQewNGjsl0",
            "X-Parse-Application-Id": "000",
          },
          body: JSON.stringify(data)
        },
      )
      
      let result = await response.json();
      console.log(result);

      sessionStorage.setItem("idUser", result.objectId);
      sessionStorage.setItem("sessionToken", result.sesssionToken);

      if(result.objectId){
        alert('Se logeo con exito')
        navigate("/join-chat")
      }else {
        alert('No se quien eres ');
      }

    } catch (error) {
      console.log(error);
    }
  }

  function handleChangeEmail(e){
    setEmail(e.target.value)
  }

  function handleChangePassword(e){
    setPassword(e.target.value)
  }


  return (
    <div>
      <h1>LOGIN</h1>

      <div>
        <div>
            <h2>correo</h2>
            <input type="text" onChange={(e) => handleChangeEmail(e)} />
        </div>

        <div>
            <h2>password</h2>
            <input type="password" onChange={(e) => handleChangePassword(e)} />
        </div>
      </div>

      <button onClick={() => signIn()} >INGRESAR</button>
    </div>
  );
}
