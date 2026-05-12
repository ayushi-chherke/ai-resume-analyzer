import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, getMe } from "../services/auth.api";

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  const { user, setUser, loading, setLoading } = context;

  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    try {
      const data = await login({ email, password });

      console.log("LOGIN RESPONSE:", data); // 👈 DEBUG

      if (data && data.user) {
        setUser(data.user);
        localStorage.setItem("token", data.token); // if exists
      } else {
        console.error("Invalid login response:", data);
      }
    } catch (err) {
      console.error("Login error:", err);
      setUser(null); // ✅ prevent crash
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async ({ username, email, password }) => {
    setLoading(true);
    try {
      const data = await register({ username, email, password });

      if (data && data.user) {
        setUser(data.user);
      } else {
        console.error("Invalid register response:", data);
      }
    } catch (err) {
      console.error("Register error:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      setUser(null);
      localStorage.removeItem("token");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getAndSetUser = async () => {
      try {
        const data = await getMe();

        if (data && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("GetMe error:", err);
        setUser(null); // ✅ VERY IMPORTANT
      } finally {
        setLoading(false);
      }
    };

    getAndSetUser();
  }, []);

  return { user, loading, handleRegister, handleLogin, handleLogout };
};