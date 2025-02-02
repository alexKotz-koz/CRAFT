import { useState, useEffect } from "react";
import { Form, Field } from "react-final-form";
import { GoPlus, GoTrash, GoChevronDown, GoChevronUp } from "react-icons/go";
import { Collapse, Card, CardBody, CardHeader, Button, Modal, ModalHeader, ModalFooter, ModalBody } from 'reactstrap';
import AppReview from "./content/AppReview";
import Survey from "./content/Survey";

const StudyContent = ({ onSubmit, onCancel, studyType, initialValues }) => {
    
    //App Review
    const [contentList, setContentList] = useState(initialValues || []);
    const [error, setError] = useState("");
    const [showBackConfirmModal, setShowBackConfirmModal] = useState(false);


    const handleContentSubmit = (values) => {
        console.log("handleContentSubmit: ", values)
        setContentList(values || []);
        onSubmit({ contentList: values });
    };

    const renderComponent = () => {
        switch (studyType) {
            case 'app-review':
                return <AppReview />
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