import { Link, useNavigate } from "react-router-dom";
import { useFetchUserQuery } from "../store";

const Header = () => {
  const navigate = useNavigate();
  const { data, error, isLoading } = useFetchUserQuery();

  const handleLogout = () => {
    navigate('/');
    // Optionally, you can also navigate to the login page or home page
  };

  const renderLoggedIn = () => {
    return (
      <>
        <li className="nav-item">
          <Link to='/home' className="nav-link active">Home</Link>
        </li>
        {(data?.role === "facilitator" || data?.role === "admin") && (
          <li className="nav-item">
            <Link to="/study/new" className="nav-link active">New Study</Link>
          </li>
        )}
        <li className="nav-item dropdown">
          <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            {data?.username || ''}
          </a>
          <ul className="dropdown-menu">
            <li><a className="dropdown-item" href="/test">Test</a></li>
            <li><a className="dropdown-item" href="#">Another action</a></li>
            <li><hr className="dropdown-divider" /></li>
            <li><a className="dropdown-item" href="/auth/logout" onClick={handleLogout}>Logout</a></li>
          </ul>
        </li>
      </>
    );
  };

  const renderLoggedOut = () => {
    return (
      <>
        <li className="nav-item">
          <Link to="/login" className="nav-link active">Login</Link>
        </li>
        <li className="nav-item">
          <Link to="/signup" className="nav-link active">Sign Up</Link>
        </li>
      </>
    );
  };

  const renderContent = () => {
    switch (data) {
      case null:
        return renderLoggedOut();
      default:
        return renderLoggedIn();
    }
  };

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <Link to={data ? "/home" : "/"} className="navbar-brand">
          CRAFT
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">{renderContent()}</ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;