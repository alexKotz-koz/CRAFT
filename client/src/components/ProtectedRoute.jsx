import { Navigate } from "react-router-dom";
import { useFetchUserQuery } from "../store";
import { Spinner } from "reactstrap";

const ProtectedRoute = ({ children }) => {
    const { data: user, isLoading } = useFetchUserQuery();
    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner color="primary" />
            </div>
        );
    }
        if (!user || !user._id) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
