const HeaderNotificationCard = ({ notification, user }) => {

    const renderClairifyNotification = () => {

        if (user.role === 'facilitator') {
            return (
                <div className="d-flex flex-column">
                    <div><strong>{notification.fromUser.username}</strong> has submitted a clarification</div>
                </div>
            );
        } else if (user.role === 'participant') {
            return (
                <div className="d-flex flex-column">
                    { }
                    <div><strong>{notification.fromUser.username}</strong> has requested a clairfication</div>
                </div>
            );

        }



    }


    switch (notification.type) {
        case 'clarify':
            return renderClairifyNotification();
        default:
            return '';
    }

};

export default HeaderNotificationCard;