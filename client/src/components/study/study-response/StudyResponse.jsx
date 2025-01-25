import { useNavigate, useParams } from "react-router-dom";
import { useCreateStudyResponseMutation, useFetchTaskQuery, useFetchStudyQuery } from "../../../store";
import { Form, Field } from "react-final-form";


const StudyResponse = ({ user }) => {
    const navigate = useNavigate();
    const { taskId } = useParams();
    console.log("Task ID: ", taskId)
    const { data: task, error: errorTask, isLoading: isLoadingTask } = useFetchTaskQuery(taskId);
    const [createResponse, { error: responseError, isLoading: responseIsLoading }] = useCreateStudyResponseMutation();
    const { refetch: refetchStudy } = useFetchStudyQuery(task?.study);


    console.log("task", task)

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
            participant: user._id,
            dateCreated: Date.now(),
        };
        try {
            await createResponse(response).unwrap();
            await refetchStudy();
            navigate('/home');
        } catch (err) {
            console.error("Failed to create response: ", err);
        }

    };


    return (
        <div>
            <h3>{task.name}</h3>
            <Form
                onSubmit={handleFormSubmit}
                render={({ handleSubmit }) => (
                    <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                        <div className="row mb-3">
                            <label className="col-form-label">Instructions: </label>
                            <div className="">{task.instructions}</div>
                        </div>

                        {
                            task.prompts.map((prompt, index) => (
                                <div key={index}>
                                    <label className="form-label">{prompt.prompt}</label>
                                    <div className="mb-3">
                                        <Field
                                            name={prompt._id}
                                            component="textarea"
                                            className="form-control"
                                            placeholder="Your response"
                                        />
                                    </div>
                                </div>
                            ))
                        }
                        <div>
                            <button type="submit" className="btn btn-primary">
                                Submit
                            </button>
                        </div>
                    </form>
                )}
            />
        </div>
    );
};

export default StudyResponse;