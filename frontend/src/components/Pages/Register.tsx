import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = { email, password, confirmPassword };
      const response = await api.post("/Auth/register", payload);

      setSuccess(response.data.message);
      setError("");

      setEmail("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => navigate("/"), 3000);
    } catch (err: any) {
      console.log(err.response);
      setError(err.response?.data?.message || "Registration failed. Try again.");
      setSuccess("");
    }
  };

  return (
    <div>
      <form onSubmit={handleRegister}>
        <h2>Register</h2>

        {error && <p>{error}</p>}
        {success && <p>{success}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button type="submit">Register</button>

        <p>
          Already have an account? <a href="/">Login</a>
        </p>
      </form>
    </div>
  );
};

export default Register;
