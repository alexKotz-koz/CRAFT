import { useState } from "react";
import StudyMeta from "./StudyMeta";
import StudyParticipants from "./StudyParticipants";
import StudyPrompts from "./StudyPrompts";
import StudyReview from "./StudyReview";
import { useNavigate } from "react-router-dom";
import { useCreateStudyMutation, useCreateUserMutation } from "../../store";

const StudyNewWizard = () => {
    const navigate = useNavigate();
    
    const [createStudy, { isLoading: isLoadingStudy, error: errorStudy }] = useCreateStudyMutation();
    const [createUser, { isLoading: isLoadingUsers, error: errorUsers }] = useCreateUserMutation();
    const [currentStage, setCurrentStage] = useState(0);
    const [formValues, setFormValues] = useState({});
    const [newParticipants, setNewParticipants] = useState([]);
    
    const handleNext = (values) => {
        setCurrentStage(currentStage + 1);
        setFormValues({...formValues, ...values});
    };

    const generateTemporaryPassword = () => {
        return Math.random().toString(36).slice(-8); 
    };

    const generateCSVContent = (participants) => {
        const headers = ['Email', 'Username', 'Password'];
        const rows = participants.map(participant => [participant.email, participant.userName, participant.password]);
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        return csvContent;
    };

    const downloadCSV = (csvContent) => {
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'participants.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const submitForm = async() => {
        const study = {
            name: formValues.name,
            instructions: formValues.instructions,
            description: formValues.description,
            participants: formValues.emailList,
            prompts: formValues.promptList,
        }
        try {
            const fullParticipants = [];
            for (const participant of formValues.emailList) {
                const tempPassword = generateTemporaryPassword();
                const newUser = {
                    email: participant.email,
                    userName: participant.userName,
                    password: tempPassword,
                    role: 'participant'
                };

                await createUser(newUser).unwrap();
                fullParticipants.push(newUser);
                setNewParticipants(prevParticipants => [...(prevParticipants || []), newUser]);
            }

            const csvContent = generateCSVContent(fullParticipants);
            downloadCSV(csvContent);

            await createStudy(study).unwrap();

            navigate('/home');
        } catch (err) {
            console.error("StudyNewWizard: Failed to create study. ", err);
        }
    }

    const handleBack = () => {
        setCurrentStage(currentStage - 1);
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
                initialValues={formValues.emailList || []}
            />
            );
        case 2:
            return (
            <StudyPrompts
                onCancel={handleBack}
                onSubmit={handleNext}
                initialValues={formValues.promptList || []}
            />
            );
        case 3:
            return (
            <StudyReview
                onCancel={handleBack}
                onSubmit={submitForm}
                formValues={formValues}
                isLoading={isLoadingStudy || isLoadingUsers}
                error={errorStudy || errorUsers}
            />
            );
        default:
            return null;
        }
    };

    return <div>{renderContent()}</div>;
};

export default StudyNewWizard;