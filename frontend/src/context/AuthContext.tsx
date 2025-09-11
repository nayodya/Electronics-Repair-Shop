// src/context/AuthContext.tsx
import { createContext, useState, useEffect, type ReactNode } from "react";
import {jwtDecode} from "jwt-decode";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: { email: string; role: string } | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);

  useEffect(() => {
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        setUser({ email: decoded.email, role });
      } catch {
        setUser(null);
      }
    }
  }, [token]);

  const login = (jwt: string) => {
    localStorage.setItem("token", jwt);
    setToken(jwt);

    const decoded: any = jwtDecode(jwt);
    const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    // Navigate by role
    if (role === "Customer") navigate("/customer/dashboard");
    else if (role === "Technician") navigate("/technician/dashboard");
    else if (role === "Admin") navigate("/admin/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
