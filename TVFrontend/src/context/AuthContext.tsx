import React, { createContext, useEffect, useState, type ReactNode } from "react";

export type User = {
  IdUsuario: number;
  NombreCompleto?: string;
  Correo?: string;
  IdRol: number; // 1=admin, 2=empleado
};

type AuthContextType = {
  user: User | null;
  setUser: (u: User | null) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem("usuario");
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    // mantener sincronía localStorage <-> contexto
    if (user) {
      localStorage.setItem("usuario", JSON.stringify(user));
    } else {
      localStorage.removeItem("usuario");
      localStorage.removeItem("token");
    }
  }, [user]);

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
