import { Link, useNavigate } from "react-router-dom";
import { useFetchUserQuery } from "../store";
import { GoBell } from "react-icons/go";
import HeaderNotificationCard from "./tools/HeaderNotificationCard";

const Header = () => {
  const navigate = useNavigate();
  const { data, error, isLoading } = useFetchUserQuery();
  const handleLogout = () => {
    navigate('/');
  };

  const renderLoggedIn = () => {
    if (!data) {
      return null; // or a loading spinner, or any placeholder content
    }
    return (
      <div className="d-flex align-items-center justify-content-center">
          {(data?.role === "facilitator" || data?.role === "admin") && (
              <li className="nav-item">
                  <Link to="/study/new" className="nav-link active">New Study</Link>
              </li>
          )}
          <li className="nav-item dropdown">
              <div className="position-relative notification-icon" data-bs-toggle="dropdown" aria-expanded="false">
                  <GoBell className="text-dark" />
                  {data.notifications.length > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                          {data.notifications.length}
                          <span className="visually-hidden">unread notifications</span>
                      </span>
                  )}
              </div>
              <ul className="dropdown-menu dropdown-menu-end p-0 notification-dropdown">
                  <li className="card notification-card">
                      <div className="card-body">
                          <h5 className="card-title">Notifications</h5>
                          <ul className="list-group list-group-flush">
                              {data.notifications.map((notification, index) => {
                                  return (
                                      <li key={index} className="list-group-item" onClick={() => navigate(`/discussion/${notification.task._id}`)}>
                                          <HeaderNotificationCard notification={notification} />
                                      </li>
                                  );
                              })}
                          </ul>
                          <div className="card-footer d-flex justify-content-center align-items-center w-100">
                              <button className="btn btn-secondary" onClick={() => navigate('/notifications')}>See All</button>
                          </div>
                      </div>
                  </li>
              </ul>
          </li>
      
          <li className="nav-item dropdown d-flex align-items-center">
              <a className="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  {data.avatar ? <img src={data.avatar} alt={`${data.username}'s avatar`} className="avatar-img-header mr-2" /> : data.username}
              </a>
              <ul className="dropdown-menu dropdown-menu-end">
                  <li className="dropdown-item" href="/home">{data.username}</li>
                  <li className="dropdown-item" href="/home">Home</li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><a className="dropdown-item" href="/auth/logout" onClick={handleLogout}>Logout</a></li>
              </ul>
          </li>
      </div>
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