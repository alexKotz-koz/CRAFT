import React from 'react';

const StudyReview = ({ onCancel, onSubmit, formValues, isLoading, error }) => {
    const { name, description, emailList, taskList } = formValues;

    return (
        <div>
            <h3 className="text-center">Review Study</h3>
            <div className="mt-3">
                <p><strong>Name:</strong> {name}</p>
                <p><strong>Description:</strong> {description}</p>
                <p><strong>Participants:</strong></p>
                <ul className="list-group">
                    {emailList && emailList.map((participant, index) => (
                        <li key={index} className="list-group-item">
                            {participant.email}
                        </li>
                    ))}
                </ul>
                <p><strong>Tasks:</strong></p>
                <ul className="list-group">
                    {taskList && taskList.map((task, index) => (
                        <li key={index} className="list-group-item">
                            <p><strong>Name:</strong> {task.name}</p>
                            <p><strong>Instructions:</strong> {task.instructions}</p>
                            <p><strong>Prompts:</strong></p>
                            <ul>
                                {task.prompts.map((prompt, idx) => (
                                    <li key={idx}>{prompt}</li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="d-flex justify-content-between mt-3">
                <button type="button" className="btn btn-secondary" onClick={onCancel}>
                    Back
                </button>
                <button type="button" className="btn btn-primary" onClick={onSubmit} disabled={isLoading}>
                    Submit
                </button>
            </div>
            {error && <div className="text-danger mt-3">{error.message}</div>}
        </div>
    );
};

export default StudyReview;