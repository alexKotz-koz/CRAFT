import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { useUpdateConsentMutation } from '../../../store';

const ConsentModal = ({ isOpen, setIsOpen, toggle, consentContent, userId }) => {
    const navigate = useNavigate();
    const [updateConsent, {error: updateConsentError, isLoading: consentIsLoading }] = useUpdateConsentMutation()
    
    const studyName = consentContent.studyName;
    const consent = consentContent.consent;
    const consentId = consentContent._id;
    const handleContinue = async () => {
        await updateConsent({userId, consentId});
        // Commenting the navigation to study out for Fosters Study (requested to include the LLM RE as a card on the home page so need to show consent before LLMRE's are completed, but can't navigate from consent directly to study, need to navigate to LLMRE/home)
        //navigate(`/study/response/${studyId}`);
        setIsOpen(!isOpen); //comment this line if you want to uncomment navigate(<study>) 
    };

    return (
        <div>
            <Modal isOpen={isOpen} toggle={toggle} size='lg'>
                <ModalHeader>
                    {studyName}
                </ModalHeader>
                <ModalBody style={{ whiteSpace: 'pre-wrap' }}>
                    {consent}
                </ModalBody>
                <ModalFooter>
                    <Button color='primary' onClick={() => handleContinue()}>Continue</Button>
                    <Button color='secondary' onClick={toggle}>Cancel</Button>  
                </ModalFooter>
            </Modal>
        </div>
    );
}

export default ConsentModal;