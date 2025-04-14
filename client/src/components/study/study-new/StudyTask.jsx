import { useState } from "react";
import AppReview from "./content/AppReview";
import Survey from "./content/Survey";

const StudyContent = ({ onSubmit, onCancel, studyType, initialValues }) => {
    
    //App Review
    const [contentList, setContentList] = useState(initialValues || []);
    const [error, setError] = useState("");
    const [showBackConfirmModal, setShowBackConfirmModal] = useState(false);


    const handleContentSubmit = (values) => {
        
        setContentList(values || []);
        onSubmit({ contentList: values });
    };

    const renderComponent = () => {
        switch (studyType) {
            case 'app-review':
                return <AppReview initialValues={initialValues} handleFormSubmit={handleContentSubmit} onCancel={onCancel} />
            case 'survey':
                return <Survey initialValues={initialValues} handleContentSubmit={handleContentSubmit} onCancel={onCancel} />
            default:
                return <div>Default Content</div>;
        }
    };


    return (
        <div>
          {renderComponent()}
        </div>
    );
};

export default StudyContent;