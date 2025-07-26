import { Table, Modal, ModalHeader, ModalBody, ModalFooter, Button, FormGroup, Input, Label } from "reactstrap";
import { useState, useEffect } from "react";
import { useFetchAllUsersQuery, useAssignParticipantLLMREMutation} from "../../store";

const AssignNewParticipantsTable = ({ evaluations }) => {
    const { data: allUsers, isLoading: isLoadingAllUsers, error: errorAllUsers } = useFetchAllUsersQuery();
    const [participants, setParticipants] = useState([]);
    const [assignParticipant, {isLoading: isAssigning}] = useAssignParticipantLLMREMutation();
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvaluation, setSelectedEvaluation] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        if (allUsers) {
            const filteredUsers = allUsers.filter(user => user.role === 'participant');
            setParticipants(filteredUsers);
        }
    }, [allUsers]);

    const getAssignedLLMREs = (username) => {
        if (!evaluations) return [];

        return evaluations.filter(evaluation => {
            if (!evaluation.participants || !evaluation.participants.length) return false;

            return evaluation.participants.some(participant => {
                if (typeof participant === 'object' && participant.username){
                    return participant.username === username;
                }

                if (allUsers){
                    const matchedUser = allUsers.find(user => {
                        if (typeof participant==='object') {
                            return user._id === participant._id || user._id === participant.user;
                        } else {
                            return user._id === participant;
                        }
                    });
                    return matchedUser?.username === username;
                }
                return false;
            });

        });
    };

    const getAvailableLLMREs = (username) => {
        if (!evaluations) return [];
        
        return evaluations.filter(evaluation => {
            // If no participants, the user isn't assigned
            if (!evaluation.participants || !evaluation.participants.length) return true;
            
            // Check that user is NOT in participants
            return !evaluation.participants.some(participant => {
                // If participant is an object with username property
                if (typeof participant === 'object' && participant.username) {
                    return participant.username === username;
                }
                
                // If participant is an ID, find the corresponding user
                if (allUsers) {
                    const matchedUser = allUsers.find(user => {
                        if (typeof participant === 'object') {
                            return user._id === participant._id || user._id === participant.user;
                        } else {
                            return user._id === participant;
                        }
                    });
                    return matchedUser?.username === username;
                }
                
                return false;
            });
        });
    }

    const handleEvaluationSelect = (evaluationId, user) => {
        const evaluation = evaluations.find(evaluation => evaluation._id === evaluationId);
        if (evaluation) {
            setSelectedEvaluation(evaluation);
            setSelectedUser(user);

            setIsModalOpen(true);
        }
    };

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const handleAssignSubmit = async () => {
        try {
            await assignParticipant({
                evaluationId: selectedEvaluation._id,
                userId: selectedUser._id
            });
            toggleModal();
            alert(`${selectedUser.username} has been assigned to the LLM Response Evaluation: ${selectedEvaluation.title}`)
        } catch (error) {
            console.error("Error assigning participant: ", error);
            alert("Failed to assign participant to LLM Response Evaluation")
        }
    }


    return (
        <div className="container border border-solid">
            <div className="row d-flex text-center">
                <h4>All Users</h4>
            </div>
            <div className="row">
                <Table responsive>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Assigned LLM Response Evaluations</th>
                            <th>Available LLM Response Evaluations</th>
                        </tr>
                    </thead>
                    <tbody>
                        {participants && participants.map((user, idx) => {
                            const userAssignedLLMREs = getAssignedLLMREs(user.username);
                            const userAvailableLLMREs = getAvailableLLMREs(user.username);
      
                            return (
                                <tr key={user._id}>
                                    <th>{idx + 1}</th>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        {userAssignedLLMREs.length > 0 ? (
                                            <ul className="list-unstyled">
                                                {userAssignedLLMREs.map(evaluation => (
                                                    <li key={evaluation._id}>{evaluation.title}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <span>None</span>
                                        )}
                                    </td>
                                    <td>
                                        {userAvailableLLMREs.length > 0 ? (
                                            <select 
                                                className="form-select"
                                                onChange={(e) => {
                                                    if (e.target.value) {
                                                        handleEvaluationSelect(e.target.value, user);
                                                    }
                                                }}
                                            >
                                                <option value="">Assign to evaluation...</option>
                                                {userAvailableLLMREs.map(evaluation => (
                                                    <option key={evaluation._id} value={evaluation._id}>{evaluation.title}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span>No available LLM response evaluations</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </div>
            {/* Assignment Modal */}
            <Modal isOpen={isModalOpen} toggle={toggleModal}>
                <ModalHeader toggle={toggleModal}>
                    Assign to {selectedEvaluation?.title || "LLM Response Evaluation"}
                </ModalHeader>
                <ModalBody>
                    <p>You are about to assign {selectedUser?.username} to {selectedEvaluation?.title}</p>

                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggleModal}>
                        Cancel
                    </Button>
                    <Button 
                        color="primary" 
                        onClick={handleAssignSubmit} 
                    >
                        {isAssigning ? 'Assigning...' : 'Confirm'}
                    </Button>
                </ModalFooter>
            </Modal>

        </div>
    );

};

export default AssignNewParticipantsTable;