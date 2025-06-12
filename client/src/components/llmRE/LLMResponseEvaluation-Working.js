import { Spinner } from "reactstrap";
import { useParams } from "react-router-dom";
import { useFetchEvaluationQuery, useCreateEvaluationResponseMutation, useFetchUserEvaluationResponseQuery } from "../../store";
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

const LLMResponseEvaluation = () => {
    const { evaluationId } = useParams();
    const { data: evaluation, isLoading, error } = useFetchEvaluationQuery({ evaluationId });
    const [createEvaluationResponse, { isLoading: isLoadingResponse, error: errorResponse }] = useCreateEvaluationResponseMutation();
    const { data: userResponse, isLoading: isLoadingUserResponse } = useFetchUserEvaluationResponseQuery({ evaluationId });
    const [formErrorSubmission, setFormErrorSubmission] = useState("");
    const navigate = useNavigate();

    if (isLoading || isLoadingResponse || isLoadingUserResponse) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner color="primary" />
            </div>
        );
    }
    if (error || errorResponse) {
        return (
            <div className="border border-danger rounded text-danger px-2 mt-2">
                {error || errorResponse}
            </div>
        )
    }

    const mapResponseToInitialValues = (response) => {
        if (!response || !response.responses) return {};
        const initialValues = {};
        response.responses.forEach(section => {
            section.rubricResponses.forEach(rubric => {
                const sectionId = section.sectionId;
                const itemId = rubric.itemId;
                if (rubric.selectedRadioOption !== undefined) {
                    initialValues[`section_${sectionId}_rubric_${itemId}_type_radio`] = rubric.selectedRadioOption;
                }
                if (rubric.selectedCheckboxOptions && rubric.selectedCheckboxOptions.length > 0) {
                    rubric.selectedCheckboxOptions.forEach(idx => {
                        // If you store label, you may need to map label to index
                        initialValues[`section_${sectionId}_rubric_${itemId}_type_checkbox_checkbox_${idx}`] = true;
                    });
                }
                if (rubric.selectedSwitchOption !== undefined) {
                    initialValues[`section_${sectionId}_rubric_${itemId}_type_switch`] = rubric.selectedSwitchOption;
                }
                if (rubric.selectedRangeOption !== undefined) {
                    initialValues[`section_${sectionId}_rubric_${itemId}_type_range`] = rubric.selectedRangeOption;
                }
                if (rubric.feedback !== undefined) {
                    initialValues[`section_${sectionId}_feedback_${itemId}`] = rubric.feedback;
                }
            });
        });
        return initialValues;
    };

    const reformatValuesForResponse = (values) => {
        // Structure: { [sectionId]: { rubricResponses: [ ... ] } }
        const sectionMap = {};

        Object.entries(values).forEach(([key, value]) => {
            // Match rubric fields: section_{sectionId}_rubric_{itemId}_type_{type}
            let rubricMatch = key.match(/^section_(\d+)_rubric_(\d+)_type_([a-zA-Z]+)(?:_checkbox_(\d+))?$/);
            // Match feedback fields: section_{sectionId}_feedback_{itemId}
            let feedbackMatch = key.match(/^section_(\d+)_feedback_(\d+)$/);

            if (rubricMatch) {
                const [, sectionId, itemId, type, checkboxIdx] = rubricMatch;
                sectionMap[sectionId] = sectionMap[sectionId] || {};
                sectionMap[sectionId][itemId] = sectionMap[sectionId][itemId] || {};

                if (type === "radio") {
                    sectionMap[sectionId][itemId].selectedRadioOption = value;
                } else if (type === "checkbox") {
                    // Collect all checked options in an array
                    sectionMap[sectionId][itemId].selectedCheckboxOptions = sectionMap[sectionId][itemId].selectedCheckboxOptions || [];
                    if (value) {
                        // You may want to store the label instead of index, but here we store index
                        sectionMap[sectionId][itemId].selectedCheckboxOptions.push(Number(checkboxIdx));
                    }
                } else if (type === "switch") {
                    sectionMap[sectionId][itemId].selectedSwitchOption = value;
                } else if (type === "range") {
                    sectionMap[sectionId][itemId].selectedRangeOption = value;
                }
            } else if (feedbackMatch) {
                const [, sectionId, itemId] = feedbackMatch;
                sectionMap[sectionId] = sectionMap[sectionId] || {};
                sectionMap[sectionId][itemId] = sectionMap[sectionId][itemId] || {};
                sectionMap[sectionId][itemId].feedback = value;
            }
        });

        // Convert to array format expected by the model
        const responses = Object.entries(sectionMap).map(([sectionId, rubricObj]) => ({
            sectionId: Number(sectionId),
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
            console.log(submission)
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
                <form onSubmit={handleSubmit}>
                    <div className="container">
                        <div className="row">
                            <h3 className="text-center">{evaluation?.title}</h3>
                        </div>
                        <div className="row">
                            <p className="card bg-body-tertiary border border-tertiary p-2 rounded">
                                {evaluation?.instructions}
                            </p>
                        </div>
                        <div className="row">
                            <div className="col-4 fw-bold border rounded text-center">AI Output</div>
                            <div className="col-4 fw-bold border text-center">Rubric Selection</div>
                            <div className="col-4 fw-bold border text-center">Free Text</div>
                        </div>
                        {evaluation?.llmOutput.map((section, sectionIdx) => (
                            <div className="row" key={section.sectionId || sectionIdx}>
                                {/* AI Output */}
                                <div
                                    className="col-4 border d-flex align-items-center"
                                    style={{
                                        minHeight: 120,
                                        overflowWrap: "break-word",
                                        wordBreak: "break-word",
                                        whiteSpace: "pre-wrap"
                                    }}
                                >
                                    {section.llmOutput}
                                </div>
                                {/* Rubric Items and Free Text, aligned */}
                                <div className="col-8 border">
                                    {evaluation.rubricItems.map((rubricItem, rubricIdx) => (
                                        <div key={rubricItem.itemId || rubricIdx} className="row mb-3 align-items-center">
                                            {/* Rubric Selection */}
                                            <div className="col-6">
                                                <div className="fw-semibold">{rubricItem.title}</div>
                                                <div className="mb-1">{rubricItem.caption}</div>
                                                {renderRubricField(section.sectionId, rubricItem)}
                                            </div>
                                            {/* Free Text */}
                                            <div className="col-6">
                                                <Field
                                                    name={`section_${section.sectionId}_feedback_${rubricItem.itemId}`}
                                                    component="textarea"
                                                    className="form-control mb-2"
                                                    placeholder={rubricItem.reason || "Enter feedback..."}
                                                    rows={2}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {formErrorSubmission ? (
                            <div className="border border-danger rounded text-danger px-2 mt-2">
                                {formErrorSubmission}
                            </div>
                        ) : (<div></div>)}
                        <div className="d-flex justify-content-end mt-3">
                            <button type="submit" className="btn btn-success ms-2 me-2">
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
            initialValues={mapResponseToInitialValues(userResponse)}
            render={({ handleSubmit }) => (
                <form onSubmit={handleSubmit}>
                    <div className="container">
                        <div className="row">
                            <h3 className="text-center">{evaluation?.title}</h3>
                        </div>
                        <div className="row">
                            <p className="card bg-body-tertiary border border-tertiary p-2 rounded">
                                {evaluation?.instructions}
                            </p>
                        </div>
                        <div className="row">
                            <div className="col-4 fw-bold border text-center">AI Output</div>
                            <div className="col-4 fw-bold border text-center">Rubric Selection</div>
                            <div className="col-4 fw-bold border text-center">Free Text</div>
                        </div>
                        <div className="row">
                            {/* AI Output */}
                            <div className="col-4 border d-flex align-items-center" style={{ minHeight: 120 }}>
                                {evaluation?.llmOutput}
                            </div>
                            {/* Rubric Selection */}
                            <div className="col-4 border">
                                {evaluation?.rubricItems.map((rubricItem, rubricIdx) => (
                                    <div key={rubricItem.itemId || rubricIdx} className="mb-3">
                                        <div className="fw-semibold">{rubricItem.title}</div>
                                        <div className="mb-1">{rubricItem.caption}</div>
                                        {renderRubricField("full", rubricItem)}
                                    </div>
                                ))}
                            </div>
                            {/* Free Text */}
                            <div className="col-4 border">
                                {evaluation.rubricItems.map((rubricItem, rubricIdx) => (
                                    <div key={rubricItem.itemId || rubricIdx} className="mb-3">
                                        <Field
                                            name={`full_feedback_${rubricItem.itemId}`}
                                            component="textarea"
                                            className="form-control mb-2"
                                            placeholder={rubricItem.reason || "Enter feedback..."}
                                            rows={2}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        {formErrorSubmission ? (
                            <div className="border border-danger rounded text-danger px-2 mt-2">
                                {formErrorSubmission}
                            </div>
                        ) : (<div></div>)}
                        <div className="d-flex justify-content-end mt-3">
                            <button type="submit" className="btn btn-success ms-2 me-2">
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

export default LLMResponseEvaluation;