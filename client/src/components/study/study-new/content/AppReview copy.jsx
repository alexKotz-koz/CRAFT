import { useState } from "react";
import { Form, Field } from 'react-final-form';
import { GoPlus, GoTrash, GoChevronDown, GoChevronUp } from 'react-icons/go';
import { Collapse, Card, CardBody, CardHeader, Button, Modal, ModalHeader, ModalFooter, ModalBody } from 'reactstrap';
import ContentButtonGroup from './survey/ContentButtonGroup';
import Papa from 'papaparse';
import QuillEditor from '../../../tools/quill-rte/QuillEditor';
const AppReview = ({ initialValues, handleFormSubmit, onCancel  }) => {


        //App Review
        const [taskList, setTaskList] = useState(initialValues || []);
        const [currentTask, setCurrentTask] = useState({ name: '', instructions: '', prompts: [] });
        const [prompt, setPrompt] = useState("");
        const [showNewPrompt, setShowNewPrompt] = useState(false);
        const [expandedTask, setExpandedTask] = useState(null);
        const [error, setError] = useState("");
        const [showBackConfirmModal, setShowBackConfirmModal] = useState(false);
    
    
    
        const handleInputChange = (e) => {
            setPrompt(e.target.value);
        };
    
        const handleAddPrompt = () => {
            const trimmedPrompt = prompt.trim();
            if (trimmedPrompt && !currentTask.prompts.includes(trimmedPrompt)) {
                setCurrentTask({ ...currentTask, prompts: [...currentTask.prompts, trimmedPrompt] });
                setPrompt("");
                setShowNewPrompt(false);
            }
        };
    
        const handleRemovePrompt = (promptToRemove) => {
            setCurrentTask({ ...currentTask, prompts: currentTask.prompts.filter(prompt => prompt !== promptToRemove) });
        };
    
        const handleAddTask = (values) => {
            if (values.name && values.instructions && currentTask.prompts.length > 0) {
                const newTask = { ...values, prompts: currentTask.prompts };
                setTaskList([...taskList, newTask]);
                setCurrentTask({ name: '', instructions: '', prompts: [] });
                setError("");
            } else {
                setError("You must provide Task Name, Instructions, and at least one Prompt");
            }
        };
    
        const handleRemoveTask = (taskToRemove) => {
            setTaskList(taskList.filter(task => task !== taskToRemove));
        };
    
        const handleContentSubmit = () => {
            onSubmit({ taskList });
        };
    
        const toggleTask = (index) => {
            setExpandedTask(expandedTask === index ? null : index);
        };
    
        const toggleModal = () => setShowBackConfirmModal(!showBackConfirmModal);
    
    
        const handleBackNav = ({taskList}) => {
            console.log(taskList)
            if (taskList.length <= 0 ) {
                console.log("here")
                toggleModal();
            }
        };

    return (
        <div>
            <div className="bg-body-tertiary border border-tertiary p-2 rounded mt-3 mb-3">
                <h3 className="text-center">Add Tasks</h3>
                <p className="text-muted p-3">Tasks are specific objectives you would like the participants to complete. A study can have one or multiple tasks. Each task will have one or more prompts. Each prompt can be a specific question or statement, triggering a response by a participant. Each task will have an automatically generated discussion board where participants responses to each prompt will be posted upon completing the task. Participants can comment, up, and down vote each others responses.</p>
                <Form
                    onSubmit={handleAddTask}
                    render={({ handleSubmit, form }) => (
                        <form onSubmit={handleSubmit} className="needs-validation mb-3" noValidate>
                            <div className="mt-5 mb-3">
                                <div className="floating-label">
                                    <Field
                                        name="name"
                                        component="input"
                                        className="form-control"
                                        placeholder=""
                                        required
                                    />
                                    <label>Task Name</label>
                                </div>
                                <div className="floating-label">
                                    <Field
                                        name="instructions"
                                        component="textarea"
                                        className="form-control"
                                        placeholder=""
                                        required
                                    />
                                    <label>Overall Task Instructions</label>
                                </div>
                            </div>

                            <div className="mb-3">
                                <button
                                    type="button"
                                    className="btn btn-light"
                                    onClick={() => setShowNewPrompt(!showNewPrompt)}
                                    disabled={showNewPrompt}
                                >
                                    Create New Prompt
                                </button>
                            </div>
                            {showNewPrompt &&
                                <div>
                                    <div className="floating-label">
                                        <textarea
                                            type="text"
                                            value={prompt}
                                            onChange={handleInputChange}
                                            className="form-control mb-3"
                                            placeholder=""
                                            required
                                        />
                                        <label>Prompt</label>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleAddPrompt}
                                        className="btn btn-info"
                                    >
                                        <GoPlus /> Add Prompt
                                    </button>
                                </div>
                            }

                            <div className="mt-3">
                                <ul className="list-group">
                                    {currentTask.prompts.map((prompt, index) => (
                                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                            {prompt}
                                            <button
                                                type="button"
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleRemovePrompt(prompt)}
                                            >
                                                <GoTrash />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="d-flex justify-content-end mt-3">
                                {taskList.length <= 0 &&
                                    <button type="button" className="btn btn-secondary " onClick={() => handleBackNav({ taskList })}>
                                        Back
                                    </button>}

                                {taskList.length > 0 &&
                                    <button className="btn btn-secondary ms-2 me-2">
                                        Save Draft
                                    </button>
                                }

                                <button
                                    type="button"
                                    className="btn btn-success ml-auto ms-2 me-2"
                                    onClick={() => {
                                        handleSubmit();
                                        form.reset();
                                    }}
                                >
                                    Add Task
                                </button>
                            </div>
                        </form>
                    )}
                />
            </div>

            {taskList.length > 0 &&
                <div>
                    <div className="bg-body-tertiary border border-tertiary p-2 rounded">
                        <h3 className="text-center">Task List</h3>
                        <div className="mt-3">
                            {taskList.map((task, index) => (
                                <Card key={index} className="mb-3">
                                    <CardHeader onClick={() => toggleTask(index)} style={{ cursor: 'pointer' }}>
                                        <div className="d-flex justify-content-between align-items-center">
                                            {task.name}
                                            {expandedTask === index ? <GoChevronUp /> : <GoChevronDown />}
                                        </div>
                                    </CardHeader>
                                    <Collapse isOpen={expandedTask === index}>
                                        <CardBody>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <p><strong>Instructions:</strong> {task.instructions}</p>
                                                <button
                                                    type="button"
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleRemoveTask(task)}
                                                >
                                                    <GoTrash />
                                                </button>
                                            </div>
                                            <p><strong>Prompts:</strong></p>
                                            <ul className="list-group">
                                                {task.prompts.map((prompt, idx) => (
                                                    <li key={idx} className="list-group-item">
                                                        {prompt}
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardBody>
                                    </Collapse>
                                </Card>
                            ))}
                        </div>
                    </div>
                    <div className="d-flex justify-content-between mt-3 mb-3">
                        <button type="button" className="btn btn-secondary" onClick={() => onCancel({ taskList })}>
                            Back
                        </button>
                        <button type="button" className="btn btn-success" onClick={handleFormSubmit}>
                            Submit All Tasks
                        </button>
                    </div>
                </div>
            }
            {showBackConfirmModal &&
                <div>
                    <Modal isOpen={showBackConfirmModal} toggle={toggleModal} >
                        <ModalHeader toggle={toggleModal}>
                            Confirm Canel
                        </ModalHeader>
                        <ModalBody>
                            You have not added any tasks, navigating away from this page will remove any task information you have not added to the task list.
                        </ModalBody>
                        <ModalFooter className='d-flex align-items-center justify-content-center'>
                            <Button color="primary" onClick={() => onCancel(taskList)}>Confirm?</Button>
                            <Button color="secondary" onClick={() => toggleModal()}>Cancel</Button>
                        </ModalFooter>
                    </Modal>
                </div>
            }

            {error && <div className="text-danger mt-3">{error}</div>}
        </div>
    );
};

export default AppReview;