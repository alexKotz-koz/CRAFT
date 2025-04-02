import { useState } from "react";
import { GoChevronDown, GoChevronLeft } from 'react-icons/go';
import InitialResponse from "./InitialResponse";
import parse, { domToReact } from 'html-react-parser';

function Prompt({ prompts, prompt, responses, notifications, promptIndex, studyId, currentUser, taskId }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [showFullPrompt, setShowFullPrompt] = useState(false); // State to toggle full prompt visibility

    if (responses.length <= 0) {
        return <div>Error fetching responses for this discussion. Please contact administrative services for further assistance.</div>
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(prompt.question, 'text/html');
    
    const isParent = (prompt) => !prompt.id.includes('-childPrompt-');
    
    // Function to get the parent question
    const getParentQuestion = (prompt, prompts) => {
        if (isParent(prompt)) {
            return prompt.prompt; // If it's a parent, return its own question
        }
    
        // Extract the parent ID from the child prompt's ID
        const parentId = prompt.id.split('-childPrompt-')[0];
    
        // Find the parent prompt in the prompts array
        const parentPrompt = prompts.find((p) => p._id === parentId);
    
        return parentPrompt ? parentPrompt.prompt : 'Parent question not found'; // Return the parent's question or a fallback
    };
    
    // Function to extract the first line of the HTML content
    const extractFirstLine = (htmlString) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        return doc.body.firstChild ? doc.body.firstChild.textContent.trim() : '';
    };
    
    // Get the title for the current prompt
    let questionTitle;
    let fullPrompt;
    if (!isParent(prompt)) {
        const parentQuestion = getParentQuestion(prompt, prompts);
        const parentFirstLine = extractFirstLine(parentQuestion);
        const childFirstLine = extractFirstLine(prompt.question);
        questionTitle = `${parentFirstLine} - ${childFirstLine}`; // Combine parent and child questions
        fullPrompt = (() => {
            if (!isParent(prompt)) {
                const parentQuestion = getParentQuestion(prompt, prompts) || ''; // Fallback to an empty string
                return `${parentQuestion}<br/>${prompt.prompt || ''}`; // Combine parent and child prompts
            }
            return prompt.prompt || '';
        })();
    } else {
        questionTitle = doc.body.firstChild ? doc.body.firstChild.textContent : ''
        fullPrompt = prompt.question
    }
    
    // Combine parent and child prompts for "Show Full Prompt"



    const handleClick = () => {
        setIsExpanded(!isExpanded);
    };

    const toggleFullPrompt = () => {
        setShowFullPrompt(!showFullPrompt); // Toggle the visibility of the full prompt
    };

    // Parse the HTML content of the prompt
    const parseOptions = {
        replace: ({ name, children }) => {
            switch (name) {
                case 'h1':
                    return <h1>{domToReact(children)}</h1>;
                case 'h2':
                    return <h2>{domToReact(children)}</h2>;
                case 'p':
                    return <p>{domToReact(children)}</p>;
                case 'b':
                    return <b>{domToReact(children)}</b>;
                case 'i':
                    return <i>{domToReact(children)}</i>;
                case 'u':
                    return <u>{domToReact(children)}</u>;
                case 'strike':
                    return <strike>{domToReact(children)}</strike>;
                case 'blockquote':
                    return <blockquote>{domToReact(children)}</blockquote>;
                case 'ol':
                    return <ol>{domToReact(children)}</ol>;
                case 'ul':
                    return <ul>{domToReact(children)}</ul>;
                case 'li':
                    return <li>{domToReact(children)}</li>;
                case 'a':
                    return <a href={children[0]?.attribs?.href}>{domToReact(children)}</a>;
                case 'img':
                    return <img src={children[0]?.attribs?.src} alt="" />;
                case 'div':
                    return <div>{domToReact(children)}</div>;
                default:
                    return null;
            }
        }
    };

    const parsedPrompt = parse(fullPrompt, parseOptions);
    
    const filteredResponses = responses.flatMap(responseObj => {
        return responseObj.responses
            .filter(response => {
                return response.prompt === prompt.id;
            })
            .map(response => ({
                ...response,
                _participant: responseObj._participant,
                _dateCreated: responseObj._dateCreated
            }));
    });

    return (
        filteredResponses.length > 0 && (
        <div className="card bg-body-tertiary border border-tertiary p-2 rounded">
            <div className="card-body" onClick={handleClick}>
                <div className="d-flex align-items-center">
                    {/* Card Title */}
                    <h5 className="card-header fw-bolder" style={{ background: 'none' }}>
                        {questionTitle} {/* Display truncated prompt as the title */}
                    </h5>
                    <div className="ms-auto">
                        {isExpanded ? (
                            <GoChevronDown style={{ fontSize: '24px', cursor: 'pointer' }} />
                        ) : (
                            <GoChevronLeft style={{ fontSize: '24px', cursor: 'pointer' }} />
                        )}
                    </div>
                </div>
            </div>
            {isExpanded && (
                <div className="card-body">
                    {/* Full Prompt Section */}
                    <div className="mb-3">
                        <div style={{ whiteSpace: 'pre-wrap' }}>
                            {showFullPrompt ? parsedPrompt :''}
                        </div>
                        <button
                            className="btn btn-link p-0"
                            onClick={toggleFullPrompt}
                            style={{ textDecoration: 'none' }}
                        >
                            {showFullPrompt ? "Show Less" : "Show Full Prompt"}
                        </button>
                    </div>

                    {/* Responses Section */}
                    {filteredResponses.map((response, index) => {
                        const { username, avatar } = response._participant;
                        const dateCreated = response._dateCreated;
                        return (
                            <InitialResponse
                                key={index}
                                username={username}
                                avatar={avatar}
                                dateCreated={dateCreated}
                                response={response.response}
                                notifications={notifications}
                                studyId={studyId._id}
                                promptId={response.prompt}
                                responseId={response._id}
                                currentUser={currentUser}
                                votes={response.votes}
                                comments={response.comments}
                                taskId={taskId}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    ));
}

export default Prompt;