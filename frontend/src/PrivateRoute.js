import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
    const role = localStorage.getItem("role");
    return role === "admin" ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
