import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>; // Returns success/fail
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // Load active session
  useEffect(() => {
    const storedSession = localStorage.getItem("marketpulse_active_session");
    if (storedSession) {
      setUser(JSON.parse(storedSession));
    }
  }, []);

  const signup = async (name: string, email: string, password: string) => {
    // 1. Get existing users
    const existingUsersStr = localStorage.getItem("marketpulse_users_db");
    const users = existingUsersStr ? JSON.parse(existingUsersStr) : [];

    // 2. Check if email exists
    if (users.find((u: any) => u.email === email)) {
      alert("Email already registered");
      return false;
    }

    // 3. Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password, // In a real app, never store passwords plain text!
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    };

    // 4. Save to "DB"
    users.push(newUser);
    localStorage.setItem("marketpulse_users_db", JSON.stringify(users));

    // 5. Auto Login
    const sessionUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      avatar: newUser.avatar,
    };
    setUser(sessionUser);
    localStorage.setItem(
      "marketpulse_active_session",
      JSON.stringify(sessionUser),
    );

    navigate("/dashboard");
    return true;
  };

  const login = async (email: string, password: string) => {
    // 1. Get users
    const existingUsersStr = localStorage.getItem("marketpulse_users_db");
    const users = existingUsersStr ? JSON.parse(existingUsersStr) : [];

    // 2. Find user
    const foundUser = users.find(
      (u: any) => u.email === email && u.password === password,
    );

    if (foundUser) {
      const sessionUser = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        avatar: foundUser.avatar,
      };
      setUser(sessionUser);
      localStorage.setItem(
        "marketpulse_active_session",
        JSON.stringify(sessionUser),
      );
      navigate("/dashboard");
      return true;
    } else {
      alert("Invalid email or password");
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("marketpulse_active_session");
    navigate("/");
  };

  return (
    <AuthContext.Provider
      value={{ user, login, signup, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
