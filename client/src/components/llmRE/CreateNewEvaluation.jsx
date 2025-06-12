import { Form, Field } from "react-final-form";
import DOMPurify from 'dompurify';
import { Spinner } from "reactstrap";
import { useState } from "react";
import { GoTrash } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import { useCreateEvaluationMutation, useFetchAllUsersQuery } from "../../store";

const LLMRECreate = () => {

    const navigate = useNavigate();

    const [createEvalution, { isLoading, error }] = useCreateEvaluationMutation();

    //REMOVE: For reuse
    const { data: allUsers, isLoading: isLoadingAllUsers, error: errorAllUsers } = useFetchAllUsersQuery();

    const [formErrorLLMOutput, setFormErrorLLMOutput] = useState("");
    const [formErrorRubric, setFormErrorRubric] = useState("");
    const [formErrorSubmission, setFormErrorSubmission] = useState("");
    const [sections, setSections] = useState([]);
    const [rubricItems, setRubricItems] = useState([]);

    if (isLoading || isLoadingAllUsers) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner color="primary" />
            </div>
        );
    }
    if (error || errorAllUsers) {
        return (
            <div className="border border-danger rounded text-danger px-2 mt-2">
                {error}
            </div>
        )
    }

    //REMOVE: For reuse
    // Extract participants from all users in the system
    const participants = allUsers ? allUsers.filter(user => user.role === "participant") : [];


    const validate = (values) => {
        if (values.title === "" || values.title === undefined) {
            return { title: "Title is required" }
        }
        const cleanedValues = Object.keys(values).reduce((acc, key) => {
            acc[key] = DOMPurify.sanitize(values[key]);
            return acc;
        }, {});
    };

    const handleFormSubmit = async (values) => {
        let evaluation = {};
        let selectedParticipants = [];
        console.log(values);

        if (sections.length === 0 && !values.isFullTranscript) {
            setFormErrorLLMOutput("At least one AI generated response is required, please add a section or a full transcript");
        }

        if (rubricItems.length === 0) {
            setFormErrorRubric("At least on rubric item is required, please add a rubric item");
        }

        //REMOVE: For reuse
        if (values.participants.length <= 0) {
            setFormErrorSubmission("At least one participant is required, please add at least one participant to this evaluation task")
        } else {
            values.participants.map((id, index) => {
                const participantObj = participants.find(user => user._id === id);
                if (participantObj) {
                    selectedParticipants.push(participantObj);
                }
            })
        }

        //REMOVE: For reuse (Specfically remove the "participants" item from the evaluation object)
        if (sections.length > 0 && rubricItems.length > 0) {
            evaluation = { "title": values.title, "instructions": values.instructions, "llmOutput": sections, "rubricItems": rubricItems, "participants": selectedParticipants };
        } else if (values.isFullTranscript && rubricItems.length > 0) {
            evaluation = { "title": values.title, "instructions": values.instructions, "llmOutput": values.llmOutput, "rubricItems": rubricItems, "participants": selectedParticipants };
        }

        try {
            await createEvalution(evaluation).unwrap();
            navigate('/home');
        } catch (err) {
            console.error("CreateNewEvaluation: Error creating evaluation", err);
            setFormErrorSubmission(err);
        }


    };

    // Add a new section
    const handleAddSection = (e) => {
        e.preventDefault();
        setSections(prev => [
            ...prev,
            { sectionId: Date.now(), llmOutput: "" }
        ]);
    };

    // Update a section's llmOutput
    const handleSectionChange = (index, value) => {
        setSections(prev => prev.map((section, i) =>
            i === index ? { ...section, llmOutput: value } : section
        ));
        setFormErrorLLMOutput();
    };

    // Remove a section
    const handleRemoveSection = (index) => {
        setSections(prev => prev.filter((_, i) => i !== index));
    };

    // Add a new rubric item
    const handleAddRubricItem = (e) => {
        e.preventDefault();
        setRubricItems(prev => [
            ...prev,
            {
                itemId: Date.now(),
                title: "",
                caption: "",
                objectType: "radio",
                checkboxLabels: [""],
                radioLabels: ["", ""],
                reason: ""
            }
        ]);
    };

    // Update a rubric item's field
    const handleRubricItemChange = (idx, field, value) => {
        setRubricItems(prev =>
            prev.map((item, i) =>
                i === idx ? { ...item, [field]: value } : item
            )
        );
        setFormErrorRubric();
    };

    // Add/remove label for checkbox/radio
    const handleAddLabel = (idx, type) => {
        setRubricItems(prev =>
            prev.map((item, i) =>
                i === idx
                    ? { ...item, [type]: [...item[type], ""] }
                    : item
            )
        );
    };
    const handleLabelChange = (idx, type, labelIdx, value) => {
        setRubricItems(prev =>
            prev.map((item, i) =>
                i === idx
                    ? {
                        ...item,
                        [type]: item[type].map((label, j) =>
                            j === labelIdx ? value : label
                        )
                    }
                    : item
            )
        );
    };
    const handleRemoveLabel = (idx, type, labelIdx) => {
        setRubricItems(prev =>
            prev.map((item, i) =>
                i === idx
                    ? {
                        ...item,
                        [type]: item[type].filter((_, j) => j !== labelIdx)
                    }
                    : item
            )
        );
    };

    const handleRemoveRubricItem = (idx) => {
        setRubricItems(prev => prev.filter((_, i) => i !== idx));
    };


    return (
        <div className="container-fluid">
            <h3 className="text-center mb-4">Create an LLM Response Evaluation</h3>

            <Form
                onSubmit={handleFormSubmit}
                initialValues={{}}
                validate={validate}
                onKeyDown={e => {
                    if (e.key === "Enter" ){
                        e.preventDefault();
                    }
                }}
                render={({ handleSubmit, submitError }) => (
                    <form onSubmit={handleSubmit}>
                        {/* Title Card */}
                        <div className="row my-3">
                            <div className="card bg-body-tertiary border border-tertiary p-2 rounded">
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Evaluation Title</label>
                                    <Field
                                        name="title"
                                        component="input"
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter title for evaluation task"
                                        required
                                    />
                                    <Field name="title">
                                        {({ meta }) => meta.error && meta.touched && <span className="text-danger">{meta.error}</span>}
                                    </Field>
                                </div>
                            </div>
                        </div>
                        {/* Instructions Card */}
                        <div className="row my-3">
                            <div className="card bg-body-tertiary border border-tertiary p-2 rounded">
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Evaluation Instructions</label>
                                    <Field
                                        name="instructions"
                                        component="textarea"
                                        className="form-control"
                                        placeholder="Enter instructions for evaluation task"
                                        required
                                    />
                                    <Field name="instructions">
                                        {({ meta }) => meta.error && meta.touched && <span className="text-danger">{meta.error}</span>}
                                    </Field>
                                </div>
                            </div>
                        </div>
                        {/* LLM Response Type Card */}
                        <div className="row my-3">
                            <div className="card bg-body-tertiary border border-tertiary p-2 rounded">
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Full LLM Transcript or Sections of a Transcript?</label>
                                    <Field name="isFullTranscript" type="checkbox">
                                        {({ input, meta }) => (
                                            <>
                                                <div className="form-check form-switch">
                                                    <input
                                                        {...input}
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        id="transcriptSwitch"
                                                    />
                                                    <label className="form-check-label" htmlFor="transcriptSwitch">
                                                        {input.checked ? "Full Transcript" : "Sections of a Transcript"}
                                                    </label>
                                                </div>
                                                {meta.error && meta.touched && (
                                                    <span className="text-danger">{meta.error}</span>
                                                )}
                                                {/* Conditional rendering based on switch */}
                                                {input.checked ? (
                                                    // Full Transcript: show one textarea
                                                    <div className="mt-3">
                                                        <label>LLM Transcript</label>
                                                        <Field
                                                            name="llmOutput"
                                                            component="textarea"
                                                            className="form-control"
                                                            placeholder="Paste the full transcript here"
                                                            rows={7}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="card bg-body-secondary mt-3">
                                                        <label>Sections</label>
                                                        <div>
                                                            <button
                                                                className="btn btn-info mx-2 my-2"
                                                                onClick={handleAddSection}
                                                                type="button"
                                                            >
                                                                Add New Section
                                                            </button>
                                                        </div>
                                                        {/* Render a textarea for each section */}
                                                        {sections.map((section, idx) => (
                                                            <div key={section.sectionId} className="my-2 pb-2">
                                                                <label>Section {idx + 1}</label>
                                                                <div className="d-flex align-items-start gap-2">
                                                                    <textarea
                                                                        className="form-control"
                                                                        value={section.llmOutput}
                                                                        onChange={e => handleSectionChange(idx, e.target.value)}
                                                                        placeholder="Paste section transcript here"
                                                                    />
                                                                    <button
                                                                        className="btn btn-danger btn-sm mt-1"
                                                                        type="button"
                                                                        onClick={() => handleRemoveSection(idx)}
                                                                        aria-label="Remove section"
                                                                    >
                                                                        <GoTrash />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </Field>
                                    {formErrorLLMOutput ? (
                                        <div className="border border-danger rounded text-danger px-2 mt-2">
                                            {formErrorLLMOutput}
                                        </div>
                                    ) : (<div></div>)}
                                </div>
                            </div>
                        </div>


                        {/* LLM Rubric Card */}
                        <div className="row my-3">
                            <div className="card bg-body-tertiary border border-tertiary p-2 rounded">
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Evaluation Rubric Items</label>
                                    <br />

                                    {rubricItems.map((item, idx) => (
                                        <div key={item.itemId} className="my-3 p-2 border rounded bg-body-secondary">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <strong>Rubric Item {idx + 1}</strong>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    type="button"
                                                    onClick={() => handleRemoveRubricItem(idx)}
                                                    aria-label="Remove rubric item"
                                                >
                                                    <GoTrash />
                                                </button>
                                            </div>
                                            <div className="mt-2">
                                                <input
                                                    type="text"
                                                    className="form-control mb-2"
                                                    placeholder="Title"
                                                    value={item.title}
                                                    onChange={e => handleRubricItemChange(idx, "title", e.target.value)}
                                                />
                                                <input
                                                    type="text"
                                                    className="form-control mb-2"
                                                    placeholder="Caption"
                                                    value={item.caption}
                                                    onChange={e => handleRubricItemChange(idx, "caption", e.target.value)}
                                                />
                                                <select
                                                    className="form-select mb-2"
                                                    value={item.objectType}
                                                    onChange={e => handleRubricItemChange(idx, "objectType", e.target.value)}
                                                >
                                                    <option value="radio">Radio</option>
                                                    <option value="checkbox">Checkbox</option>
                                                    <option value="switch">Switch</option>
                                                    <option value="range">Range</option>
                                                </select>
                                                {/* Conditionally render label fields */}
                                                {(item.objectType === "checkbox" || item.objectType === "radio") && (
                                                    <div className="mb-2">
                                                        <label>
                                                            {item.objectType === "checkbox" ? "Checkbox Labels" : "Radio Labels"}
                                                        </label>
                                                        {item[item.objectType + "Labels"].map((label, labelIdx) => (
                                                            <div key={labelIdx} className="d-flex align-items-center mb-1">
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    value={label}
                                                                    onChange={e =>
                                                                        handleLabelChange(idx, item.objectType + "Labels", labelIdx, e.target.value)
                                                                    }
                                                                    placeholder={`Label ${labelIdx + 1}`}
                                                                />
                                                                <button
                                                                    className="btn btn-danger btn-sm ms-2"
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleRemoveLabel(idx, item.objectType + "Labels", labelIdx)
                                                                    }
                                                                    aria-label="Remove label"
                                                                >
                                                                    <GoTrash />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <button
                                                            className="btn btn-secondary btn-sm mt-1"
                                                            type="button"
                                                            onClick={() => handleAddLabel(idx, item.objectType + "Labels")}
                                                        >
                                                            Add Label
                                                        </button>
                                                    </div>
                                                )}
                                                {/* Reason field for all types */}
                                                <textarea
                                                    className="form-control"
                                                    placeholder="Reason Label"
                                                    value={item.reason}
                                                    onChange={e => handleRubricItemChange(idx, "reason", e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        className="btn btn-info btn-sm ms-2"
                                        onClick={handleAddRubricItem}
                                        type="button"
                                    >
                                        Add Rubric Item
                                    </button>
                                    {formErrorRubric ? (
                                        <div className="border border-danger rounded text-danger px-2 mt-2">
                                            {formErrorRubric}
                                        </div>
                                    ) : (<div></div>)}
                                </div>
                            </div>
                        </div>
                        {/*
                            //REMOVE: For reuse
                            Participants Selection Card 
                        */}
                        <div className="row my-3">
                            <div className="card bg-body-tertiary border border-tertiary p-2 rounded">
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Assign Participants</label>
                                    {participants.length === 0 ? (
                                        <div className="text-muted">No participants available.</div>
                                    ) : (
                                        <Field name="participants">
                                            {({ input }) => (
                                                <div>
                                                    {participants.map((user) => (
                                                        <div key={user._id} className="form-check">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                id={`participant_${user._id}`}
                                                                value={user._id}
                                                                checked={Array.isArray(input.value) && input.value.includes(user._id)}
                                                                onChange={e => {
                                                                    let newValue = Array.isArray(input.value) ? [...input.value] : [];
                                                                    if (e.target.checked) {
                                                                        if (!newValue.includes(user._id)) {
                                                                            newValue.push(user._id);
                                                                        }
                                                                    } else {
                                                                        newValue = newValue.filter(id => id !== user._id);
                                                                    }
                                                                    input.onChange(newValue);
                                                                }}
                                                            />
                                                            <label className="form-check-label" htmlFor={`participant_${user._id}`}>
                                                                {user.username || user.email || user._id}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </Field>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="d-flex justify-content-end mt-3 mb-3">
                            <button type="submit" className="btn btn-success ms-2 me-2">
                                Create Evaluation
                            </button>
                        </div>
                    </form>
                )}

            />

        </div>
    )
};

export default LLMRECreate;