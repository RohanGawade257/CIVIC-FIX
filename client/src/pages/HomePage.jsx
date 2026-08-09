import { Link } from "react-router-dom";

function HomePage() {
  return (
    <main>
      <h1>CivicFix AI</h1>
      <p>Report civic issues and track accountable resolution.</p>
      <nav aria-label="Account">
        <Link to="/register">Create account</Link>
        <Link to="/login">Login</Link>
        <Link to="/profile">Profile</Link>
      </nav>
    </main>
  );
}

export default HomePage;
