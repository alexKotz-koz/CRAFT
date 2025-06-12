import { Spinner } from "reactstrap";
import { useParams } from "react-router-dom";
import { useFetchEvaluationQuery, useCreateEvaluationResponseMutation, useFetchUserEvaluationResponseQuery } from "../../store";
import { Form, Field } from "react-final-form";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const capitalizeLabel = (label) => {
    if (!label) return "";
    return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
};

const renderRubricField = (sectionId, rubricItem) => {
    const fieldName = `section_${sectionId}_rubric_${rubricItem.itemId}_type_${rubricItem.objectType}`;
    //console.log("Rubric Item Field Name: ",fieldName )
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
                    <Field
                        key={i}
                        name={fieldName}
                        type="radio"
                        value={String(i)}
                    >
                        {({ input }) => (
                            <div className="form-check">
                                <input
                                    {...input}
                                    type="radio"
                                    value={String(i)}
                                    checked={input.value === String(i)}
                                    className="form-check-input"
                                />
                                <label className="form-check-label ms-1">{capitalizeLabel(label)}</label>
                            </div>
                        )}
                    </Field>
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

    const mapResponseToInitialValues = (response) => {
        if (!response || !response.responses) return {};
        const initialValues = {};
        response.responses.forEach(section => {
            section.rubricResponses.forEach(rubric => {
                const sectionId = section.sectionId;
                const itemId = rubric.itemId;
                if (rubric.selectedRadioOption !== undefined) {
                    initialValues[`section_${sectionId}_rubric_${itemId}_type_radio`] = String(rubric.selectedRadioOption);
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


const LLMResponseEvaluation = () => {
    const navigate = useNavigate();
    const { evaluationId } = useParams();

    const { data: evaluation, isLoading, error } = useFetchEvaluationQuery({ evaluationId });
    const { data: userResponse, isLoading: isLoadingUserResponse } = useFetchUserEvaluationResponseQuery({ evaluationId });
    
    const [createEvaluationResponse, { isLoading: isLoadingResponse, error: errorResponse }] = useCreateEvaluationResponseMutation();

    const [formErrorSubmission, setFormErrorSubmission] = useState("");
    const [initialFormValues, setInitialFormValues] = useState({}); // <-- add this
    
    
    useEffect(() => {
        if (userResponse) {
            setInitialFormValues(mapResponseToInitialValues(userResponse));
        }
    }, [userResponse]);

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
            initialValues={initialFormValues}
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
                        {/* Desktop Header Row - Hidden on mobile */}
                        <div className="row d-none d-md-flex">
                            <div className="col-4 fw-bold border rounded text-center">AI Output</div>
                            <div className="col-4 fw-bold border text-center">Rubric Selection</div>
                            <div className="col-4 fw-bold border text-center">Free Text</div>
                        </div>
                        {evaluation?.llmOutput.map((section, sectionIdx) => (
                            <div className="row" key={section.sectionId || sectionIdx}>
                                {/* AI Output */}
                                <div
                                    className="col-md-4 col-12 border d-flex align-items-center"
                                    style={{
                                        minHeight: 120,
                                        overflowWrap: "break-word",
                                        wordBreak: "break-word",
                                        whiteSpace: "pre-wrap"
                                    }}
                                >
                                    {/* Mobile header for AI Output */}
                                    <div className="d-md-none w-100">
                                        <div className="fw-bold text-center mb-2 bg-light p-2 border-bottom">AI Output</div>
                                        <div>{section.llmOutput}</div>
                                    </div>
                                    {/* Desktop content */}
                                    <div className="d-none d-md-block">
                                        {section.llmOutput}
                                    </div>
                                </div>
                                {/* Rubric Items and Free Text, aligned */}
                                <div className="col-md-8 col-12 border">
                                    {evaluation.rubricItems.map((rubricItem, rubricIdx) => (
                                        <div key={rubricItem.itemId || rubricIdx} className="mb-3">
                                            {/* Desktop Layout */}
                                            <div className="row align-items-center d-none d-md-flex">
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

                                            {/* Mobile Layout - Stacked */}
                                            <div className="d-md-none card bg-body-tertiary border border-tertiary mb-3 mt-3">
                                                {/* Rubric Selection Section */}
                                                <div>
                                                    <div className="fw-bold bg-light p-2 border-bottom">Rubric Selection {rubricIdx + 1}</div>
                                                    <div className="p-2">
                                                        <div className="fw-semibold">{rubricItem.title}</div>
                                                        <div className="mb-2">{rubricItem.caption}</div>
                                                        {renderRubricField(section.sectionId, rubricItem)}
                                                    </div>
                                                </div>
                                                {/* Free Text Section */}
                                                <div>
                                                    <div className="fw-bold bg-light p-2 border-bottom">Free Text</div>
                                                    <div className="p-2">
                                                        <Field
                                                            name={`section_${section.sectionId}_feedback_${rubricItem.itemId}`}
                                                            component="textarea"
                                                            className="form-control"
                                                            placeholder={rubricItem.reason || "Enter feedback..."}
                                                            rows={2}
                                                        />
                                                    </div>
                                                </div>
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
                        <div className="d-flex justify-content-end mt-3 mb-3">
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
            initialValues={initialFormValues}
            render={({ handleSubmit, values }) => {
                console.log(values)
                return (
                
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
                        {/* Desktop Header Row - Hidden on mobile */}
                        <div className="row d-none d-md-flex">
                            <div className="col-4 fw-bold border text-center">AI Output</div>
                            <div className="col-4 fw-bold border text-center">Rubric Selection</div>
                            <div className="col-4 fw-bold border text-center">Free Text</div>
                        </div>
                        <div className="row">
                            {/* AI Output */}
                            <div className="col-md-4 col-12 border d-flex align-items-center" style={{ minHeight: 120 }}>
                                {/* Mobile header for AI Output */}
                                <div className="d-md-none w-100">
                                    <div className="fw-bold text-center mb-2 bg-light p-2 border-bottom">AI Output</div>
                                    <div>{evaluation?.llmOutput}</div>
                                </div>
                                {/* Desktop content */}
                                <div className="d-none d-md-block">
                                    {evaluation?.llmOutput}
                                </div>
                            </div>
{/* Rubric Selection and Free Text */}
                            <div className="col-md-8 col-12 border">
                                {evaluation.rubricItems.map((rubricItem, rubricIdx) =>{
                                    console.log("rubricItem: ", rubricItem);

                                return (
                                    <div key={rubricItem.itemId || rubricIdx} className="mb-3">
                                        {/* Desktop Layout */}
                                        <div className="row align-items-center d-none d-md-flex">
                                            {/* Rubric Selection */}
                                            <div className="col-6">
                                                <div className="fw-semibold">{rubricItem.title}</div>
                                                <div className="mb-1">{rubricItem.caption}</div>
                                                {renderRubricField("full", rubricItem)}
                                            </div>
                                            {/* Free Text */}
                                            <div className="col-6">
                                                <Field
                                                    name={`full_feedback_${rubricItem.itemId}`}
                                                    component="textarea"
                                                    className="form-control mb-2"
                                                    placeholder={rubricItem.reason || "Enter feedback..."}
                                                    rows={3}
                                                />
                                            </div>
                                        </div>

                                        {/* Mobile Layout - Stacked */}
                                        <div className="d-md-none card bg-body-tertiary border border-tertiary mb-3 mt-3">
                                            {/* Rubric Selection Section */}
                                            <div >
                                                <div className="fw-bold bg-light p-2 border-bottom">Rubric Selection {rubricIdx + 1}</div>
                                                <div className="p-2">
                                                    <div className="fw-semibold">{rubricItem.title}</div>
                                                    <div className="mb-2">{rubricItem.caption}</div>
                                                    {renderRubricField("full", rubricItem)}
                                                </div>
                                            </div>
                                            {/* Free Text Section */}
                                            <div>
                                                <div className="fw-bold bg-light p-2 border-bottom">Free Text</div>
                                                <div className="p-2">
                                                    <Field
                                                        name={`full_feedback_${rubricItem.itemId}`}
                                                        component="textarea"
                                                        className="form-control"
                                                        placeholder={rubricItem.reason || "Enter feedback..."}
                                                        rows={3}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )})}
                            </div>
                        </div>
                        {formErrorSubmission ? (
                            <div className="border border-danger rounded text-danger px-2 mt-2">
                                {formErrorSubmission}
                            </div>
                        ) : (<div></div>)}
                        <div className="d-flex justify-content-end mt-3 mb-3">
                            <button type="submit" className="btn btn-success ms-2 me-2">
                                Submit
                            </button>
                        </div>
                    </div>
                </form>
            )}}
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