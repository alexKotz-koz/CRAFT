import { useFetchDiscussionQuery } from "../../store";
import { useParams } from "react-router-dom";
import Prompt from "./Prompt";

const DiscussionBoard = () => {
    const { studyId } = useParams();
    const { data: discussion, error, isLoading } = useFetchDiscussionQuery(studyId);
    console.log("discussion discussion: ", discussion);
    console.log(error);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error?.data.error}</div>;
    }

    const prompts = discussion.prompts.length > 0 ? discussion.prompts.map(prompt => prompt.prompt) : [];
    const responses = discussion.initialResponses.length > 0 ? discussion.initialResponses : [];

    console.log(responses)
    return (
        <div className="container">
            <h3>Discussion Board</h3>
            {prompts.map((prompt, index) => (
                <Prompt key={index} prompt={prompt} responses={responses} promptIndex={index} />                
            ))}
        </div>
    );
};

export default DiscussionBoard;