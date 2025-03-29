import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { useNavigate } from 'react-router-dom';

const PrefaceModal = ({ isOpen, toggle, studyName, studyId, preface }) => {
    const navigate = useNavigate();

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
                    <Button color='primary' onClick={() => navigate(`/study/response/${studyId}`)}>Continue</Button>
                    <Button color='secondary' onClick={toggle}>Cancel</Button>  
                </ModalFooter>
            </Modal>
        </div>
    );
}

export default PrefaceModal;