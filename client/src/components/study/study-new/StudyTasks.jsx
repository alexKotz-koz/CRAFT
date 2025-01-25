import { useState, useEffect } from "react";
import { Form, Field } from "react-final-form";
import { GoPlus, GoTrash } from "react-icons/go";
import { Collapse, Card, CardBody, CardHeader, Button } from 'reactstrap';


const StudyTasks = ({ onSubmit, onCancel, initialValues }) => {
    const [taskList, setTaskList] = useState(initialValues || []);
    const [currentTask, setCurrentTask] = useState({ name: '', description: '', prompts: [] });
    const [prompt, setPrompt] = useState("");
    const [showNewPrompt, setShowNewPrompt] = useState(false);
    const [expandedTask, setExpandedTask] = useState(null);

    const handleInputChange = (e) => {
        setPrompt(e.target.value);
    };

    const handleAddPrompt = () => {
        if (prompt && !currentTask.prompts.includes(prompt)) {
            prompt.trim();
            setCurrentTask({ ...currentTask, prompts: [...currentTask.prompts, prompt] });
            setPrompt("");
            setShowNewPrompt(false);
        }
    };

    const handleRemovePrompt = (promptToRemove) => {
        setCurrentTask({ ...currentTask, prompts: currentTask.prompts.filter(prompt => prompt !== promptToRemove) });
    };

    const handleAddTask = (values) => {
        const newTask = { ...values, prompts: currentTask.prompts };
        setTaskList([...taskList, newTask]);
        setCurrentTask({ name: '', description: '', prompts: [] });
    };

    const handleFormSubmit = () => {
        onSubmit({ taskList });
    };

    const toggleTask = (index) => {
        setExpandedTask(expandedTask === index ? null : index);
    };

    return (
        <div>
            <h3 className="text-center">Add Tasks</h3>
            <Form
                onSubmit={handleAddTask}
                render={({ handleSubmit, form }) => (
                    <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                        <div className="mt-5 mb-3">
                            <div className="mb-3">
                                <Field
                                    name="name"
                                    component="input"
                                    className="form-control"
                                    placeholder="Task Name..."
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <Field
                                    name="description"
                                    component="textarea"
                                    className="form-control"
                                    placeholder="Task Description..."
                                    required
                                />
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
                                <textarea
                                    type="text"
                                    value={prompt}
                                    onChange={handleInputChange}
                                    className="form-control mb-3"
                                    placeholder="Enter prompt..."
                                    required
                                />
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

                        <div className="d-flex justify-content-between mt-3">
                            <button type="button" className="btn btn-secondary" onClick={onCancel}>
                                Back
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
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

            <h3 className="text-center mt-5">Task List</h3>
            <div className="mt-3">
                {taskList.map((task, index) => (
                    <Card key={index} className="mb-3">
                        <CardHeader onClick={() => toggleTask(index)} style={{ cursor: 'pointer' }}>
                            {task.name}
                        </CardHeader>
                        <Collapse isOpen={expandedTask === index}>
                            <CardBody>
                                <p><strong>Description:</strong> {task.description}</p>
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

            <div className="d-flex justify-content-between mt-3">
                <button type="button" className="btn btn-secondary" onClick={onCancel}>
                    Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handleFormSubmit}>
                    Submit All Tasks
                </button>
            </div>
        </div>
    );
};

export default StudyTasks;