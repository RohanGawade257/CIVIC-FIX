import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthForm from "../features/auth/AuthForm.jsx";
import { useAuth } from "../features/auth/AuthContext.jsx";

const fields = [
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "password", label: "Password", type: "password", autoComplete: "current-password" },
];

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [values, setValues] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  function handleChange(event) {
    setValues((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      await login(values);
      navigate("/profile");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <main>
      <h1>Login</h1>
      <AuthForm
        error={error}
        fields={fields}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel="Login"
        values={values}
      />
      <p>
        <Link to="/register">Create an account</Link>
      </p>
    </main>
  );
}

export default LoginPage;
