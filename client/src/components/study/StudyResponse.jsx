import { useParams } from "react-router-dom";
import { useCreateStudyResponseMutation, useFetchStudyQuery } from "../../store";
import { Form, Field } from "react-final-form";


const StudyResponse = ({ user }) => {
    const { studyId } = useParams();
    const { data: study, error: studyError, isLoading: studyIsLoading } = useFetchStudyQuery(studyId);
    const [createResponse, { error: responseError, isLoading: responseIsLoading }] = useCreateStudyResponseMutation();

    if (studyIsLoading || responseIsLoading) {
        return <div>Loading...</div>;
    }
    if (responseError || studyError) {
        return <div>Error: {responseError?.data.message || studyError?.data.message}</div>;
    }

    const handleFormSubmit = (values) => {
        const responses = Object.keys(values).map((key) => ({
            prompt: key,
            response: values[key],
        }));
    
        const response = {
            studyId,
            responses,
            participant: user._id,
            dateCreated: Date.now(),
        };
        createResponse(response);
    };

    return (
        <div>
            <h3>{study.name}</h3>
            <Form
                onSubmit={handleFormSubmit}
                render={({ handleSubmit }) => (
                    <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                        <div className="row mb-3">
                            <label className="col-form-label">Instructions: </label>
                            <div className="">{study.instructions}</div>
                        </div>

                        {
                            study.prompts.map((prompt, index) => (
                                <div key={index}>
                                    <label className="form-label">{prompt}</label>
                                    <div>
                                        <Field
                                            name={prompt}
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