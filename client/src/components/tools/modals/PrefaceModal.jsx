import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { useUpdateConsentMutation } from '../../../store';

const PrefaceModal = ({ isOpen, setIsOpen, toggle, studyName, studyId, preface, userId }) => {
    const navigate = useNavigate();
    const [updateConsent, {error: updateConsentError, isLoading: consentIsLoading }] = useUpdateConsentMutation()

    const handleContinue = async (studyId) => {
        await updateConsent({studyId, userId});
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
                    {preface}
                </ModalBody>
                <ModalFooter>
                    <Button color='primary' onClick={() => handleContinue(studyId)}>Continue</Button>
                    <Button color='secondary' onClick={toggle}>Cancel</Button>  
                </ModalFooter>
            </Modal>
        </div>
    );
}

export default PrefaceModal;