import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

const StudyResponseClosingComments = ({ closingComments, studyId }) => {
    const navigate = useNavigate();

    const handleClose = () => {
        navigate('/home');
    };

    const handleDiscussionBoard = () => {
        navigate(`/discussion/landing/${studyId}`);
    };

    return (
        <Modal isOpen={true}>
            <ModalHeader>
                Thank you for completing the initial stage of our study
            </ModalHeader>
            <ModalBody>
                <h5>Please continue to the discussion board to start engaging with your peer-participants</h5>
                <div>{closingComments}</div>
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={handleClose}>Close</Button>
                <Button color="primary" onClick={handleDiscussionBoard}>Discussion Board</Button>
            </ModalFooter>
        </Modal>
    );
};

export default StudyResponseClosingComments;