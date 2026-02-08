import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthOverlay from "../components/AuthOverlay";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <AuthOverlay title="Welcome Back">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#DC143C] transition-colors"
            placeholder="trader@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#DC143C] transition-colors"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#DC143C] hover:bg-[#b01030] text-white font-semibold py-3 rounded-lg transition-all shadow-[0_0_20px_rgba(220,20,60,0.3)] hover:shadow-[0_0_30px_rgba(220,20,60,0.5)] mt-2"
        >
          Sign In
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-muted">
        Don't have an account?{" "}
        <Link
          to="/account/create"
          className="text-white hover:text-[#DC143C] font-medium transition-colors"
        >
          Create one
        </Link>
      </div>
    </AuthOverlay>
  );
}
