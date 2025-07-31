import { Spinner } from "reactstrap";
import { useParams } from "react-router-dom";
import { useEditEvaluationMutation, useFetchEvaluationQuery } from "../../store";
import { Form, Field } from "react-final-form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const capitalizeLabel = (label) => {
    if (!label) return "";
    return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
};

const renderRubricField = (sectionId, rubricItem) => {
    const fieldName = `section_${sectionId}_rubric_${rubricItem.itemId}_type_${rubricItem.objectType}`;
    switch (rubricItem.objectType) {
        case "checkbox":
            return rubricItem.checkboxLabels.filter(Boolean).length > 0 ? (
                rubricItem.checkboxLabels.map((label, i) => (
                    <div key={i} className="form-check">
                        <Field
                            name={`${fieldName}_checkbox_${i}`}
                            component="input"
                            type="checkbox"
                            className="form-check-input"
                            onKeyDown={e => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                }
                            }}
                            disabled
                        />
                        <label className="form-check-label ms-1">{capitalizeLabel(label)}</label>
                    </div>
                ))
            ) : (
                <div className="text-muted">No options</div>
            );
        case "radio":
            return rubricItem.radioLabels.filter(Boolean).length > 0 ? (
                rubricItem.radioLabels.map((label, i) => (
                    <div key={i} className="form-check">
                        <Field
                            name={fieldName}
                            component="input"
                            type="radio"
                            value={label}
                            className="form-check-input"
                            onKeyDown={e => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                }
                            }}
                            disabled
                        />
                        <label className="form-check-label ms-1">{capitalizeLabel(label)}</label>
                    </div>
                ))
            ) : (
                <div className="text-muted">No options</div>
            );
        case "switch":
            return (
                <div className="form-check form-switch">
                    <Field
                        name={fieldName}
                        component="input"
                        type="checkbox"
                        className="form-check-input"
                        onKeyDown={e => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                            }
                        }}
                        disabled
                    />
                    <label className="form-check-label ms-1">Toggle</label>
                </div>
            );
        case "range":
            return (
                <div>
                    <Field
                        name={fieldName}
                        component="input"
                        type="range"
                        min="0"
                        max="10"
                        className="form-range"
                        onKeyDown={e => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                            }
                        }}
                        disabled
                    />
                    <div className="d-flex justify-content-between">
                        <span>0</span>
                        <span>10</span>
                    </div>
                </div>
            );
        default:
            return <div className="text-muted">Unknown rubric type</div>;
    }
};

