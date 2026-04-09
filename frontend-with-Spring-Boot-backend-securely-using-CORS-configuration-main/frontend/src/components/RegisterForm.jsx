import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

const initialForm = {
  name: "",
  email: "",
  password: "",
  mobile: ""
};

function RegisterForm() {
  const navigate = useNavigate();
  const { registerUser } = useAuth();

  const [formData, setFormData] = useState(initialForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim() || !formData.mobile.trim()) {
      return "All fields are required.";
    }

    if (formData.password.length < 8) {
      return "Password must be at least 8 characters.";
    }

    if (!/\d/.test(formData.password) || !/[a-z]/.test(formData.password) || !/[A-Z]/.test(formData.password)) {
      return "Password must include upper, lower, and number.";
    }

    if (!/[^A-Za-z0-9]/.test(formData.password)) {
      return "Password must include a special character.";
    }

    if (!/^\d{10,}$/.test(formData.mobile)) {
      return "Mobile must be at least 10 digits.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await registerUser({
        ...formData,
        mobile: Number(formData.mobile)
      });
      navigate("/login", { replace: true });
    } catch (submitError) {
      const data = submitError.response?.data;
      const message =
        (typeof data === "string" && data) ||
        data?.error ||
        (data && typeof data === "object" ? Object.values(data).join(" ") : "") ||
        "Registration failed.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1>Create account</h1>
        <p>Register to access your dashboard.</p>

        {error ? <div className="alert error">{error}</div> : null}

        <label htmlFor="name">Name</label>
        <input id="name" name="name" value={formData.name} onChange={handleChange} autoComplete="name" />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          autoComplete="email"
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          autoComplete="new-password"
        />

        <label htmlFor="mobile">Mobile</label>
        <input
          id="mobile"
          name="mobile"
          type="tel"
          value={formData.mobile}
          onChange={handleChange}
          autoComplete="tel"
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Register"}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default RegisterForm;


