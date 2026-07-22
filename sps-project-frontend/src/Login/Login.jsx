import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState({ email: "", password: "", general: "" });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setFormError({ ...formError, email: "" });
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setFormError({ ...formError, password: "" });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError({ ...formError, general: "" });

    try {
        await axios.get("http://localhost:8000/sanctum/csrf-cookie", { withCredentials: true });
        const response = await axios.post(
            "http://localhost:8000/api/login",
            { email: email, password: password }, 
            { 
                withCredentials: true, 
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                } 
            }
        );
        localStorage.setItem("API_TOKEN", response.data.token);
        login(response.data.user);
        navigate("/");
    } catch (error) {
        setIsLoading(false);
        if (error.response) {
            if (error.response.status === 422) {
                setFormError({
                    email: error.response.data.errors?.email || "",
                    password: error.response.data.errors?.password || "",
                    general: "Validation failed, check your input.",
                });
            } else if (error.response.status === 401) {
                setFormError({ ...formError, general: "Unauthorized access, please check your credentials." });
            } else if (error.response.status === 400) {
                setFormError({ ...formError, general: "Email or password incorrect." });
            } else {
                setFormError({ ...formError, general: "Something went wrong, please try again later." });
            }
        }
    }
  };

  return (
    <div>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          onChange={handleEmailChange}
          placeholder="Email Address"
          required
        />
        <input
          type="password"
          value={password}
          onChange={handlePasswordChange}
          placeholder="Password"
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Signing In..." : "Sign In"}
        </button>
        {formError.general && <p>{formError.general}</p>}
      </form>
    </div>
  );
}
