const HeaderNotificationCard = ({ notification }) => {

    const renderClairifyNotification = () => {
        return (
            <div className="d-flex flex-column">
                <div><strong>{notification.fromUser.username}</strong> has requested a clairfication</div>
                <div>Task: {notification.task.name}</div>
            </div>
        );
    }


    switch(notification.type) {
        case 'clairfy':
            return renderClairifyNotification();
        default:
            return '';
    }

};

export default HeaderNotificationCard;