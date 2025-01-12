const InitialResponse = ({ username, dateCreated, response }) => {
    return (
        <div className="card mb-3">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                    <h5 className="card-title mb-0">{username.username}</h5>
                    <small className="text-muted">{new Date(dateCreated).toLocaleDateString()}</small>
                </div>
                <p className="card-text mt-2">{response}</p>
            </div>
        </div>
    );
};

export default InitialResponse;