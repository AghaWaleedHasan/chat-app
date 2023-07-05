import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../utils/store";

const LoginPage = () => {
  const [authState, setAuthState] = React.useState("signup");

  const token = useAuthStore((state) => state.token);
  const setToken = useAuthStore((state) => state.setToken);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const navigate = useNavigate();

  React.useEffect(() => {
    console.log("token: ", token);
    if (token !== "") {
      navigate("/chats");
    }
  });

  const handleAuth = async () => {
    const username =
      authState === "signup" ? document.getElementById("username").value : null;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    var config = {
      username: username,
      email: email,
      password: password,
    };

    await axios
      .post(`http://localhost:3000/${authState}`, config)
      .then((res) => {
        setToken(res.data.token);
        setUser(res.data);
      });
  };

  return (
    <div className=" h-screen flex justify-center items-center">
      <div className=" flex flex-col justify-center items-center space-y-6 border border-gray-200 p-6">
        <div className=" flex space-x-4">
          <span
            className=" cursor-pointer hover:text-gray-400"
            onClick={() => setAuthState("signup")}
          >
            Signup
          </span>
          <span
            className=" cursor-pointer hover:text-gray-400"
            onClick={() => setAuthState("login")}
          >
            Login
          </span>
        </div>
        <div className=" flex flex-col space-y-2">
          {authState === "signup" ? (
            <input
              type="text"
              placeholder="username"
              name="username"
              id="username"
              className=" focus:outline-none"
            />
          ) : null}
          <input
            className=" focus:outline-none"
            type="text"
            placeholder="email"
            name="email"
            id="email"
          />
          <input
            className=" focus:outline-none"
            type="password"
            placeholder="password"
            name="password"
            id="password"
          />
        </div>

        <button
          type="submit"
          onClick={() => handleAuth()}
          className=" border border-gray-600 hover:border-gray-400 hover:bg-blue-200 px-6 py-2"
        >
          {authState}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
