import { useFetchDiscussionQuery, useFetchUserQuery } from "../../store";
import { useParams } from "react-router-dom";
import Prompt from "./Prompt";

const DiscussionBoard = () => {
    const { studyId } = useParams();
    const { data: discussion, error: errorDiscussion, isLoading: isLoadingDiscussion } = useFetchDiscussionQuery(studyId);
    const { data: user, error: errorUser, isLoading: isLoadingUser } = useFetchUserQuery();

    if (isLoadingDiscussion || isLoadingUser) {
        return <div>Loading...</div>;
    }

    if (errorDiscussion || errorUser) {
        return <div>Error: {errorDiscussion?.data.error || errorUser?.data.error}</div>;
    }

    const prompts = discussion.prompts.length > 0 ? discussion.prompts.map(prompt => prompt.prompt) : [];
    const responses = discussion.initialResponses.length > 0 ? discussion.initialResponses : [];

    console.log("responses", discussion)
    return (
        <div className="container">
            <h3>Discussion Board</h3>
            {prompts.map((prompt, index) => (
                <Prompt key={index} prompt={prompt} responses={responses} promptIndex={index} studyId={studyId} currentUser={user} />                
            ))}
        </div>
    );
};

export default DiscussionBoard;