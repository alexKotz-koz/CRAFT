import React from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { useCreateStudyResponseMutation, useFetchTaskQuery, useFetchStudyQuery } from "../../../store";
import { Form, Field } from "react-final-form";
import parse, { domToReact } from 'html-react-parser';
import { useEffect } from 'react';
import ReactGA from 'react-ga4';


const StudyResponse = ({ user }) => {

    useEffect(() => {
        ReactGA.send({
            hitType: "pageview",
            page: "/study/response/task/:taskId",
            title: "Study Response - CRAFT",
        });
    }, []);

    const navigate = useNavigate();
    const { taskId } = useParams();
    const { data: task, error: errorTask, isLoading: isLoadingTask } = useFetchTaskQuery(taskId);
    const [createResponse, { error: responseError, isLoading: responseIsLoading }] = useCreateStudyResponseMutation();
    const { refetch: refetchStudy } = useFetchStudyQuery(task?.study, {
        skip: !task?.study,
    });

    if (isLoadingTask || responseIsLoading) {
        return <div>Loading...</div>;
    }
    if (errorTask || responseError) {
        return <div>Error: {responseError?.data.error || errorTask?.data.error}</div>;
    }
    const handleFormSubmit = async (values) => {
        const responses = Object.keys(values).map((key) => ({
            prompt: key,
            response: values[key],
        }));
        const response = {
            studyId: task.study,
            taskId: taskId,
            responses,
            taskType: task.taskType,
            participant: user._id,
            dateCreated: Date.now(),
        };
        try {
            await createResponse(response).unwrap();
            await refetchStudy();
            navigate(`/study/response/${task.study}`);
        } catch (err) {
            console.error("Failed to create response: ", err);
        }
    };

    const validate = (values) => {
        const errors = {};
        task.prompts.forEach((prompt) => {
            if (prompt.childPrompts && prompt.childPrompts.length > 0) {
                prompt.childPrompts.forEach((childPrompt, index) => {
                    const childPromptId = `${prompt._id}-childPrompt-${index}`;
                    if (!values[childPromptId]) {
                        errors[childPromptId] = 'This field is required';
                    }
                });
            } else {
                if (!values[prompt._id]) {
                    errors[prompt._id] = 'This field is required';
                }
            }
        });
        return errors;
    };

    const renderPromptWithChildren = (prompt, childPrompts) => {
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
                        return <a href={children[0].attribs.href}>{domToReact(children)}</a>;
                    case 'img':
                        return <img src={children[0].attribs.src} alt="" />;
                    case 'div':
                        return <div>{domToReact(children)}</div>;
                    default:
                        return null;
                }
            }
        };

        const parsedMainPrompt = parse(prompt.prompt, parseOptions);
        const parsedChildPrompts = childPrompts.map((childPrompt, index) => {
            const childPromptId = `${prompt._id}-childPrompt-${index}`;
            return (
                <div key={childPromptId} className='mb-3 ms-5'>
                    {parse(childPrompt.prompt, parseOptions)}
                    <Field
                        name={childPromptId}
                        component="textarea"
                        className="form-control"
                        placeholder="Your response"
                    />
                    <Field
                        name={childPromptId}
                        subscription={{ touched: true, error: true }}
                        render={({ meta: { touched, error } }) =>
                            touched && error ? <span className="text-danger">{error}</span> : null
                        }
                    />
                </div>
            );
        });

        return (
            <div>

                <label className="form-label">{parsedMainPrompt}</label>
                {parsedChildPrompts.length > 0 ? (
                    <div className="mb-3">
                        {parsedChildPrompts}
                    </div>
                ) : (
                    <div className="mb-3">
                        <Field
                            name={prompt._id}
                            component="textarea"
                            className="form-control"
                            placeholder="Your response"
                        />
                        <Field
                            name={prompt._id}
                            subscription={{ touched: true, error: true }}
                            render={({ meta: { touched, error } }) =>
                                touched && error ? <span className="text-danger">{error}</span> : null
                            }
                        />
                    </div>
                )}
            </div>
        );
    };

    const renderPrompt = (prompt) => {
        if (typeof prompt.prompt !== 'string') {
            return null;
        }
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
                        return <a href={children[0].attribs.href}>{domToReact(children)}</a>;
                    case 'img':
                        return <img src={children[0].attribs.src} alt="" />;
                    case 'div':
                        return <div>{domToReact(children)}</div>;
                    default:
                        return null;
                }
            }
        };

        const parsedContent = parse(prompt.prompt, parseOptions);
        return (
            <div>
                <label className="form-label">{parsedContent}</label>
                <div className="mb-3">
                    <Field
                        name={prompt._id}
                        component="textarea"
                        className="form-control"
                        placeholder="Your response"
                    />
                    <Field
                        name={prompt._id}
                        subscription={{ touched: true, error: true }}
                        render={({ meta: { touched, error } }) =>
                            touched && error ? <span className="text-danger">{error}</span> : null
                        }
                    />
                </div>
            </div>
        );
    };

    return (
        <div className='container mb-3'>
            <h3>{task.name}</h3>

            {task.instructions && task.instructions !== "" && task.instructions !== "TBD" && (
                <div className="p-4 mb-3 bg-light rounded">
                    <p style={{ whiteSpace: 'pre-wrap' }}>{task.instructions}</p>
                </div>
            )}


            <Form
                onSubmit={handleFormSubmit}
                validate={validate}
                render={({ handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                        {task.prompts.map((prompt) => (
                            <div key={prompt._id}>
                                {prompt.childPrompts && prompt.childPrompts.length > 0
                                    ? renderPromptWithChildren(prompt, prompt.childPrompts)
                                    : renderPrompt(prompt)}
                            </div>
                        ))}
                        <button type="submit" className="btn btn-primary">Submit</button>
                    </form>
                )}
            />
        </div>
    );
};

export default StudyResponse;