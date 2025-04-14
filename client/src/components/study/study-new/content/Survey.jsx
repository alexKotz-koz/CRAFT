import React, { useState, useEffect } from 'react';
import { Form, Field } from 'react-final-form';
import { GoPlus, GoTrash, GoChevronDown, GoChevronUp } from 'react-icons/go';
import { Collapse, Card, CardBody, CardHeader, Button, Modal, ModalHeader, ModalFooter, ModalBody } from 'reactstrap';
import ContentButtonGroup from './survey/ContentButtonGroup';
import Papa from 'papaparse';
import QuillEditor from '../../../tools/quill-rte/QuillEditor';

const Survey = ({ initialValues, handleContentSubmit, onCancel }) => {
    const [questionList, setQuestionList] = useState([]);
    const [instructions, setInstructions] = useState("");
    const [question, setQuestion] = useState({ title: '', parentQuestion: '', children: [], media: [], links: [], tables: [] });
    const [childQuestions, setChildQuestions] = useState([]);
    const [table, setTable] = useState({
        numColumns: 0,
        numRows: 0,
        columnNames: [],
        values: []
    });
    const [firstRowAsColumnNames, setFirstRowAsColumnNames] = useState("");
    const [showNewQuestion, setShowNewQuestion] = useState(false);
    const [showTableField, setShowTableField] = useState(false);
    const [showSubQuestionField, setShowSubQuestionField] = useState(false);
    const [showBackConfirmModal, setShowBackConfirmModal] = useState(false);
    const [error, setError] = useState('');
    const [expandedQuestion, setExpandedQuestion] = useState(null);

    const [parentEditorState, setParentEditorState] = useState('');
    const [childEditorStates, setChildEditorStates] = useState([]);
    
    useEffect(() => {
        if (initialValues) {
            const { instructions, ...questions } = initialValues;
            setQuestionList(Object.values(questions));
            setInstructions(instructions || "");
        }
    }, [initialValues]);

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

    const checkFRACNState = () => {
        if (firstRowAsColumnNames !== "Yes" && firstRowAsColumnNames !== "No") {
            setError("You must first choose an option for 'First Row Contains Column Names'");
            return false;
        }
        setError("");
        return true;
    };

    const handleCSVUpload = (event) => {
        const file = event.target.files[0];
        Papa.parse(file, {
            complete: (result) => {
                const data = result.data;
                let newTable;
                if (firstRowAsColumnNames === "Yes") {
                    const columnNames = data[0];
                    const values = data.slice(1).map((row, rowIndex) =>
                        row.map((value, colIndex) => ({
                            column: colIndex,
                            row: rowIndex,
                            value
                        }))
                    );
                    newTable = {
                        numColumns: columnNames.length,
                        numRows: data.length - 1,
                        columnNames,
                        values
                    };
                } else {
                    const values = data.map((row, rowIndex) =>
                        row.map((value, colIndex) => ({
                            column: colIndex,
                            row: rowIndex,
                            value
                        }))
                    );
                    newTable = {
                        numColumns: data[0].length,
                        numRows: data.length,
                        columnNames: [],
                        values
                    };
                }
                setTable(newTable);
                setQuestion((prevQuestion) => ({
                    ...prevQuestion,
                    tables: [newTable]
                }));
            },
            header: false
        });
    };

    const handleAddQuestion = () => {
        const children = childQuestions.map((childQuestion, index) => ({
            index,
            question: childQuestion
        }));
        const newQuestion = { ...question, children };
        const newQuestionList = [...questionList, newQuestion];
        setQuestionList(newQuestionList);
        setQuestion({ parentQuestion: '', children: [], media: [], links: [], tables: [] });
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

    const handleBackNav = () => {
        if (questionList.length <= 0) {
            toggleModal();
        } else {
            onCancel(questionList);
        }
    };

    const handleFormSubmit = (values) => {
        const contentList = {
            instructions,
            ...questionList.reduce((acc, question, index) => {
                acc[index] = question;
                return acc;
            }, {})
        };
        handleContentSubmit(contentList);
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
                <h3 className="text-center">Add Content</h3>
                <p className="text-muted p-3">Add instructions on how to fill out the content form here...</p>
                <Form
                    onSubmit={(values) => handleFormSubmit(values)}
                    render={({ handleSubmit, form }) => (
                        <form onSubmit={handleSubmit} className="needs-validation mb-3" noValidate>
                            <div className="mt-5 mb-3">
                                <div className="floating-label">
                                    <Field name="instructions">
                                        {({ input, meta }) => (
                                            <>
                                                <textarea
                                                    {...input}
                                                    value={instructions}
                                                    onChange={(e) => setInstructions(e.target.value)}
                                                    className="form-control"
                                                    placeholder=""
                                                    required
                                                />
                                                <label>Overall Instructions</label>
                                                {meta.error && meta.touched && <span className="error">{meta.error}</span>}
                                            </>
                                        )}
                                    </Field>
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
                                    {showTableField && (
                                        <div className="mb-3">
                                            <label className="form-label">Upload CSV</label>
                                            <input
                                                type="file"
                                                className="form-control"
                                                accept=".csv"
                                                onClick={(e) => {
                                                    if (!checkFRACNState()) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                onChange={handleCSVUpload}
                                            />
                                            <div className="form-group mt-2">
                                                <label htmlFor="firstRowAsColumnNames">First row contains column names</label>
                                                <select
                                                    id="firstRowAsColumnNames"
                                                    className="form-control"
                                                    value={firstRowAsColumnNames}
                                                    onChange={(e) => { setFirstRowAsColumnNames(e.target.value); setError(""); }}
                                                >
                                                    <option value="">Select an option</option>
                                                    <option value="No">No</option>
                                                    <option value="Yes">Yes</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
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
                                    {/* Commented for demo, uncomment when table functionality is working
                                    <ContentButtonGroup
                                        showNewQuestion={showNewQuestion}
                                        setShowNewQuestion={setShowNewQuestion}
                                        showTableField={showTableField}
                                        setShowTableField={setShowTableField}
                                        showSubQuestionField={showSubQuestionField}
                                        setShowSubQuestionField={setShowSubQuestionField}
                                    />*/}
                                    <button type="button" onClick={handleAddQuestion} className="btn btn-info">
                                        Save Question
                                    </button>
                                </div>
                            )}
                        </form>
                    )}
                />
            </div>
            {error && <div className="text-danger mt-3 mb-3">{error}</div>}
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
                                                <p><strong>Additional Components:</strong></p>
                                                <ul className="list-group">
                                                    <li className='list-group-item'>Table: {question.tables.length > 0 ? 'Yes' : 'No'}</li>
                                                    <li className='list-group-item'>Media: {question.media.length > 0 ? 'Yes' : 'No'}</li>
                                                </ul>
                                            </CardBody>
                                        </Collapse>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>
                </div>
            }
            {showBackConfirmModal && (
                <div>
                    <Modal isOpen={showBackConfirmModal} toggle={toggleModal}>
                        <ModalHeader toggle={toggleModal}>Confirm Cancel</ModalHeader>
                        <ModalBody>
                            You have not added any tasks, navigating away from this page will remove any task information you have not added to the task list.
                        </ModalBody>
                        <ModalFooter className="d-flex align-items-center justify-content-center">
                            <Button color="primary" onClick={() => onCancel(questionList)}>
                                Confirm?
                            </Button>
                            <Button color="secondary" onClick={toggleModal}>
                                Cancel
                            </Button>
                        </ModalFooter>
                    </Modal>
                </div>
            )}

            <div className="d-flex justify-content-end mt-3 mb-3">
                <button type="button" className="btn btn-secondary" onClick={handleBackNav}>
                    Back
                </button>
                <button
                    type="button"
                    className="btn btn-success ml-auto ms-2 me-2"
                    onClick={() => {
                        handleFormSubmit(questionList);
                    }}
                >
                    Submit
                </button>
            </div>
        </div>
    );
};

export default Survey;