import { useFetchDiscussionQuery, useFetchTaskQuery, useFetchUserQuery } from "../../store";
import { useParams } from "react-router-dom";
import Prompt from "./Prompt";

const DiscussionBoard = () => {
    const { taskId } = useParams();
    const { data: discussion, error: errorDiscussion, isLoading: isLoadingDiscussion } = useFetchDiscussionQuery(taskId);
    const { data: task, error: errorTask, isLoading: isLoadingTask } = useFetchTaskQuery(taskId);
    const { data: user, error: errorUser, isLoading: isLoadingUser } = useFetchUserQuery();

    if (isLoadingDiscussion || isLoadingTask || isLoadingUser) {
        return <div>Loading...</div>;
    }

    if (errorDiscussion || errorTask || errorUser) {
        return <div>Error: {errorDiscussion?.data.error || errorTask?.data.error || errorUser?.data.error}</div>;
    }

    const studyId = discussion.study;

    const prompts = discussion.prompts.length > 0 ? discussion.prompts : [];
    const responses = discussion.initialResponses.length > 0 ? discussion.initialResponses : [];
    
    if (responses <= 0 ){
        return <div>Error occured when fetching discusison responses. Please contact administrative services for further assistance. </div>
    } else {
            return (
        <div className="container">
            <h3 className="mt-4 mb-5 text-center">Discussion Board - {task.name}</h3>
            {prompts.map((prompt, index) => (
                <Prompt key={index} prompt={prompt} responses={responses} promptIndex={index} studyId={studyId} currentUser={user} task={taskId} />                
            ))}
        </div>
    );
    }


};

export default DiscussionBoard;