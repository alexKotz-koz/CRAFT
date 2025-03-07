const HeaderNotificationCard = ({ notification, currentUserIsParticipant }) => {

    const renderClairifyNotification = () => {

        if (!currentUserIsParticipant) {
            return (
                <div className="d-flex flex-column cursor-pointer" style={{whiteSpace: 'wrap'}}>
                    <div><strong>{notification.fromUser.username}</strong> has submitted a clarification</div>
                </div>
            );
        } else if (currentUserIsParticipant) {
            return (
                <div className="d-flex flex-column cursor-pointer" style={{whiteSpace: 'wrap'}}>

                    <div><strong>{notification.fromUser.username} </strong> has requested a clairfication</div>
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