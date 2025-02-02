import React, { useState } from 'react';
import { Form, Field } from 'react-final-form';
import { GoPlus, GoTrash, GoChevronDown, GoChevronUp } from 'react-icons/go';
import { Collapse, Card, CardBody, CardHeader, Button, Modal, ModalHeader, ModalFooter, ModalBody } from 'reactstrap';
import ContentButtonGroup from './survey/ContentButtonGroup';
import Papa from 'papaparse';

const Survey = ({ initialValues, handleContentSubmit, onCancel }) => {
    const [questionList, setQuestionList] = useState(initialValues || []);
    const [instructions, setInstructions] = useState("");
    const [question, setQuestion] = useState({ parentQuestion: '', children: [], media: [], links: [], tables: [] });
    const [table, setTable] = useState({
        numColumns: 0,
        numRows: 0,
        columnNames: [],
        values: []
    });
    const [firstRowAsColumnNames, setFirstRowAsColumnNames] = useState("");
    const [showNewQuestion, setShowNewQuestion] = useState(false);
    const [showMediaField, setShowMediaField] = useState(false);
    const [showTableField, setShowTableField] = useState(false);
    const [showSubQuestion, setShowSubQuestion] = useState(false);
    const [showBackConfirmModal, setShowBackConfirmModal] = useState(false);
    const [error, setError] = useState('');
    const [expandedQuestion, setExpandedQuestion] = useState(null);

    console.log("initialValues: ", initialValues)

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setQuestion((prevQuestion) => ({
            ...prevQuestion,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setQuestion((prevQuestion) => ({
            ...prevQuestion,
            media: [...prevQuestion.media, file],
        }));
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
        const trimmedQuestion = question.parentQuestion.trim();
        if (trimmedQuestion && !questionList.some(q => q.parentQuestion === trimmedQuestion)) {
            const newQuestionList = [...questionList, question];
            setQuestionList(newQuestionList);
            setQuestion({ parentQuestion: '', children: [], media: [], links: [], tables: [] });
            setShowNewQuestion(false);
            setShowMediaField(false);
            setShowTableField(false);
            setShowSubQuestion(false);
            console.log("handleAddQuestion questionList: ", newQuestionList);
        }
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

    return (
        <div>
            <div className="bg-body-tertiary border border-tertiary p-2 rounded mt-3 mb-3">
                <h3 className="text-center">Add Content</h3>
                <p className="text-muted p-3">Add content here.</p>
                <Form
                    onSubmit={(values) => handleContentSubmit({ ...values, questionList })}
                    render={({ handleSubmit, form }) => (
                        <form onSubmit={handleSubmit} className="needs-validation mb-3" noValidate>
                            <div className="mt-5 mb-3">
                                <div className="floating-label">
                                    <Field
                                        name="instructions"
                                        component="textarea"
                                        className="form-control"
                                        placeholder=""
                                        value={instructions}
                                        required
                                    />
                                    <label>Overall Instructions</label>
                                </div>
                            </div>

                            <ContentButtonGroup
                                showNewQuestion={showNewQuestion}
                                setShowNewQuestion={setShowNewQuestion}
                                showMediaField={showMediaField}
                                setShowMediaField={setShowMediaField}
                                showTableField={showTableField}
                                setShowTableField={setShowTableField}
                            />

                            {showNewQuestion && (
                                <div>
                                    <div className="floating-label">
                                        <textarea
                                            type="text"
                                            name="parentQuestion"
                                            value={question.parentQuestion}
                                            onChange={handleInputChange}
                                            className="form-control mb-3"
                                            placeholder=""
                                            required
                                        />
                                        <label>Question</label>
                                    </div>
                                    {showMediaField && (
                                        <div className="mb-3">
                                            <label className="form-label">Upload Media</label>
                                            <input type="file" className="form-control" accept='.jpeg, .jpg, .png' onChange={handleFileChange} />
                                        </div>
                                    )}
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
                                                    onChange={(e) => setFirstRowAsColumnNames(e.target.value)}
                                                >
                                                    <option value="">Select an option</option>
                                                    <option value="No">No</option>
                                                    <option value="Yes">Yes</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    <button type="button" onClick={handleAddQuestion} className="btn btn-info">
                                        <GoPlus /> Add Question
                                    </button>
                                </div>
                            )}


                        </form>
                    )}
                />
            </div>
            {questionList.length > 0 &&
                <div>
                    <div className="bg-body-tertiary border border-tertiary p-2 rounded">
                        <h3 className="text-center">Question List</h3>
                        <div className="mt-3">
                            {questionList.map((question, index) => (
                                <Card key={index} className="mb-3">
                                    <CardHeader onClick={() => toggleQuestion(index)} style={{ cursor: 'pointer' }}>
                                        <div className="d-flex justify-content-between align-items-center">
                                            {question.parentQuestion}
                                            {expandedQuestion === index ? <GoChevronUp /> : <GoChevronDown />}
                                        </div>
                                    </CardHeader>
                                    <Collapse isOpen={expandedQuestion === index}>
                                        <CardBody>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <p><strong>Instructions:</strong> {question.instructions}</p>
                                                <button
                                                    type="button"
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleRemoveQuestion(question)}
                                                >
                                                    <GoTrash />
                                                </button>
                                            </div>
                                            <p><strong>Additional Components:</strong></p>
                                            <ul className="list-group">
                                                <li className='list-group-item'>Table: {question.tables.length > 0 ? 'Yes' : 'No'}</li>
                                                <li className='list-group-item'>Media: {question.media.length > 0 ? 'Yes' : 'No'}</li>
                                            </ul>
                                        </CardBody>
                                    </Collapse>
                                </Card>
                            ))}
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

            {error && <div className="text-danger mt-3">{error}</div>}
            <div className="d-flex justify-content-end mt-3">

                <button type="button" className="btn btn-secondary" onClick={handleBackNav}>
                    Back
                </button>


                {questionList.length > 0 && (
                    <button className="btn btn-secondary ms-2 me-2">Save Draft</button>
                )}

                <button
                    type="button"
                    className="btn btn-success ml-auto ms-2 me-2"
                    onClick={() => {
                        handleContentSubmit(questionList);
                    }}
                >
                    Submit
                </button>
            </div>
        </div>
    );
};

export default Survey;