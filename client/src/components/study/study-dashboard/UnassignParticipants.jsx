import { useFetchAllUsersQuery, useFetchAllStudiesQuery, useUnassignParticipantMutation } from "../../../store";
import { Table, Modal, ModalHeader, ModalBody, ModalFooter, Button, FormGroup, Input, Label } from "reactstrap";
import { useState, useEffect } from "react";
import {Spinner} from "reactstrap";

const UnassignParticipants = () => {
    const { data: allUsers, isLoading: isLoadingAllUsers, error: errorAllUsers } = useFetchAllUsersQuery();
    const { data: allStudies, isLoading: isLoadingAllStudies, error: errorAllStudies } = useFetchAllStudiesQuery();
    const [unassignParticipant, { isLoading: isUnassigning }] = useUnassignParticipantMutation();
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
            if (!study.participants || !study.participants.length) return false;
            return study.participants.some(participant => {
                if (typeof participant === 'object' && participant.username) {
                    return participant.username === username;
                }
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

    // Get tasks in a study that the user is assigned to
    const getAssignedTasks = (study, user) => {
        if (!study.tasks || !study.tasks.length) return [];
        return study.tasks.filter(task => {
            if (!task.participants || !task.participants.length) return false;
            return task.participants.some(participant => {
                if (typeof participant === 'object' && participant.username) {
                    return participant.username === user.username;
                }
                if (allUsers) {
                    const matchedUser = allUsers.find(u => {
                        if (typeof participant === 'object') {
                            return u._id === participant._id || u._id === participant.user;
                        } else {
                            return u._id === participant;
                        }
                    });
                    return matchedUser?.username === user.username;
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
            // Initialize selected tasks (only those assigned to user)
            const assignedTasks = getAssignedTasks(study, user);
            const initialSelectedTasks = {};
            assignedTasks.forEach(task => {
                initialSelectedTasks[task._id] = false;
            });
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

    // Handle unassignment submission
    const handleUnassignSubmit = async () => {
        try {
            const tasksToUnassign = Object.entries(selectedTasks)
                .filter(([_, isSelected]) => isSelected)
                .map(([taskId]) => taskId);

            if (tasksToUnassign.length > 0) {
                await unassignParticipant({
                    studyId: selectedStudy._id,
                    userId: selectedUser._id,
                    taskIds: tasksToUnassign
                });
                toggleModal();
                alert(`${selectedUser.username} has been unassigned from the selected tasks in ${selectedStudy.name}`);
            } else {
                alert("Please select at least one task to unassign");
            }
        } catch (error) {
            console.error("Error unassigning participant:", error);
            alert("Failed to unassign participant from tasks");
        }
    };

    if (isLoadingAllUsers || isLoadingAllStudies) {
        return <div>Loading users and studies...</div>;
    }

    if (errorAllUsers || errorAllStudies) {
        return <div>Error loading data</div>;
    }

    return (
        <div className="container border border-solid my-4 rounded">
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
                        </tr>
                    </thead>
                    <tbody>
                        {participants && participants.map((user, idx) => {
                            const userAssignedStudies = getAssignedStudies(user.username);

                            return (
                                <tr key={user._id}>
                                    <th>{idx + 1}</th>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        {userAssignedStudies.length > 0 ? (
                                            <select
                                                className="form-select"
                                                onChange={(e) => {
                                                    if (e.target.value) {
                                                        handleStudySelect(e.target.value, user);
                                                    }
                                                }}
                                            >
                                                <option value="">Unassign from study...</option>
                                                {userAssignedStudies.map(study => (
                                                    <option key={study._id} value={study._id}>{study.name}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span>None</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </div>

            {/* Unassignment Modal */}
            <Modal isOpen={isModalOpen} toggle={toggleModal}>
                <ModalHeader toggle={toggleModal}>
                    Unassign from {selectedStudy?.name || "Study"}
                </ModalHeader>
                <ModalBody>
                    <p>Select tasks to unassign <strong>{selectedUser?.username}</strong> from:</p>
                    {selectedStudy && Object.keys(selectedTasks).length > 0 ? (
                        <>
                            {/* Check All Checkbox */}
                            <FormGroup check className="mb-2">
                                <Input
                                    type="checkbox"
                                    id="unassign-check-all-tasks"
                                    checked={
                                        Object.values(selectedTasks).every(Boolean) &&
                                        Object.values(selectedTasks).length > 0
                                    }
                                    onChange={e => {
                                        const checked = e.target.checked;
                                        const newSelected = {};
                                        Object.keys(selectedTasks).forEach(taskId => {
                                            newSelected[taskId] = checked;
                                        });
                                        setSelectedTasks(newSelected);
                                    }}
                                />
                                <Label check for="unassign-check-all-tasks">
                                    Check All
                                </Label>
                            </FormGroup>
                            {Object.keys(selectedTasks).map(taskId => {
                                const task = selectedStudy.tasks.find(t => t._id === taskId);
                                return (
                                    <FormGroup check key={taskId}>
                                        <Input
                                            type="checkbox"
                                            id={`unassign-task-${taskId}`}
                                            checked={selectedTasks[taskId] || false}
                                            onChange={() => handleTaskCheckboxChange(taskId)}
                                        />
                                        <Label check for={`unassign-task-${taskId}`}>
                                            {task?.name || "Unnamed Task"}
                                        </Label>
                                    </FormGroup>
                                );
                            })}
                        </>
                    ) : (
                        <p>No tasks available to unassign in this study.</p>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggleModal}>
                        Cancel
                    </Button>
                    <Button
                        color="danger"
                        onClick={handleUnassignSubmit}
                        disabled={isUnassigning || !Object.values(selectedTasks).some(isSelected => isSelected)}
                    >
                        {isUnassigning ? 'Unassigning...' : 'Submit'}
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default UnassignParticipants;