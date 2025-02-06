import React from 'react';

const StudyReview = ({ onCancel, onSubmit, formValues, isLoading, error }) => {
    const { name, description, studyType , emailList, contentList } = formValues;

    const renderContent = () => {
        if (studyType === 'survey') {
            return (
                <>
                    <li className="list-group-item">
                        <p><strong>Instructions:</strong> {contentList.instructions}</p>
                    </li>
                    {Object.keys(contentList).filter(key => key !== 'instructions').map((key, index) => {
                        const item = contentList[key];
                        return (
                            <li key={index} className="list-group-item">
                                <p><strong>{item.children.length > 0 ? 'Parent Question:' : 'Question:'}</strong> {item.parentQuestion}</p>
                                {item.children.length > 0 && (
                                    <>
                                        <p><strong>Child Questions:</strong></p>
                                        <ul>
                                            {item.children.map((child, idx) => (
                                                <li key={idx}>{child.question}</li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                                <p><strong>Media:</strong> {item.media.length > 0 ? 'Yes' : 'No'}</p>
                                <p><strong>Tables:</strong> {item.tables.length > 0 ? 'Yes' : 'No'}</p>
                            </li>
                        );
                    })}
                </>
            );
        }
    };

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
                            {participant.email} | {participant.username}
                        </li>
                    ))}
                </ul>
                <p className='mt-3'><strong>Content:</strong></p>
                <ul className="list-group">
                    {renderContent()}
                </ul>
            </div>
            <div className="d-flex justify-content-between mt-3 mb-3">
                <button type="button" className="btn btn-secondary" onClick={onCancel}>
                    Back
                </button>
                <button type="button" className="btn btn-primary" onClick={onSubmit} disabled={isLoading}>
                    {isLoading ? 'Submitting...' : 'Submit'}
                </button>
            </div>
            {error && <div className="text-danger mt-3">{error}</div>}
        </div>
    );
};

export default StudyReview;