import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);   //stores the current authenticated user, initialized to null (no user)
  const [loading, setLoading] = useState(true);  // it tells us whether the authentication status is being determined (e.g., checking if the user is logged in), initialized to true

  return (
    <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// this files main purpose is to create a context for authentication and provide it to the rest of the application.
