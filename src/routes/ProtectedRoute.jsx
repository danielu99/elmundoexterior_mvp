import {
    Navigate
} from "react-router-dom";

function ProtectedRoute({
    children,
    allowedRoles
}) {

    const token =
        localStorage.getItem(
            "authToken"
        );

    const role =
        localStorage.getItem(
            "role"
        );

    if (!token) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    if (
        allowedRoles &&
        !allowedRoles.includes(role)
    ) {

        return (
            <Navigate
                to="/reports"
                replace
            />
        );
    }

    return children;
}

export default ProtectedRoute;