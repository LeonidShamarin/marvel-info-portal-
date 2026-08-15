import { Link } from "react-router-dom";
import ErrorMessage from "../errorMessage/ErrorMessage";

const NotFoundPage = () => {
  return (
    <div style={{ textAlign: "center", padding: "40px 0" }}>
      <ErrorMessage />
      <p style={{ fontWeight: "bold", fontSize: "24px", marginTop: "20px" }}>
        Page doesn't exist
      </p>
      <Link
        to="/"
        style={{ display: "inline-block", marginTop: "20px", fontSize: "20px" }}
      >
        Back to main page
      </Link>
    </div>
  );
};

export default NotFoundPage;
