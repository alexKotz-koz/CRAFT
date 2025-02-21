import { useFetchDiscussionQuery, useFetchTaskQuery, useFetchTaskNotificationsQuery, useFetchUserQuery } from "../../store";
import { useParams } from "react-router-dom";
import Prompt from "./Prompt";

const DiscussionBoard = () => {
    const { taskId } = useParams();
    const { data: discussion, error: errorDiscussion, isLoading: isLoadingDiscussion } = useFetchDiscussionQuery(taskId);
    const { data: task, error: errorTask, isLoading: isLoadingTask } = useFetchTaskQuery(taskId);
    const { data: user, error: errorUser, isLoading: isLoadingUser } = useFetchUserQuery();
    const { data: notifications, error: errorNotifications, isLoading: isLoadingNotifications} = useFetchTaskNotificationsQuery({taskId});
  
    if (isLoadingDiscussion || isLoadingTask || isLoadingUser || isLoadingNotifications) {
        return <div>Loading...</div>;
    }

    if (errorDiscussion || errorTask || errorUser || errorNotifications) {
        return <div>Error: {errorDiscussion?.data.error || errorTask?.data.error || errorUser?.data.error || errorNotifications?.data.error}</div>;
    }

    const studyId = discussion.study;

    const prompts = discussion.prompts.length > 0 ? discussion.prompts : [];
    const responses = discussion.initialResponses.length > 0 ? discussion.initialResponses : [];
    
    if (responses <= 0 ){
        return <div className="p-3 text-danger-emphasis bg-danger-subtle border border-danger-subtle rounded-3 d-flex justify-content-center align-items-center w-50 mx-auto">No responses have been added to this discussion. Please check back later. </div>
    } else {
            return (
        <div className="container">
            <h3 className="mt-4 mb-5 text-center">Discussion Board - {task.name ? task.name : discussion.study.name}</h3>
            {prompts.map((prompt, index) => (
                <Prompt key={index} prompt={prompt} responses={responses} notifications={notifications} promptIndex={index} studyId={studyId} currentUser={user} taskId={taskId}  />                
            ))}
        </div>
    );
    }


};

export default DiscussionBoard;