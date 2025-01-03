import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { logout } from "../store/slices/authSlice";

const Header = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth.user);
  //console.log("Header Auth", auth);

  const handleLogout = () => {
    dispatch(logout());
    // Optionally, you can also navigate to the login page or home page
  };

  const renderLoggedIn = () => {
    return (
      <div className="d-flex">
        <li>
          <Link to="/studies" className="nav-link active">My Studies</Link>
        </li>
        {(auth?.role === "facilitator" || auth?.role === "admin") && (
        <li className="nav-item">
          <Link to="/study/new" className="nav-link active">New Study</Link>
        </li>
      )}
        <li className="nav-item dropdown">
        <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
          {auth?.userName || ''}
        </a>
        <ul className="dropdown-menu">
          <li><a className="dropdown-item" href="#">Action</a></li>
          <li><a className="dropdown-item" href="#">Another action</a></li>
          <li><hr className="dropdown-divider" /></li>
          <li><a className="dropdown-item" href="/auth/logout" onClick={handleLogout}>Logout</a></li>
        </ul>
      </li>
      </div>
      
    );
  };

  const renderLoggedOut = () => {
    return (
      <div className="d-flex">
        <li className="nav-item me-2">
          <Link to="/signup" className="nav-link active">Sign Up</Link>
        </li>
        <li className="nav-item">
          <Link to="/login" className="nav-link active">Login</Link>
        </li>
      </div>
    );
  };

  const renderContent = () => {
    //console.log("Render Content Auth State:", auth);
    switch (auth) {
      case null:
        return null;
      case false:
        return renderLoggedOut();
      default:
        return renderLoggedIn();
    }
  };

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <Link to={auth ? "/" : "/login"} className="navbar-brand">
          Feedback System
        </Link>
        <div className="collapse navbar-collapse show">
          <ul className="navbar-nav ms-auto">{renderContent()}</ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;