// src/pages/LoginPage.tsx
import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/Auth/login", { email, password });
      login(res.data.token);
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed.");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold">Login</h1>
      <form onSubmit={handleLogin} className="mt-4 space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Login</button>
      </form>
      <a href="/forgot-password" className="text-blue-500 mt-3 block">Forgot Password?</a>
    </div>
  );
};

export default LoginPage;
