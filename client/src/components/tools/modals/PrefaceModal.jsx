import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { useUpdateConsentMutation } from '../../../store';

const PrefaceModal = ({ isOpen, toggle, studyName, studyId, preface, userId }) => {
    const navigate = useNavigate();
    const [updateConsent, {error: updateConsentError, isLoading: consentIsLoading }] = useUpdateConsentMutation()

    const handleContinue = async (studyId) => {
        console.log(studyId)
        await updateConsent({studyId, userId});
        navigate(`/study/response/${studyId}`);
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