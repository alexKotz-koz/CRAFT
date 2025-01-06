import { useState } from "react";
import StudyMeta from "./StudyMeta";
import StudyParticipants from "./StudyParticipants";
import StudyPrompts from "./StudyPrompts";
import StudyReview from "./StudyReview";
import { useNavigate } from "react-router-dom";
import { useCreateStudyMutation } from "../../store";

const StudyNewWizard = () => {
    const navigate = useNavigate();
    
    const [createStudy, { isLoading, error }] = useCreateStudyMutation();

    const [currentStage, setCurrentStage] = useState(0);
    const [formValues, setFormValues] = useState({});
    

    
    const handleNext = (values) => {
        setCurrentStage(currentStage + 1);
        setFormValues({...formValues, ...values});
    };

    const submitForm = async() => {
        const study = {
            name: formValues.name,
            instructions: formValues.instructions,
            participants: formValues.emailList,
            prompts: formValues.promptList,
        }
        try {
            await createStudy(study).unwrap();
        } catch (err) {
            console.error("StudyNewWizard: Failed to create study. ", err);
        }
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
                onSubmit={submitForm}
                formValues={formValues}
                isLoading={isLoading}
                error={error}
            />
            );
        default:
            return null;
        }
    };

    return <div>{renderContent()}</div>;
};

export default StudyNewWizard;