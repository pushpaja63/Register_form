import React, { useState } from "react";
import "./App.css";

export default function App() {
  const [values, setValues] = useState({
    username: "",
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // general success/error message

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setMessage(null);
  };

  const validate = () => {
    const errs = {};
    const username = values.username.trim();
    const email = values.email.trim();
    const password = values.password;

    if (!username) errs.username = "Username is required";
    else if (username.length < 3) errs.username = "Username must be at least 3 characters";

    if (!email) errs.email = "Email is required";
    // simple email check — fine for client-side
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email";

    if (!password) errs.password = "Password is required";
    else if (password.length < 8) errs.password = "Password must be at least 8 characters";

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length !== 0) return;

    setLoading(true);
    const payload = {
      username: values.username,
      email: values.email,
      password: values.password
    };

    try {
      console.log("Sending register request:", payload);
      const res = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      // read JSON if server responded with JSON
      const isJson = res.headers.get("content-type")?.includes("application/json");
      const data = isJson ? await res.json() : null;

      console.log("Response status:", res.status, "body:", data);

      if (!res.ok) {
        // Use server-provided message if available
        const serverMsg = data?.message || `Request failed with status ${res.status}`;
        setMessage({ type: "error", text: serverMsg });
      } else {
        // success path
        if (data?.token) {
          localStorage.setItem("token", data.token);
          if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
          setMessage({ type: "success", text: "Signup successful!" });
          setValues({ username: "", email: "", password: "" });
          setErrors({});
        } else {
          setMessage({ type: "error", text: "Unexpected response from server" });
        }
      }
    } catch (err) {
      console.error("Network error:", err);
      setMessage({
        type: "error",
        text: "Network error — is the backend running and CORS enabled?"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <form id="form" onSubmit={handleSubmit} noValidate>
        <h1>Registration form</h1>

        {message && (
          <div className={`form-message ${message.type === "error" ? "error" : "success"}`}>
            {message.text}
          </div>
        )}

        <div className={`input-control ${errors.username ? "error" : values.username ? "success" : ""}`}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="Username"
            value={values.username}
            onChange={handleChange}
            aria-invalid={!!errors.username}
            autoComplete="username"
          />
          {errors.username && <div className="error">{errors.username}</div>}
        </div>

        <div className={`input-control ${errors.email ? "error" : values.email ? "success" : ""}`}>
          <label htmlFor="email">Email Id</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            value={values.email}
            onChange={handleChange}
            aria-invalid={!!errors.email}
            autoComplete="email"
          />
          {errors.email && <div className="error">{errors.email}</div>}
        </div>

        <div className={`input-control ${errors.password ? "error" : values.password ? "success" : ""}`}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            value={values.password}
            onChange={handleChange}
            aria-invalid={!!errors.password}
            autoComplete="new-password"
          />
          {errors.password && <div className="error">{errors.password}</div>}
        </div>

        <div className="buttons">
          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Signing up..." : "Sign up"}
          </button>

          <button
            type="button"
            className="btn secondary"
            onClick={() => {
              setValues({ username: "", email: "", password: "" });
              setErrors({});
              setMessage(null);
            }}
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}
