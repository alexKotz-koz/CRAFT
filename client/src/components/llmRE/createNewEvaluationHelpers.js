import DOMPurify from 'dompurify';

export const validate = (values) => {
    if (values.title === "" || values.title === undefined) {
        return { title: "Title is required" }
    }
    const cleanedValues = Object.keys(values).reduce((acc, key) => {
        acc[key] = DOMPurify.sanitize(values[key]);
        return acc;
    }, {});
};

/** Sections */
export const handleAddSection = (e, setSections) => {
    e.preventDefault();
    setSections(prev => [
        ...prev,
        { sectionId: Date.now(), llmOutput: "" }
    ]);
};
export const handleRemoveSection = (index, setSections) => {
    setSections(prev => prev.filter((_, i) => i !== index));
};
export const handleSectionChange = (index, value, setSections, setFormErrorLLMOutput) => {
    setSections(prev => prev.map((section, i) =>
        i === index ? { ...section, llmOutput: value } : section
    ));
    setFormErrorLLMOutput();
};



/** Rubric Items */
export const handleAddRubricItem = (e, setRubricItems) => {
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
export const handleRemoveRubricItem = (idx, setRubricItems) => {
    setRubricItems(prev => prev.filter((_, i) => i !== idx));
};
export const handleRubricItemChange = (idx, field, value, setRubricItems, setFormErrorRubric) => {
    setRubricItems(prev =>
        prev.map((item, i) =>
            i === idx ? { ...item, [field]: value } : item
        )
    );
    setFormErrorRubric();
};


/** Rubric Items - Labels */
export const handleAddLabel = (idx, type, setRubricItems) => {
    setRubricItems(prev =>
        prev.map((item, i) =>
            i === idx
                ? { ...item, [type]: [...item[type], ""] }
                : item
        )
    );
};
export const handleRemoveLabel = (idx, type, labelIdx, setRubricItems) => {
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
export const handleLabelChange = (idx, type, labelIdx, value, setRubricItems) => {
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

/**LLM/Human Messages */
export const handleAddHumanMessage = (e, setHumanMessages, humanMessageIdRef) => {
    e.preventDefault();
    setHumanMessages(prev => [
        ...prev,
        { chatId: humanMessageIdRef.current++, kind: "human", content: "" }
    ]);
};

export const handleRemoveHumanMessage = (chatId, setHumanMessages, humanMessages, humanMessageIdRef) => {
    setHumanMessages(prev => {
        // Remove the message
        const filtered = prev.filter(msg => msg.chatId !== chatId);
        // Reassign chatIds sequentially
        return filtered.map((msg, idx) => ({
            ...msg,
            chatId: idx
        }));
    });
    // Reset the ref counter if you want to keep it in sync
    humanMessageIdRef.current = humanMessages.length - 1;
};

export const handleAddLLMMessage = (e, setLLMMessages, llmMessageIdRef) => {
    e.preventDefault();
    setLLMMessages(prev => [
        ...prev,
        { chatId: llmMessageIdRef.current++, kind: "llm", content: "" }
    ]);
};

export const handleRemoveLLMMessage = (chatId, setLLMMessages, llmMessages, llmMessageIdRef) => {
    setLLMMessages(prev => {
        const filtered = prev.filter(msg => msg.chatId != chatId);
        return filtered.map((msg, idx) => ({
            ...msg,
            chatId: idx
        }));
    });

    llmMessageIdRef.current = llmMessages.length - 1;
};

export const handleAddSectionHumanMessage = (e, sectionId, setSectionHumanMessages, sectionHumanMessageIdRef, setSectionHumanMessageIdRef) => {
    e.preventDefault();
    const nextId = (sectionHumanMessageIdRef[sectionId] || 0);
    setSectionHumanMessages(prev => ({
        ...prev,
        [sectionId]: [
            ...(prev[sectionId] || []),
            { chatId: nextId, kind: "human", content: "" }
        ]
    }));
    setSectionHumanMessageIdRef(prev => ({
        ...prev,
        [sectionId]: nextId + 1
    }));
};

export const handleRemoveSectionHumanMessage = (sectionId, chatId, setSectionHumanMessages) => {
    setSectionHumanMessages(prev => ({
        ...prev,
        [sectionId]: (prev[sectionId] || []).filter(msg => msg.chatId !== chatId)
    }));
};

export const handleAddSectionLLMMessage = (e, sectionId, setSectionLLMMessages, sectionLLMMessageIdRef, setSectionLLMMessageIdRef) => {
    e.preventDefault();
    const nextId = (sectionLLMMessageIdRef[sectionId] || 0);
    setSectionLLMMessages(prev => ({
        ...prev,
        [sectionId]: [
            ...(prev[sectionId] || []),
            { chatId: nextId, kind: "llm", content: "" }
        ]
    }));
    setSectionLLMMessageIdRef(prev => ({
        ...prev,
        [sectionId]: nextId + 1
    }));
};

export const handleRemoveSectionLLMMessage = (sectionId, chatId, setSectionLLMMessages) => {
    setSectionLLMMessages(prev => ({
        ...prev,
        [sectionId]: (prev[sectionId] || []).filter(msg => msg.chatId !== chatId)
    }));
};