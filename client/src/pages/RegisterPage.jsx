import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthForm from "../features/auth/AuthForm.jsx";
import { useAuth } from "../features/auth/AuthContext.jsx";

const fields = [
  { name: "name", label: "Name", type: "text", autoComplete: "name" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "password", label: "Password", type: "password", autoComplete: "new-password" },
];

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [values, setValues] = useState({ name: "", email: "", password: "" });
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
      await register(values);
      navigate("/profile");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <main>
      <h1>Create account</h1>
      <AuthForm
        error={error}
        fields={fields}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel="Create account"
        values={values}
      />
      <p>
        <Link to="/login">Use an existing account</Link>
      </p>
    </main>
  );
}

export default RegisterPage;
