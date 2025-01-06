import { useState } from "react";
import StudyMeta from "./StudyMeta";
import StudyParticipants from "./StudyParticipants";
import StudyPrompts from "./StudyPrompts";
import StudyReview from "./StudyReview";

const StudyNewWizard = () => {
    const [currentStage, setCurrentStage] = useState(0);
    const [formValues, setFormValues] = useState({});
    
    //console.log("formValues", formValues);
    
    const handleNext = (values) => {
        console.log("values: ", values);
        setCurrentStage(currentStage + 1);
        setFormValues({...formValues, ...values});
    };

    const submitForm = () => {
        
    }

    const handleBack = () => {
        setCurrentStage(currentStage - 1);
    };

    const handleKeyDown = (event) => {
        if(event.key === 'Enter'){
            event.preventDefault();
        }
    };


    const renderContent = () => {
        switch (currentStage) {
        case 0:
            return (
            <StudyMeta
                onSubmit={handleNext}
                onCancel={handleBack}
                initialValues={formValues}
            />
            );
        case 1:
            return (
            <StudyParticipants
                onCancel={handleBack}
                onSubmit={handleNext}
                onKeyDown={handleKeyDown}
                initialValues={formValues.emailList || []}
            />
            );
        case 2:
            return (
            <StudyPrompts
                onCancel={handleBack}
                onSubmit={handleNext}
                onKeyDown={handleKeyDown}
                initialValues={formValues.promptsList || []}
            />
            );
        case 3:
            return (
            <StudyReview
                onCancel={handleBack}
                onSubmit={handleNext}
                formValues={formValues}
            />
            );
        default:
            return null;
        }
    };

    return <div>{renderContent()}</div>;
};

export default StudyNewWizard;