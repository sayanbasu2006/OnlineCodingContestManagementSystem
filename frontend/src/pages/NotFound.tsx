import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <div className="not-found-card">
        <div className="not-found-glitch">404</div>
        <h2>Arena Path Lost</h2>
        <p>
          The page you are trying to access does not exist or has been moved. Use the portal
          below to return safely to the Main Arena.
        </p>
        <button onClick={() => navigate("/")} className="btn-primary" style={{ padding: "0.8rem 2.5rem" }}>
          🛸 Go to Dashboard
        </button>
      </div>
    </div>
  );
}
