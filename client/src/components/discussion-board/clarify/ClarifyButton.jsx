import { useCreateNotificationMutation } from "../../../store";
import { GoLightBulb } from "react-icons/go";

const ClarifyButton = ({ showClarificationComment, setShowClarificationComment, hasNotification, responseId, taskId, currentUserId, username, location }) => {
  
    const [createNotification, { error: errorCreateNotification, isLoading: isLoadingCreateNotification }] = useCreateNotificationMutation();
    let postType;
    if (location === 'initialResponse'){
        postType = 'initialResponse';
    } else if(location==='comment'){
        postType = 'comment';
    }

    const handleSubmitClarification = async () => {
        try {
            await createNotification({ 
                postId: responseId, 
                postType, 
                notificationType: 'clarify', 
                fromUser: currentUserId, 
                toUser: username, 
                task: taskId 
            });
        } catch (error) {
            console.error("Error submitting clarification:", error);
        }
        setShowClarificationComment(!showClarificationComment);
    };
    
    return (
        <div>
            <button
                className={`ms-2 badge rounded-pill ${hasNotification ? 'text-bg-secondary' : 'text-bg-warning'}`}
                onClick={handleSubmitClarification}
                disabled={hasNotification}
            >
                {!hasNotification ? 'Clarify' : 'Clairification Pending'} <GoLightBulb />
            </button>
        </div>
    );
};

export default ClarifyButton;