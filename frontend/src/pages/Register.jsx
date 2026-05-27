import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) {
      toast.error("All fields required");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await register(form);
      toast.success("Account created!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const strength = form.password.length === 0 ? 0
    : form.password.length < 6 ? 1
    : form.password.length < 10 ? 2
    : 3;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-stone-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="font-display text-lg font-medium text-amber-500 tracking-wide">
              TaskFlow
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Create account</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Start organizing your work
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-medium uppercase tracking-wider">
              Username
            </label>
            <input
              name="username"
              className="input"
              placeholder="your_handle"
              value={form.username}
              onChange={handleChange}
              autoFocus
              minLength={3}
              maxLength={20}
            />
            <p className="text-xs text-[var(--text-muted)] mt-1">3–20 characters</p>
          </div>

          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-medium uppercase tracking-wider">
              Email
            </label>
            <input
              name="email"
              type="email"
              className="input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-medium uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPass ? "text" : "password"}
                className="input pr-10"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
            {/* Password strength */}
            {form.password.length > 0 && (
              <div className="mt-2 flex gap-1">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      i <= strength
                        ? strength === 1 ? "bg-red-500"
                          : strength === 2 ? "bg-amber-500"
                          : "bg-emerald-500"
                        : "bg-[var(--border)]"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating account…
              </span>
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--text-secondary)] mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-amber-500 hover:text-amber-400 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
