import { useFetchAllUsersQuery, useFetchAllStudiesQuery, useAssignParticipantMutation } from "../../../store";
import { Table, Modal, ModalHeader, ModalBody, ModalFooter, Button, FormGroup, Input, Label } from "reactstrap";
import { useState, useEffect } from "react";

const AssignNewParticipants = () => {
    const { data: allUsers, isLoading: isLoadingAllUsers, error: errorAllUsers } = useFetchAllUsersQuery();
    const { data: allStudies, isLoading: isLoadingAllStudies, error: errorAllStudies } = useFetchAllStudiesQuery();
    const [assignParticipant, { isLoading: isAssigning }] = useAssignParticipantMutation();
    const [participants, setParticipants] = useState([]);
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudy, setSelectedStudy] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedTasks, setSelectedTasks] = useState({});

    useEffect(() => {
        if (allUsers) {
            const filteredUsers = allUsers.filter(user => user.role === 'participant');
            setParticipants(filteredUsers);
        }
    }, [allUsers]);
    
    // Get studies that a user is assigned to (using username)
    const getAssignedStudies = (username) => {
        if (!allStudies) return [];
        
        return allStudies.filter(study => {
            // Check if the study has participants
            if (!study.participants || !study.participants.length) return false;
            
            // Check if user's username is in the study's participants
            return study.participants.some(participant => {
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
    };
    
    // Get studies that a user is NOT assigned to (using username)
    const getAvailableStudies = (username) => {
        if (!allStudies) return [];
        
        return allStudies.filter(study => {
            // If no participants, the user isn't assigned
            if (!study.participants || !study.participants.length) return true;
            
            // Check that user is NOT in participants
            return !study.participants.some(participant => {
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
    };
    
    // Handle study selection change
    const handleStudySelect = (studyId, user) => {
        const study = allStudies.find(s => s._id === studyId);
        if (study) {
            setSelectedStudy(study);
            setSelectedUser(user);
            // Initialize selected tasks
            const initialSelectedTasks = {};
            if (study.tasks && study.tasks.length > 0) {
                study.tasks.forEach(task => {
                    initialSelectedTasks[task._id] = false;
                });
            }
            setSelectedTasks(initialSelectedTasks);
            setIsModalOpen(true);
        }
    };
    
    // Handle checkbox change
    const handleTaskCheckboxChange = (taskId) => {
        setSelectedTasks(prev => ({
            ...prev,
            [taskId]: !prev[taskId]
        }));
    };
    
    // Handle modal close
    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };
    
    // Handle assignment submission
    const handleAssignSubmit = async () => {
        try {
            const tasksToAssign = Object.entries(selectedTasks)
                .filter(([_, isSelected]) => isSelected)
                .map(([taskId]) => taskId);
                
            if (tasksToAssign.length > 0) {
                await assignParticipant({
                    studyId: selectedStudy._id,
                    userId: selectedUser._id,
                    taskIds: tasksToAssign
                });
                
                // Close the modal and show success message
                toggleModal();
                alert(`${selectedUser.username} has been assigned to the selected tasks in ${selectedStudy.name}`);
            } else {
                alert("Please select at least one task");
            }
        } catch (error) {
            console.error("Error assigning participant:", error);
            alert("Failed to assign participant to tasks");
        }
    };
    
    if (isLoadingAllUsers || isLoadingAllStudies) {
        return <div>Loading users and studies...</div>;
    }

    if (errorAllUsers || errorAllStudies) {
        return <div>Error loading data</div>;
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
                            <th>Assigned Studies</th>
                            <th>Available Studies</th>
                        </tr>
                    </thead>
                    <tbody>
                        {participants && participants.map((user, idx) => {
                            const userAssignedStudies = getAssignedStudies(user.username);
                            const userAvailableStudies = getAvailableStudies(user.username);
                            
                            return (
                                <tr key={user._id}>
                                    <th>{idx + 1}</th>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        {userAssignedStudies.length > 0 ? (
                                            <ul className="list-unstyled">
                                                {userAssignedStudies.map(study => (
                                                    <li key={study._id}>{study.name}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <span>None</span>
                                        )}
                                    </td>
                                    <td>
                                        {userAvailableStudies.length > 0 ? (
                                            <select 
                                                className="form-select"
                                                onChange={(e) => {
                                                    if (e.target.value) {
                                                        handleStudySelect(e.target.value, user);
                                                    }
                                                }}
                                            >
                                                <option value="">Assign to study...</option>
                                                {userAvailableStudies.map(study => (
                                                    <option key={study._id} value={study._id}>{study.name}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span>No available studies</span>
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
                    Assign to {selectedStudy?.name || "Study"}
                </ModalHeader>
                <ModalBody>
                    <p>Select tasks to assign to <strong>{selectedUser?.username}</strong>:</p>
                    {selectedStudy?.tasks?.length > 0 ? (
                        <>
                            {/* Check All Checkbox */}
                            <FormGroup check className="mb-2">
                                <Input
                                    type="checkbox"
                                    id="check-all-tasks"
                                    checked={
                                        selectedStudy.tasks.every(task => selectedTasks[task._id])
                                        && selectedStudy.tasks.length > 0
                                    }
                                    onChange={e => {
                                        const checked = e.target.checked;
                                        const newSelected = {};
                                        selectedStudy.tasks.forEach(task => {
                                            newSelected[task._id] = checked;
                                        });
                                        setSelectedTasks(newSelected);
                                    }}
                                />
                                <Label check for="check-all-tasks">
                                    Check All
                                </Label>
                            </FormGroup>
                            {selectedStudy.tasks.map(task => (
                                <FormGroup check key={task._id}>
                                    <Input
                                        type="checkbox"
                                        id={`task-${task._id}`}
                                        checked={selectedTasks[task._id] || false}
                                        onChange={() => handleTaskCheckboxChange(task._id)}
                                    />
                                    <Label check for={`task-${task._id}`}>
                                        {task.name}
                                    </Label>
                                </FormGroup>
                            ))}
                        </>
                    ) : (
                        <p>No tasks available in this study.</p>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggleModal}>
                        Cancel
                    </Button>
                    <Button 
                        color="primary" 
                        onClick={handleAssignSubmit} 
                        disabled={isAssigning || !Object.values(selectedTasks).some(isSelected => isSelected)}
                    >
                        {isAssigning ? 'Assigning...' : 'Submit'}
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default AssignNewParticipants;