const EditExistingEvaluation = () => {
    const { evaluationId } = useParams();
    const { data: evaluation, isLoading, error } = useFetchEvaluationQuery({ evaluationId });
    const [editEvaluation, { isLoading: isLoadingEvalEdit, error: errorEvalEdit }] = useEditEvaluationMutation();

    const [formErrorSubmission, setFormErrorSubmission] = useState("");
    const navigate = useNavigate();

    if (isLoading || isLoadingEvalEdit) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner color="primary" />
            </div>
        );
    }
    if (error || errorEvalEdit) {
        return (
            <div className="border border-danger rounded text-danger px-2 mt-2">
                {error || errorEvalEdit}
            </div>
        )
    }


    const handleSubmit = async (values) => {
        let submission = {
            evaluationId,
            evaluationEdits: values
        };
        console.log("handleSubmit: ", submission)
        try {
            await editEvaluation(submission).unwrap();
            navigate('/home');
        } catch (err) {
            console.error("CreateEvaluationResponse: Error creating evaluation response", err);
            setFormErrorSubmission(err);
        }
    };

    const renderSections = () => (
        <Form
            onSubmit={handleSubmit}

            render={({ handleSubmit }) => (
                <form
                    onSubmit={handleSubmit}
                    onKeyDown={e => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                        }
                    }}>
                    <div className="container">
                        <div className="row mb-3">
                            <h3 className="text-center">{evaluation?.title}</h3>
                        </div>
                        <div className="row mb-3">
                            <div
                                className="card bg-body-tertiary border border-tertiary p-2 rounded"
                                style={{ whiteSpace: "pre-line" }}
                            >
                                {evaluation?.instructions} - EDIT
                            </div>
                        </div>
                        {/* Desktop Header Row */}
                        <div className="row d-none d-md-flex mb-2">
                            <div className="col-md-4 fw-bold border text-center">AI Output</div>
                            <div className="col-md-4 fw-bold border text-center">Rubric Selection</div>
                            <div className="col-md-4 fw-bold border text-center">Feedback</div>
                        </div>
                        {evaluation?.sections.map((section, sectionIdx) => (
                            <div className="row mb-3" key={section.sectionId || sectionIdx}>
                                {/* Mobile Headers */}
                                <div className="d-block d-md-none mb-2">
                                    <div className="fw-bold">AI Output</div>
                                </div>
                                {/* AI Output */}
                                <div
                                    className="col-12 col-md-4 border d-flex mb-2 mb-md-0"
                                    style={{
                                        minHeight: 120,
                                        maxHeight: 500,
                                        overflowY: "auto",
                                        overflowX: "hidden",
                                        display: "block",
                                        whiteSpace: "pre-wrap",
                                        wordBreak: "break-word"
                                    }}
                                >
                                    <div className="container mt-3 mb-3">
                                        {section?.transcript.map((chat, idx) => {
                                            if (chat.kind === "llm") {
                                                return (
                                                    <div key={idx} className="text-start">
                                                        <div
                                                            className="row card bg-body-secondary border border-warning border-3 px-2 py-2"
                                                        >
                                                            {chat.content}

                                                        </div>
                                                        <p>LLM</p>
                                                    </div>


                                                );
                                            } else if (chat.kind === 'human') {
                                                return (
                                                    <div key={idx} className="text-start">
                                                        <div className="row card bg-body-secondary border border-info border-3 px-2 py-2">
                                                            {chat.content}

                                                        </div>
                                                        <p className="text-end">User</p>
                                                    </div>
                                                );
                                            }
                                        })}
                                    </div>
                                </div>
                                {/* Rubric Items and Free Text, aligned */}
                                <div className="col-12 col-md-8 border">
                                    {evaluation.rubricItems.map((rubricItem, rubricIdx) => (
                                        <div key={rubricItem.itemId || rubricIdx} className="row mb-3 align-items-center">
                                            {/* Rubric Selection */}
                                            <div className="col-12 col-md-6 mb-2 mb-md-0">
                                                <div className="fw-semibold">{rubricItem.title}</div>
                                                <div className="mb-1">{rubricItem.caption}</div>
                                                {renderRubricField(section.sectionId, rubricItem)}
                                            </div>
                                            {/* Free Text */}
                                            <div className="col-12 col-md-6">
                                                <div
                                                    className="bg-light border-start border-4 border-secondary rounded-3 px-3 py-2 mb-2"
                                                    style={{ whiteSpace: "pre-wrap", fontSize: "0.97rem" }}
                                                >
                                                    <span className="small text-muted">
                                                        {rubricItem.reason?.includes("Sub-criteria to consider:") ? (
                                                            <>
                                                                <strong>Sub-criteria to consider:</strong>
                                                                {rubricItem.reason.split("Sub-criteria to consider:")[1]}
                                                            </>
                                                        ) : rubricItem.reason}
                                                    </span>
                                                </div>
                                                <Field
                                                    name={`section_${section.sectionId}_feedback_${rubricItem.itemId}`}
                                                    component="textarea"
                                                    className="form-control mb-2 w-100"
                                                    placeholder={"Enter your justification here..."}
                                                    rows={2}
                                                    onKeyDown={e => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    disabled
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <div className="row mb-3">
                            <label htmlFor="otherFeedback" className="form-label fw-semibold">Additional Feedback (optional)</label>
                            <Field
                                name='otherFeedback'
                                component="textarea"
                                className="form-control mb-2 w-100"
                                placeholder={"Enter your justification here..."}
                                rows={4}
                                onKeyDown={e => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                    }
                                }}
                            />
                        </div>
                        {formErrorSubmission ? (
                            <div className="border border-danger rounded text-danger px-2 mt-2">
                                {formErrorSubmission}
                            </div>
                        ) : (<div></div>)}
                        <div className="d-flex justify-content-end mt-3 mb-3">
                            <button type="submit" className="btn btn-success ms-2 me-2 w-100 w-md-auto">
                                Submit
                            </button>
                        </div>
                    </div>
                </form>
            )}
        />
    );

    const renderFull = () => (
        <Form
            onSubmit={handleSubmit}
            render={({ handleSubmit }) => (
                <form onSubmit={handleSubmit}>
                    <div className="container">
                        <div className="row mb-3">
                            <h3 className="text-center">{evaluation?.title} - EDIT</h3>
                        </div>
                        <div className="row mb-3">
                            <Field
                                name='instructions'
                                component="textarea"
                                className="form-control card border border-tertiary p-2 rounded"
                                initialValue={evaluation?.instructions}
                                rows={8}
                                onKeyDown={e => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                    }
                                }}
                            />
                        </div>
                        {/* Desktop Header Row - Hidden on mobile */}
                        <div className="row d-none d-md-flex mb-2">
                            <div className="col-4 fw-bold border text-center">AI Output</div>
                            <div className="col-4 fw-bold border text-center">Rubric Selection</div>
                            <div className="col-4 fw-bold border text-center"> Jusification for Your Answer</div>
                        </div>
                        <div className="row mb-3">
                            {/* Mobile Headers */}
                            <div className="d-block d-md-none mb-2">
                                <div className="fw-bold">AI Output</div>
                            </div>
                            {/* AI Output */}
                            <div
                                className="col-12 col-md-4 border d-flex mb-2 mb-md-0"
                                style={{
                                    minHeight: 120,
                                    maxHeight: 1000,
                                    overflowY: "auto",
                                    overflowX: "hidden",
                                    display: "block",
                                    whiteSpace: "pre-wrap",
                                    wordBreak: "break-word"
                                }}
                            >
                                <div className="container">
                                    {evaluation?.transcript.map((chat, idx) => {
                                        if (chat.kind === "llm") {
                                            return (
                                                <div key={idx} className="text-start">

                                                    <Field
                                                        name={`chat_${chat.chatId}`}
                                                        component="textarea"
                                                        className="row card border border-warning border-3 px-2 py-2 w-100 pre-wrap"
                                                        initialValue={chat.content}
                                                        rows={8}
                                                    />


                                                    <p>LLM</p>
                                                </div>


                                            );
                                        } else if (chat.kind === 'human') {
                                            return (
                                                <div key={idx} className="text-start">
                                                    <Field
                                                        name={`chat_${chat.chatId}`}
                                                        component="textarea"
                                                        className="row card border border-info border-3 px-2 py-2 w-100 pre-wrap"
                                                        initialValue={chat.content}
                                                        rows={8}
                                                    />


                                                    <p className="text-end">User</p>
                                                </div>
                                            );
                                        }
                                    })}
                                </div>

                            </div>
                            <div className="col-12 col-md-8 border">
                                {evaluation?.rubricItems.map((rubricItem, rubricIdx) => (
                                    <div key={rubricItem.itemId || rubricIdx} className="row mb-3 justify-content-center border-bottom border-secondary ">
                                        {/* Rubric Selection */}
                                        <div className="col-12 col-md-6 mb-2 mb-md-0">
                                            <Field
                                                name={`rubricItem_${rubricItem.itemId}_title`}
                                                component='input'
                                                className="fw-semibold border-bottom mb-3 w-100 rounded"
                                                initialValue={rubricItem.title}

                                            />
                                            <Field
                                                name={`rubricItem_${rubricItem.itemId}_caption`}
                                                component='textarea'
                                                className="mb-3 w-100 rounded"
                                                initialValue={rubricItem.caption}
                                                rows={4}
                                            />

                                            {renderRubricField("full", rubricItem)}
                                        </div>

                                        {/* Free Text */}
                                        <div className="col-12 col-md-6">
                                            <div
                                                className="bg-light border-start border-4 border-secondary rounded-3 px-3 py-2 mb-2"
                                                style={{ whiteSpace: "pre-wrap", fontSize: "0.97rem" }}
                                            >
                                                <span className="small text-muted">
                                                    <Field
                                                        name={`rubricItem_${rubricItem.itemId}_reason`}
                                                        component='textarea'
                                                        className="fw-semibold border-bottom mb-3 w-100 rounded"
                                                        initialValue={rubricItem.reason}
                                                        rows={12}

                                                    />
                                                </span>
                                            </div>

                                            <Field
                                                name={`full_feedback_${rubricItem.itemId}`}
                                                component="textarea"
                                                className="form-control mb-2 w-100"
                                                placeholder={"Enter your justification here..."}
                                                rows={4}
                                                onKeyDown={e => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                disabled
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="row mb-3">
                            <label htmlFor="otherFeedback" className="form-label fw-semibold">Additional Feedback (optional)</label>
                            <Field
                                name='otherFeedback'
                                component="textarea"
                                className="form-control mb-2 w-100"
                                placeholder={"Enter your justification here..."}
                                rows={4}
                                onKeyDown={e => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                    }
                                }}
                            />
                        </div>
                        {formErrorSubmission ? (
                            <div className="border border-danger rounded text-danger px-2 mt-2">
                                {formErrorSubmission}
                            </div>
                        ) : (<div></div>)}
                        <div className="d-flex justify-content-end mt-3 mb-3">
                            <button type="submit" className="btn btn-success ms-2 me-2 mb-2 w-100 w-md-auto">
                                Submit
                            </button>
                        </div>
                    </div>
                </form>
            )}
        />
    );

    if (evaluation?.kind === "SectionsLLMResponseEvaluation") {
        return renderSections();
    } else if (evaluation?.kind === "FullLLMResponseEvaluation") {
        return renderFull();
    }
    return null;
};

export default EditExistingEvaluation;