import { Form, Field } from "react-final-form";
import { Spinner } from "reactstrap";
import { useState, useRef } from "react";
import { GoTrash, GoPlus } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import { useCreateEvaluationMutation, useFetchAllUsersQuery } from "../../store";
import {
    validate,
    handleSectionChange,
    handleAddSection,
    handleRemoveSection,
    handleAddLabel,
    handleRemoveLabel,
    handleLabelChange,
    handleAddLLMMessage,
    handleRemoveLLMMessage,
    handleAddHumanMessage,
    handleRemoveHumanMessage,
    handleAddRubricItem,
    handleRemoveRubricItem,
    handleRubricItemChange,
    handleAddSectionHumanMessage,
    handleRemoveSectionHumanMessage,
    handleAddSectionLLMMessage,
    handleRemoveSectionLLMMessage,
    handleAddExistingRubricItems
} from "./createNewEvaluationHelpers";
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

    const [humanMessages, setHumanMessages] = useState([]);
    const [llmMessages, setLLMMessages] = useState([]);
    const humanMessageIdRef = useRef(0);
    const llmMessageIdRef = useRef(0);

    const [sectionHumanMessages, setSectionHumanMessages] = useState({}); // { [sectionId]: [messages] }
    const [sectionLLMMessages, setSectionLLMMessages] = useState({});
    const [sectionHumanMessageIdRef, setSectionHumanMessageIdRef] = useState({});
    const [sectionLLMMessageIdRef, setSectionLLMMessageIdRef] = useState({});

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

    const handleFormSubmit = async (values) => {
        let evaluation = {};
        let selectedParticipants = [];
        let transcript = [];

        if (sections.length === 0 && !values.isFullTranscript) {
            setFormErrorLLMOutput("At least one AI generated response is required, please add a section or a full transcript");
        }

        if (rubricItems.length === 0) {
            setFormErrorRubric("At least on rubric item is required, please add a rubric item");
        }
        //REMOVE: For reuse
        if (!values.participants) {
            setFormErrorSubmission("At least one participant is required, please add at least one participant to this evaluation task")
        } else {
            values.participants.map((id) => {
                const participantObj = participants.find(user => user._id === id);
                if (participantObj) {
                    selectedParticipants.push(participantObj);
                }
            })
        }

        if (values.isFullTranscript) {
            // Collect all human and llm messages in order
            const messageEntries = Object.entries(values)
                .filter(([key]) => key.startsWith("human_message_") || key.startsWith("llm_message_"))
                .map(([key, content]) => {
                    const [kind, , idx] = key.split("_");
                    return {
                        kind,
                        idx: parseInt(idx, 10),
                        content
                    };
                })
                .sort((a, b) => a.idx - b.idx); // Sort by index

            // Determine the correct order based on firstActor selection
            const firstActor = values.firstActor || "human"; // Default to human if not specified

            // Create alternating pattern based on first actor
            const orderedMessages = [];
            const humanMessages = messageEntries.filter(msg => msg.kind === "human");
            const llmMessages = messageEntries.filter(msg => msg.kind === "llm");

            const maxLength = Math.max(humanMessages.length, llmMessages.length);

            for (let i = 0; i < maxLength; i++) {
                if (firstActor === "human") {
                    // Human first pattern: Human, LLM, Human, LLM...
                    if (i < humanMessages.length) {
                        orderedMessages.push({
                            chatId: orderedMessages.length,
                            kind: "human",
                            content: humanMessages[i].content
                        });
                    }
                    if (i < llmMessages.length) {
                        orderedMessages.push({
                            chatId: orderedMessages.length,
                            kind: "llm",
                            content: llmMessages[i].content
                        });
                    }
                } else {
                    // LLM first pattern: LLM, Human, LLM, Human...
                    if (i < llmMessages.length) {
                        orderedMessages.push({
                            chatId: orderedMessages.length,
                            kind: "llm",
                            content: llmMessages[i].content
                        });
                    }
                    if (i < humanMessages.length) {
                        orderedMessages.push({
                            chatId: orderedMessages.length,
                            kind: "human",
                            content: humanMessages[i].content
                        });
                    }
                }
            }

            transcript = orderedMessages;
        } else if (!values.isFullTranscript) {
            //1. Collect all section message fields
            const sectionMessages = Object.entries(values)
                .filter(([key]) =>
                    key.startsWith("section_") &&
                    (key.includes("_human_message_") || key.includes("_llm_message"))
                )
                .map(([key, content]) => {
                    // key: section_{sectionId}_x_message_{chatId}
                    const parts = key.split("_");
                    const sectionId = Number(parts[1]);
                    const kind = parts[2];
                    const chatId = Number(parts[4]);
                    return { sectionId, kind, chatId, content };
                });

            //2. Group by sectionId
            const sectionsMap = {};
            sectionMessages.forEach(msg => {
                if (!sectionsMap[msg.sectionId]) {
                    sectionsMap[msg.sectionId] = [];
                }
                sectionsMap[msg.sectionId].push({
                    chatId: msg.chatId,
                    kind: msg.kind,
                    content: msg.content
                });
            });

            //3. Build sections array, sorted by chatId
            const sectionsArr = Object.entries(sectionsMap).map(([sectionId, transcript]) => ({
                sectionId: Number(sectionId),
                transcript: transcript.sort((a, b) => a.chatId - b.chatId)
            }));

            evaluation = {
                title: values.title,
                instructions: values.instructions,
                sections: sectionsArr,
                rubricItems,
                participants: selectedParticipants,
                isFullTranscript: false,
                index: values.index
            };
        }


        // Format data based on transcript type (Full or Sections)
        //REMOVE: For reuse (Specfically remove the "participants" item from the evaluation object)
        if (values.isFullTranscript && rubricItems.length > 0) {
            evaluation = { "title": values.title, "instructions": values.instructions, "transcript": transcript, "rubricItems": rubricItems, "participants": selectedParticipants, "isFullTranscript": values.isFullTranscript, "index": values.index };
        }

        try {
            await createEvalution(evaluation).unwrap();
            navigate('/home');
        } catch (err) {
            console.error("CreateNewEvaluation: Error creating evaluation", err);
            setFormErrorSubmission(err);
        }


    };



    return (
        <div className="container-fluid">
            <h3 className="text-center mb-4">Create an LLM Response Evaluation</h3>

            <Form
                onSubmit={handleFormSubmit}
                initialValues={{ isFullTranscript: false, firstActor: "human" }}
                validate={validate}
                onKeyDown={e => {
                    if (e.key === "Enter") {
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
                                    <Field name="isFullTranscript">
                                        {({ input, meta }) => (
                                            <>
                                                <div className="form-check">
                                                    <input
                                                        {...input}
                                                        type="radio"
                                                        className="form-check-input"
                                                        id="fullTranscript"
                                                        value={true}
                                                        checked={input.value === true || input.value === "true"}
                                                        onChange={() => input.onChange(true)}
                                                    />
                                                    <label className="form-check-label" htmlFor="fullTranscript">
                                                        Full Transcript
                                                    </label>
                                                </div>
                                                <div className="form-check">
                                                    <input
                                                        {...input}
                                                        type="radio"
                                                        className="form-check-input"
                                                        id="sectionsTranscript"
                                                        value={false}
                                                        checked={input.value === false || input.value === "false" || input.value === undefined}
                                                        onChange={() => input.onChange(false)}
                                                    />
                                                    <label className="form-check-label" htmlFor="sectionsTranscript">
                                                        Sections of a Transcript
                                                    </label>
                                                </div>
                                                {meta.error && meta.touched && (
                                                    <span className="text-danger">{meta.error}</span>
                                                )}
                                                {/** Add 'which actor is first' radio here */}
                                                {(input.value === true || input.value === "true") && (
                                                    <div className="mt-3">
                                                        <label className="form-label fw-bold">Which actor sends the first message?</label>
                                                        <Field name="firstActor">
                                                            {({ input: actorInput }) => (
                                                                <div>
                                                                    <div className="form-check">
                                                                        <input
                                                                            {...actorInput}
                                                                            type="radio"
                                                                            className="form-check-input"
                                                                            id="firstActorHuman"
                                                                            value="human"
                                                                            checked={actorInput.value === "human"}
                                                                            onChange={() => actorInput.onChange("human")}
                                                                        />
                                                                        <label className="form-check-label" htmlFor="firstActorHuman">
                                                                            Human
                                                                        </label>
                                                                    </div>
                                                                    <div className="form-check">
                                                                        <input
                                                                            {...actorInput}
                                                                            type="radio"
                                                                            className="form-check-input"
                                                                            id="firstActorLLM"
                                                                            value="llm"
                                                                            checked={actorInput.value === "llm"}
                                                                            onChange={() => actorInput.onChange("llm")}
                                                                        />
                                                                        <label className="form-check-label" htmlFor="firstActorLLM">
                                                                            LLM
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Field>
                                                    </div>
                                                )}
                                                {/* Conditional rendering based on switch */}
                                                {input.value === true || input.value === "true" ? (
                                                    <div className="mt-3 container-fluid border border-solid rounded">
                                                        <div className="row text-center w-100">
                                                            <label>LLM Transcript</label>
                                                        </div>
                                                        {/** Full Transcript Buttons */}
                                                        <div className="row ">
                                                            <div className="col-6 text-center">
                                                                <button
                                                                    className="btn btn-info mx-2 my-2 w-35"
                                                                    onClick={e => handleAddHumanMessage(e, setHumanMessages, humanMessageIdRef)}
                                                                >
                                                                    <GoPlus /> Add Human Message
                                                                </button>
                                                            </div>
                                                            <div className="col-6 text-center">
                                                                <button
                                                                    className="btn btn-warning mx-2 my-2 w-35"
                                                                    onClick={e => handleAddLLMMessage(e, setLLMMessages, llmMessageIdRef)}
                                                                >
                                                                    <GoPlus /> Add LLM Message
                                                                </button>
                                                            </div>

                                                        </div>
                                                        {/** Full Transcript TextAreas */}
                                                        <div className="row">
                                                            <div className="col-6 border border-solid">
                                                                {humanMessages.map((message) => (
                                                                    <div key={message.chatId} className="d-flex align-items-center gap-2 mb-2">
                                                                        <div className="flex-grow-1">
                                                                            <label>Human Message {message.chatId}</label>
                                                                            <Field name={`human_message_${message.chatId}`}>
                                                                                {({ input }) => (
                                                                                    <textarea
                                                                                        {...input}
                                                                                        className="form-control"
                                                                                        rows={3}
                                                                                    />
                                                                                )}
                                                                            </Field>
                                                                        </div>
                                                                        <button
                                                                            className="btn btn-danger btn-sm mt-1"
                                                                            type="button"
                                                                            onClick={() => handleRemoveHumanMessage(message.chatId, setHumanMessages, humanMessages, humanMessageIdRef)}
                                                                            aria-label="Remove human message"
                                                                        >
                                                                            <GoTrash />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div className="col-6 border border-solid">
                                                                {llmMessages.map((message) => (
                                                                    <div key={message.chatId} className="d-flex align-items-center gap-2 mb-2">
                                                                        <div className="flex-grow-1">
                                                                            <label>LLM Message {message.chatId}</label>
                                                                            <Field name={`llm_message_${message.chatId}`}>
                                                                                {({ input }) => (
                                                                                    <textarea
                                                                                        {...input}
                                                                                        className="form-control"
                                                                                        rows={3}
                                                                                    />
                                                                                )}
                                                                            </Field>
                                                                        </div>
                                                                        <button
                                                                            className="btn btn-danger btn-sm mt-1"
                                                                            type="button"
                                                                            onClick={() => handleRemoveLLMMessage(message.chatId, setLLMMessages, llmMessages, llmMessageIdRef)}
                                                                            aria-label="Remove LLM message"
                                                                        >
                                                                            <GoTrash />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="card bg-body-secondary mt-3">
                                                        <label>Sections of a Transcript</label>

                                                        {/* Sections */}
                                                        {sections.map((section, idx) => (
                                                            <div key={section.sectionId} className="my-2 pb-2">
                                                                <div className="card d-flex align-items-start gap-2">
                                                                    <div className="mt-3 container-fluid">
                                                                        <div className="row text-center w-100">
                                                                            <label className="fw-bold">Section {idx + 1} LLM Transcript</label>
                                                                        </div>
                                                                        {/** Sections Buttons */}
                                                                        <div className="row ">
                                                                            <div className="col-6 text-center">
                                                                                <button
                                                                                    className="btn btn-info mx-2 my-2 w-35"
                                                                                    onClick={e => handleAddSectionHumanMessage(
                                                                                        e,
                                                                                        section.sectionId,
                                                                                        setSectionHumanMessages,
                                                                                        sectionHumanMessageIdRef,
                                                                                        setSectionHumanMessageIdRef
                                                                                    )}

                                                                                >
                                                                                    <GoPlus /> Add Human Message
                                                                                </button>
                                                                            </div>
                                                                            <div className="col-6 text-center">
                                                                                <button
                                                                                    className="btn btn-warning mx-2 my-2 w-35"
                                                                                    onClick={e => handleAddSectionLLMMessage(
                                                                                        e,
                                                                                        section.sectionId,
                                                                                        setSectionLLMMessages,
                                                                                        sectionLLMMessageIdRef,
                                                                                        setSectionLLMMessageIdRef
                                                                                    )}

                                                                                >
                                                                                    <GoPlus /> Add LLM Message
                                                                                </button>
                                                                            </div>

                                                                        </div>
                                                                        {/** Sections Transcript TextAreas */}
                                                                        <div className="row">
                                                                            <div className="col-6">
                                                                                {(sectionHumanMessages[section.sectionId] || []).map((message, idx) => (
                                                                                    <div key={message.chatId} className="d-flex align-items-center gap-2 mb-2">
                                                                                        <div className="flex-grow-1">
                                                                                            <label>Human Message {idx}</label>
                                                                                            <Field name={`section_${section.sectionId}_human_message_${message.chatId}`}>
                                                                                                {({ input }) => (
                                                                                                    <textarea
                                                                                                        {...input}
                                                                                                        className="form-control"
                                                                                                        rows={3}
                                                                                                    />
                                                                                                )}
                                                                                            </Field>
                                                                                        </div>
                                                                                        <button
                                                                                            className="btn btn-danger btn-sm mt-1"
                                                                                            type="button"
                                                                                            onClick={() => handleRemoveSectionHumanMessage(section.sectionId, message.chatId, setSectionHumanMessages)}
                                                                                            aria-label="Remove human message"
                                                                                        >
                                                                                            <GoTrash />
                                                                                        </button>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                            <div className="col-6 ">
                                                                                {(sectionLLMMessages[section.sectionId] || []).map((message, idx) => (
                                                                                    <div key={message.chatId} className="d-flex align-items-center gap-2 mb-2">
                                                                                        <div className="flex-grow-1">
                                                                                            <label>LLM Message {idx}</label>
                                                                                            <Field name={`section_${section.sectionId}_llm_message_${message.chatId}`}>
                                                                                                {({ input }) => (
                                                                                                    <textarea
                                                                                                        {...input}
                                                                                                        className="form-control"
                                                                                                        rows={3}
                                                                                                    />
                                                                                                )}
                                                                                            </Field>
                                                                                        </div>
                                                                                        <button
                                                                                            className="btn btn-danger btn-sm mt-1"
                                                                                            type="button"
                                                                                            onClick={() => handleRemoveSectionLLMMessage(section.sectionId, message.chatId, setSectionLLMMessages)}
                                                                                            aria-label="Remove LLM message"
                                                                                        >
                                                                                            <GoTrash />
                                                                                        </button>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    </div>


                                                                    <button
                                                                        className="btn btn-danger btn-sm ms-3 mt-1 mb-3"
                                                                        type="button"
                                                                        onClick={() => handleRemoveSection(idx, setSections)}
                                                                        aria-label="Remove section"
                                                                    >
                                                                        Delete Section <GoTrash />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <div>

                                                            <button
                                                                className="btn btn-info mx-2 my-2"
                                                                onClick={e => handleAddSection(e, setSections)}
                                                                type="button"
                                                            >
                                                                Add New Section
                                                            </button>
                                                        </div>
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
                                                    onClick={() => handleRemoveRubricItem(idx, setRubricItems)}
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
                                                    onChange={e => handleRubricItemChange(idx, "title", e.target.value, setRubricItems, setFormErrorRubric)}
                                                />
                                                <input
                                                    type="text"
                                                    className="form-control mb-2"
                                                    placeholder="Caption"
                                                    value={item.caption}
                                                    onChange={e => handleRubricItemChange(idx, "caption", e.target.value, setRubricItems, setFormErrorRubric)}
                                                />
                                                <select
                                                    className="form-select mb-2"
                                                    value={item.objectType}
                                                    onChange={e => handleRubricItemChange(idx, "objectType", e.target.value, setRubricItems, setFormErrorRubric)}
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
                                                                        handleLabelChange(idx, item.objectType + "Labels", labelIdx, e.target.value, setRubricItems)
                                                                    }
                                                                    placeholder={`Label ${labelIdx + 1}`}
                                                                />
                                                                <button
                                                                    className="btn btn-danger btn-sm ms-2"
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleRemoveLabel(idx, item.objectType + "Labels", labelIdx, setRubricItems)
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
                                                            onClick={() => handleAddLabel(idx, item.objectType + "Labels", setRubricItems)}
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
                                                    onChange={e => handleRubricItemChange(idx, "reason", e.target.value, setRubricItems, setFormErrorRubric)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        className="btn btn-info btn-sm ms-2"
                                        onClick={e => handleAddRubricItem(e, setRubricItems)}
                                        type="button"
                                    >
                                        Add Rubric Item
                                    </button>
                                    <button
                                        className="btn btn-info btn-sm ms-2"
                                        onClick={e => handleAddExistingRubricItems(e, setRubricItems)}
                                        type="button"
                                    >
                                        Add Foster Study LLM RE Rubric Items
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
                        {/** Index ID */}
                        <div className="row my-3">
                            <div className="card bg-body-tertiary border border-tertiary p-2 rounded">
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Evaluation Index ID</label>
                                    <Field
                                        name="index"
                                        component="input"
                                        className="form-control"
                                        placeholder="Enter ID for evaluation"
                                        required
                                    />
                                    <Field name="instructions">
                                        {({ meta }) => meta.error && meta.touched && <span className="text-danger">{meta.error}</span>}
                                    </Field>
                                </div>
                            </div>
                        </div>
                        {/**Assign Participants */}
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
                        {formErrorSubmission ? (
                            <div>{formErrorSubmission}</div>

                        ) : <div></div>}
                    </form>
                )}

            />

        </div>
    )
};

export default LLMRECreate;