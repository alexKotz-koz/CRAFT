import { useState } from "react";
import { Form, Field } from 'react-final-form';
import { GoPlus, GoTrash, GoChevronDown, GoChevronUp } from 'react-icons/go';
import { Collapse, Card, CardBody, CardHeader, Button, Modal, ModalHeader, ModalFooter, ModalBody } from 'reactstrap';
import ContentButtonGroup from './survey/ContentButtonGroup';
import Papa from 'papaparse';
import QuillEditor from '../../../tools/quill-rte/QuillEditor';
const AppReview = ({ initialValues, handleFormSubmit, onCancel }) => {


    //App Review
    const [taskList, setTaskList] = useState(initialValues || []);
    const [currentTask, setCurrentTask] = useState({ name: '', instructions: '', prompts: [] });
    const [expandedTask, setExpandedTask] = useState(null);
    const [error, setError] = useState("");
    const [showBackConfirmModal, setShowBackConfirmModal] = useState(false);

    const [questionList, setQuestionList] = useState([]);
    const [instructions, setInstructions] = useState("");
    const [question, setQuestion] = useState({ title: '', parentQuestion: '', children: [] });
    const [childQuestions, setChildQuestions] = useState([]);
    const [showNewQuestion, setShowNewQuestion] = useState(false);
    const [showSubQuestionField, setShowSubQuestionField] = useState(false);
    const [expandedQuestion, setExpandedQuestion] = useState(null);
    
    const [parentEditorState, setParentEditorState] = useState('');
    const [childEditorStates, setChildEditorStates] = useState([]);

    const handleBundleTaskData = (content) => {
        console.log("handleBundleTaskData",content);
        handleFormSubmit(content);
    }

    const handleAddTask = (values) => {
        console.log("handleAddTask values: ", values)
        console.log("handleAddTask Questions: ", questionList)
        if (values.name && values.instructions && questionList.length > 0) {
            const newTask = { ...values, questions: questionList };
            setTaskList([...taskList, newTask]);
            setCurrentTask({ name: '', instructions: '', prompts: [] });
            setError("");
            setQuestionList([]);
            setQuestion({ title: '', parentQuestion: '', children: [] });
            setChildQuestions([]);
            setShowNewQuestion(!showNewQuestion);
            setShowSubQuestionField(!showSubQuestionField);
            setExpandedQuestion(!expandedQuestion);
            setParentEditorState('');
            setChildEditorStates([]);


        } else {
            setError("You must provide Task Name, Instructions, and at least one Question");
        }
    };

    const handleRemoveTask = (taskToRemove) => {
        setTaskList(taskList.filter(task => task !== taskToRemove));
    };

    const toggleTask = (index) => {
        setExpandedTask(expandedTask === index ? null : index);
    };

    const handleParentInputChange = (html) => {
        setParentEditorState(html);
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const questionTitle = doc.body.firstChild ? doc.body.firstChild.textContent : '';
        setQuestion((prevQuestion) => ({
            ...prevQuestion,
            parentQuestion: html,
            questionTitle,
            instructions
        }));
    };

    const handleChildInputChange = (index, value) => {
        const newChildEditorStates = [...childEditorStates];
        newChildEditorStates[index] = value;
        setChildEditorStates(newChildEditorStates);

        const newChildQuestions = [...childQuestions];
        newChildQuestions[index] = value;
        setChildQuestions(newChildQuestions);
    };

    const handleAddChildQuestion = () => {
        setChildQuestions([...childQuestions, ""]);
        setChildEditorStates([...childEditorStates, ""]);
    };

    const handleRemoveChildQuestion = (index) => {
        const newChildQuestions = childQuestions.filter((_, i) => i !== index);
        const newChildEditorStates = childEditorStates.filter((_, i) => i !== index);
        setChildQuestions(newChildQuestions);
        setChildEditorStates(newChildEditorStates);
    };

    const handleAddQuestion = () => {
        const children = childQuestions.map((childQuestion, index) => ({
            index,
            question: childQuestion
        }));
        const newQuestion = { ...question, children };
        const newQuestionList = [...questionList, newQuestion];
        setQuestionList(newQuestionList);
        setQuestion({ parentQuestion: '', children: [] });
        setParentEditorState('');
        setChildQuestions([]);
        setChildEditorStates([]);
        setShowNewQuestion(false);
        setShowSubQuestionField(false);
    };
    const handleRemoveQuestion = (questionToRemove) => {
        setQuestionList(questionList.filter((q) => q !== questionToRemove));
    };

    const toggleModal = () => setShowBackConfirmModal(!showBackConfirmModal);
    const toggleQuestion = (index) => {
        setExpandedQuestion(expandedQuestion === index ? null : index);
    };

    const handleBackNav = ({ taskList }) => {
        console.log(taskList)
        if (taskList.length <= 0) {
            console.log("here")
            toggleModal();
        }
    };
    const renderSupplementalButtonClass = (state) => {
        if (state) {
            return "btn btn-outline-secondary";
        } else {
            return "btn btn-secondary";
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

                            {!showNewQuestion && <button
                                type="button"
                                className="btn btn-info"
                                onClick={() => setShowNewQuestion(!showNewQuestion)}
                                disabled={showNewQuestion}
                            >
                                <GoPlus /> New Question
                            </button>}
                            {showNewQuestion && (
                                <div>
                                    <div className="floating-label">
                                        <QuillEditor editorState={parentEditorState} onChange={handleParentInputChange} />
                                    </div>
                                    {showSubQuestionField && (
                                        <div>
                                            {childQuestions.map((childQuestion, index) => (
                                                <div key={index} className="mb-3">
                                                    <label className='form-label'>Child Question {index + 1}</label>
                                                    <div className='d-flex justify-content-between align-items-center w-100'>
                                                        <div style={{ flexGrow: 1, marginRight: '10px' }}>
                                                            <QuillEditor
                                                                editorState={childEditorStates[index]}
                                                                onChange={(value) => handleChildInputChange(index, value)}
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => handleRemoveChildQuestion(index)}
                                                        >
                                                            <GoTrash />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            <button type="button" onClick={handleAddChildQuestion} className="btn btn-secondary mb-3">
                                                <GoPlus /> Add Child Question
                                            </button>
                                        </div>
                                    )}
                                    {showNewQuestion &&
                                        <button
                                            type="button"
                                            className={renderSupplementalButtonClass(showSubQuestionField)}
                                            onClick={() => setShowSubQuestionField(!showSubQuestionField)}
                                        >
                                            Add Sub-Question ?
                                        </button>
                                    }
                                    <button type="button" onClick={handleAddQuestion} className="btn btn-info">
                                        Save Question
                                    </button>
                                </div>
                            )}


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
            {questionList.length > 0 &&
                <div>
                    <div className="bg-body-tertiary border border-tertiary p-2 rounded">
                        <h3 className="text-center">Question List</h3>
                        <div className="mt-3">
                            {questionList.map((question, index) => {
                                return (
                                    <Card key={index} className="mb-3">
                                        <CardHeader onClick={() => toggleQuestion(index)} style={{ cursor: 'pointer' }}>
                                            <div className="d-flex justify-content-between align-items-center">
                                                {question.questionTitle}
                                                {expandedQuestion === index ? <GoChevronUp /> : <GoChevronDown />}
                                            </div>
                                        </CardHeader>
                                        <Collapse isOpen={expandedQuestion === index}>
                                            <CardBody>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <p><strong>{question.children.length > 0 ? 'Parent Question:' : 'Question:'}</strong>     {question.parentQuestion.length > 50
                                                        ? `${question.parentQuestion.substring(0, 50)}...`
                                                        : question.parentQuestion}</p>
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleRemoveQuestion(question)}
                                                    >
                                                        <GoTrash />
                                                    </button>
                                                </div>
                                                {question.children.length > 0 &&
                                                    <div>
                                                        <p><strong>Child Questions:</strong></p>
                                                        <ul className='list-group mb-3'>
                                                            {question.children.map((child, index) => (
                                                                <li className='list-group-item' key={index}>{child.question}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                }
                                            </CardBody>
                                        </Collapse>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>
                </div>
            }
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
                                            <p><strong>Questions:</strong></p>
                                            <ul className="list-group">
                                                {task.questions.map((question, idx) => (
                                                    <li key={idx} className="list-group-item">
                                                        <strong>{question.questionTitle || "Untitled Question"}</strong>
                                                        <p>
                                                            {question.parentQuestion.length > 50
                                                                ? `${question.parentQuestion.substring(0, 50)}...`
                                                                : question.parentQuestion}
                                                        </p>
                                                        {question.children.length > 0 && (
                                                            <ul className="list-group mt-2">
                                                                <strong>Child Questions:</strong>
                                                                {question.children.map((child, childIdx) => (
                                                                    <li key={childIdx} className="list-group-item">
                                                                        {child.question}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
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
                        <button type="button" className="btn btn-success" onClick={() => handleBundleTaskData(taskList)}>
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