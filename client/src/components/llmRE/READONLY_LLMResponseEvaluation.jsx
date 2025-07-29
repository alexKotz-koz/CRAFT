import { Spinner } from "reactstrap";
import { useParams } from "react-router-dom";
import { useFetchEvaluationQuery, useFetchEvaluationResponseByIdQuery, useCreateEvaluationResponseMutation } from "../../store/apis/llmREApi";

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

const READONLY_LLMResponseEvaluation = () => {
    //const { evaluationId } = useParams();
    //const { data: evaluation, isLoading, error } = useFetchEvaluationQuery({ evaluationId });

    //const { data: userResponse, isLoading: isLoadingUserResponse } = useFetchUserEvaluationResponseQuery({ evaluationId });

    const { evaluationId, responseId } = useParams();
    const { data: evaluation, isLoading: loadingEval } = useFetchEvaluationQuery({ evaluationId });
    const [createEvaluationResponse, { isLoading: isLoadingResponse, error: errorResponse }] = useCreateEvaluationResponseMutation();
    const { data: userResponse, isLoading: loadingResp } = useFetchEvaluationResponseByIdQuery({ responseId });
    // All hooks must be called before any return!
    const [formErrorSubmission, setFormErrorSubmission] = useState("");
    const navigate = useNavigate();

    if (loadingEval || loadingResp) return <div>Loading...</div>;



    const mapResponseToInitialValues = (response) => {
        if (!response || !response.responses) return {};
        const initialValues = {};

        response.responses.forEach(section => {
            initialValues['otherFeedback'] = section.otherFeedback;
            section.rubricResponses.forEach(rubric => {
                const sectionId = section.sectionId;
                const itemId = rubric.itemId;
                if (rubric.selectedRadioOption !== undefined) {
                    initialValues[`section_${sectionId}_rubric_${itemId}_type_radio`] = rubric.selectedRadioOption;
                }
                if (rubric.selectedCheckboxOptions && rubric.selectedCheckboxOptions.length > 0) {
                    rubric.selectedCheckboxOptions.forEach(idx => {

                        initialValues[`section_${sectionId}_rubric_${itemId}_type_checkbox_checkbox_${idx}`] = true;
                    });
                }
                if (rubric.selectedSwitchOption !== undefined) {
                    initialValues[`section_${sectionId}_rubric_${itemId}_type_switch`] = rubric.selectedSwitchOption;
                }
                if (rubric.selectedRangeOption !== undefined) {
                    initialValues[`section_${sectionId}_rubric_${itemId}_type_range`] = rubric.selectedRangeOption;
                }
                if (sectionId === "full") {
                    if (rubric.feedback !== undefined) {
                        initialValues[`${sectionId}_feedback_${itemId}`] = rubric.feedback;
                    }
                } else {
                    if (rubric.feedback !== undefined) {
                        initialValues[`section_${sectionId}_feedback_${itemId}`] = rubric.feedback;
                    }
                }

            });
        });
        return initialValues;
    };

    const reformatValuesForResponse = (values) => {
        const sectionMap = {};

        Object.entries(values).forEach(([key, value]) => {
            // Match rubric fields: section_{sectionId}_rubric_{itemId}_type_{type}
            let rubricMatch = key.match(/^section_([a-zA-Z0-9]+)_rubric_(\d+)_type_([a-zA-Z]+)(?:_checkbox_(\d+))?$/);
            // Match feedback fields: {sectionId}_feedback_{itemId} OR full_feedback_{itemId}
            let fullFeedbackMatch = key.match(/^([a-zA-Z0-9]+)_feedback_(\d+)$/);
            let sectionFeedbackMatch = key.match(/^section_([a-zA-Z0-9]+)_feedback_(\d+)$/);

            if (rubricMatch) {
                const [, sectionId, itemId, type, checkboxIdx] = rubricMatch;
                sectionMap[sectionId] = sectionMap[sectionId] || {};
                sectionMap[sectionId][itemId] = sectionMap[sectionId][itemId] || {};

                if (type === "radio") {
                    sectionMap[sectionId][itemId].selectedRadioOption = value;
                } else if (type === "checkbox") {
                    sectionMap[sectionId][itemId].selectedCheckboxOptions = sectionMap[sectionId][itemId].selectedCheckboxOptions || [];
                    if (value) {
                        sectionMap[sectionId][itemId].selectedCheckboxOptions.push(Number(checkboxIdx));
                    }
                } else if (type === "switch") {
                    sectionMap[sectionId][itemId].selectedSwitchOption = value;
                } else if (type === "range") {
                    sectionMap[sectionId][itemId].selectedRangeOption = value;
                }
            } else if (fullFeedbackMatch) {
                const [, sectionId, itemId] = fullFeedbackMatch;
                sectionMap[sectionId] = sectionMap[sectionId] || {};
                sectionMap[sectionId][itemId] = sectionMap[sectionId][itemId] || {};
                sectionMap[sectionId][itemId].feedback = value;
            } else if (sectionFeedbackMatch) {
                const [, sectionId, itemId] = sectionFeedbackMatch;
                sectionMap[sectionId] = sectionMap[sectionId] || {};
                sectionMap[sectionId][itemId] = sectionMap[sectionId][itemId] || {};
                sectionMap[sectionId][itemId].feedback = value;
            }
        });

        // Convert to array format expected by the model
        const responses = Object.entries(sectionMap).map(([sectionId, rubricObj]) => ({
            sectionId: isNaN(Number(sectionId)) ? sectionId : Number(sectionId),
            rubricResponses: Object.entries(rubricObj).map(([itemId, resp]) => ({
                itemId: Number(itemId),
                selectedRadioOption: resp.selectedRadioOption,
                selectedCheckboxOptions: resp.selectedCheckboxOptions,
                selectedSwitchOption: resp.selectedSwitchOption,
                selectedRangeOption: resp.selectedRangeOption,
                feedback: resp.feedback
            }))
        }));

        return responses;
    };

    const handleSubmit = async (values) => {
        let submission = {
            evaluationId,
            responses: reformatValuesForResponse(values)
        };

        try {
            await createEvaluationResponse(submission).unwrap();
            navigate('/home');
        } catch (err) {
            console.error("CreateEvaluationResponse: Error creating evaluation response", err);
            setFormErrorSubmission(err);
        }
    };

    const renderSections = () => (
        <Form
            onSubmit={handleSubmit}
            initialValues={mapResponseToInitialValues(userResponse)}

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
                            <h3 className="text-center">
                                {evaluation?.title}
                                {userResponse.userId.username && (
                                    <span className="ms-2 text-secondary" >
                                        — {userResponse.userId.email}
                                    </span>
                                )}
                            </h3>
                        </div>
                        <div className="row mb-3">
                            <div
                                className="card bg-body-tertiary border border-tertiary p-2 rounded"
                                style={{ whiteSpace: "pre-line" }}
                            >
                                {evaluation?.instructions}
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
                                                <Field
                                                    name={`section_${section.sectionId}_feedback_${rubricItem.itemId}`}
                                                    component="textarea"
                                                    className="form-control mb-2 w-100"
                                                    placeholder={rubricItem.reason || "Enter feedback..."}
                                                    rows={2}
                                                    onKeyDown={e => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault();
                                                        }
                                                    }}
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
                                disabled
                            />
                        </div>
                    </div>
                </form>
            )}
        />
    );

    const renderFull = () => (
        <Form
            onSubmit={handleSubmit}
            initialValues={mapResponseToInitialValues(userResponse)}
            render={({ handleSubmit }) => (
                <form onSubmit={handleSubmit}>
                    <div className="container">
                        <div className="row mb-3">
                            <h3 className="text-center">
                                {evaluation?.title}
                                {userResponse.userId.username && (
                                    <span className="ms-2 text-secondary" >
                                        — {userResponse.userId.email}
                                    </span>
                                )}
                            </h3>
                        </div>
                        <div className="row mb-3">
                            <div
                                className="card bg-body-tertiary border border-tertiary p-2 rounded"
                                style={{ whiteSpace: "pre-line" }}
                            >
                                {evaluation?.instructions}
                            </div>
                        </div>
                        {/* Desktop Header Row - Hidden on mobile */}
                        <div className="row d-none d-md-flex mb-2">
                            <div className="col-4 fw-bold border text-center">AI Output</div>
                            <div className="col-4 fw-bold border text-center">Rubric Selection</div>
                            <div className="col-4 fw-bold border text-center"> Feedback</div>
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
                            <div className="col-12 col-md-8 border">
                                {evaluation?.rubricItems.map((rubricItem, rubricIdx) => (
                                    <div key={rubricItem.itemId || rubricIdx} className="row mb-3 align-items-center border-bottom border-secondary ">
                                        {/* Rubric Selection */}
                                        <div className="col-12 col-md-6 mb-2 mb-md-0">
                                            <div className="fw-semibold border-bottom mb-3">{rubricItem.title}</div>
                                            <div className="mb-1">{rubricItem.caption}</div>
                                            {renderRubricField("full", rubricItem)}
                                        </div>
                                        {/* Free Text */}
                                        <div className="col-12 col-md-6">
                                            <Field
                                                name={`full_feedback_${rubricItem.itemId}`}
                                                component="textarea"
                                                className="form-control mb-2 w-100"
                                                placeholder={rubricItem.reason || "Enter feedback..."}
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
                                disabled
                            />
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

export default READONLY_LLMResponseEvaluation;