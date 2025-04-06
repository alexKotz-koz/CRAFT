import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFetchUserQuery } from "../store";
import { GoBell, GoBug } from "react-icons/go";
import { Spinner } from "reactstrap";
import HeaderNotificationCard from "./tools/HeaderNotificationCard";
import ClarificationModal from "./tools/modals/ClarificationModal";
import { useLogoutUserMutation } from "../store";


const Header = ({ user }) => {
    const navigate = useNavigate();
    const { data, error, isLoading } = useFetchUserQuery();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedStudyResponseId, setSelectedStudyResponseId] = useState("");
    const [notification, setNotification] = useState({});
    const [logoutUser, { isLoading: isLoadingLogoutUser, error: errorLogoutUser }] = useLogoutUserMutation();

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner color="primary" />
            </div>
        );
    }

    if (error) {
        return <div>Error: {error?.data.error}</div>;
    }
    const handleLogout = async () => {
        try {
            await logoutUser().unwrap(); 
            navigate('/login'); 
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };
    //console.log("Header Data: ", data)
    //console.log("Header -> user:", user)

    const renderClarificationModal = (studyResponseId, notification) => {
        setSelectedStudyResponseId(studyResponseId);
        setNotification(notification);
        setModalOpen(!modalOpen);
    };

    const renderNotificationCardStyle = (notification) => {
        if (notification.status === 'clarify-pending-approval') {
            return 'list-group-item badge text-bg-warning rounded-2'
        } else {
            return 'list-group-item badge border border-dark-subtle rounded-2'
        }
    }

    const renderLoggedIn = () => {
        if (!data) {
            return null;
        }

        let unreadNotificationCount = 0;

        data.notifications.map((notification) => {
            if (notification.status === 'clarify-pending-approval') {
                unreadNotificationCount += 1;
            }
        });

        const isParticipant = user.role !== 'facilitator' && user.role !== 'admin';


        return (
            <div className="d-flex align-items-center justify-content-center">
                <li className="nav-item ms-3 me-3">
                    <a
                        href="https://forms.gle/3E1bLCKU7Teom9Ve9"
                        target="_blank"
                        rel="noopener noreferrer" //https://stackoverflow.com/questions/50709625/link-with-target-blank-and-rel-noopener-noreferrer-still-vulnerable
                        style={{ fontSize: "1.15rem" }}
                    >
                        <GoBug className="text-dark" />
                    </a>
                </li>
                {(data?.role === "facilitator" || data?.role === "admin") && (
                    <li className="nav-item">
                        <Link to="/study/new" className="nav-link active">New Study</Link>
                    </li>
                )}
                <li className="nav-item dropdown">
                    <div className="position-relative notification-icon" data-bs-toggle="dropdown" aria-expanded="false">
                        <GoBell className="text-dark" />
                        { // if the user has unread notifications show the red notification bubble ontop of the bell
                            (data.notifications.length > 0 && unreadNotificationCount !== 0) && (
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                    {unreadNotificationCount}
                                    <span className="visually-hidden">unread notifications</span>
                                </span>
                            )
                        }
                    </div>
                    <ul className="dropdown-menu dropdown-menu-end p-0 notification-dropdown">
                        <li className='card notification-card'>
                            <div className="card-body">
                                <h5 className="card-title">Notifications</h5>
                                <ul className="list-group list-group-flush">
                                    {data.notifications.map((notification, index) => {
                                        return (
                                            <li
                                                key={index}
                                                className={renderNotificationCardStyle(notification)}
                                                onClick={() => renderClarificationModal(notification.comment ? notification.comment._id: notification.initialResponse, notification)}
                                            >
                                                <HeaderNotificationCard notification={notification} currentUserIsParticipant={isParticipant} />
                                            </li>
                                        );
                                    })}
                                </ul>
                                {/*
                                  <div className="card-footer d-flex justify-content-center align-items-center w-100">
                                    <button className="btn btn-secondary" onClick={() => navigate('/notifications')}>See All</button>
                                </div>  
                                */}
                                
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
                        <li><a className="dropdown-item" onClick={handleLogout}>Logout</a></li>
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
            {modalOpen &&
                <ClarificationModal
                    isOpen={modalOpen}
                    toggle={renderClarificationModal}
                    selectedStudyResponseId={selectedStudyResponseId}
                    notification={notification}

                />
            }

        </nav>
    );
};

export default Header;