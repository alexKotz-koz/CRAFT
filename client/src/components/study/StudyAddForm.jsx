const StudyAddForm = ({onFormSubmit, onKeyDown, input: {label, type, value, onChange}, add: { onClick, reactIcon, label} }) => {
    return (
        <div>
            <Form
                onSubmit={onFormSubmit}
                render={({ handleSubmit }) => (
                    <form onSubmit={handleSubmit} onKeyDown={onKeyDown} className="needs-validation" >
                        <div className="mb-3">
                            <label className="form-label">{input.label}</label>
                            <input
                                type={type}
                                value={value}
                                onChange={onChange}
                                className="form-control"
                                required
                            />
                            {invalidEmail && (
                                <div className="form-text text-danger">
                                    You must provide a valid email address
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={onClick}
                            className="btn btn-info"
                        >
                        {reactIcon} {add.label}
                        </button>
                        <div className="mt-3">
                            <ul className="list-group">
                                {emailList.map((email, index) => (
                                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                        {email}
                                        <button
                                            type="button"
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleRemoveEmail(email)}
                                        >
                                            <GoTrash />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="d-flex justify-content-between mt-3">
                            <button type="button" className="btn btn-secondary" onClick={onCancel}>
                                Back
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Next
                            </button>
                        </div>

                    </form>
                )}
            />

        </div>
    );
};

export default StudyAddForm;