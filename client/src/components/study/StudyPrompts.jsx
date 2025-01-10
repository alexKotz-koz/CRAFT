import { useState, useEffect } from "react";
import { Form } from "react-final-form";
import { GoPlus, GoTrash } from "react-icons/go";

//TODO:
// - Add property to the prompt (type), where faciliatators can select different types of prompts


const StudyPrompts = ({ onSubmit, onCancel, initialValues }) => {
    const [prompt, setPrompt] = useState("");
    const [promptList, setpromptList] = useState([]);
    const [invalidPromptList, setInvalidPromptList] = useState(false);
    useEffect(() => {
        setpromptList(initialValues || []);
    }, [initialValues]);

    const handleInputChange = (e) => {
        setPrompt(e.target.value);
    };

    const handleAddPrompt = () => {
        if (prompt && !promptList.includes(prompt)) {
            setpromptList([...promptList, prompt]);
            setPrompt("");
        }
    };

    const handleRemovePrompt = (promptToRemove) => {
        setpromptList(promptList.filter(prompt => prompt !== promptToRemove));
    };

    const handleFormSubmit = (values) => {
        if (promptList.length === 0) {
            setInvalidPromptList(true);
            return;
        }
        onSubmit({ ...values, promptList });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleAddPrompt();
        }
      };

    return (
        <div>
            <h3>Add Prompts</h3>
            <Form
                onSubmit={handleFormSubmit}
                render={({ handleSubmit }) => (
                    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="needs-validation" noValidate>
                        <div className="mb-3">
                            <label className="form-label">Prompt</label>
                            <input
                                type="text"
                                value={prompt}
                                onChange={handleInputChange}
                                className="form-control"
                                required
                            />
                            {invalidPromptList && (
                                <div className="form-text text-danger">
                                    You must provide at least one prompt
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={handleAddPrompt}
                            className="btn btn-info"
                        >
                            <GoPlus /> Add
                        </button>
                        <div className="mt-3">
                            <ul className="list-group">
                                {promptList.map((prompt, index) => (
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
                            <button type="submit" className="btn btn-primary">
                                Next
                            </button>
                        </div>

                    </form>
                )}
            />

        </div>
    );
};

export default StudyPrompts;