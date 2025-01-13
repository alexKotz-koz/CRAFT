import { GoArrowUp, GoArrowDown, GoCommentDiscussion } from "react-icons/go";
import { useCreateVoteMutation } from "../../store";

const InitialResponse = ({ username, dateCreated, response, studyId, promptId, responseId, currentUser, upvotes, downvotes, voters }) => {
    const [createVote, { error: errorVote, isLoading: isLoadingVote }] = useCreateVoteMutation();

    // Check if the current user has already voted
    const hasVoted = voters.includes(currentUser._id);

    if (isLoadingVote) {
        return <div>Loading...</div>;
    }

    if (errorVote) {
        return <div>Error: {errorVote?.data}</div>;
    }

    const upVote = () => {
        createVote({ studyId, promptId, responseId, voteType: 'upvote' });
    };

    const downVote = () => {
        createVote({ studyId, promptId, responseId, voteType: 'downvote' });
    };

    const toggleComments = () => {
        // Implement comment toggling logic here
    };

    return (
        <div className="card mb-3">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                    <h5 className="card-title mb-0">{username.username}</h5>
                    <small className="text-muted">{new Date(dateCreated).toLocaleDateString()}</small>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-2">
                    <p className="card-text mb-0">{response}</p>
                    <div className="d-flex align-items-center">
                        {currentUser.username !== username.username && (
                            <>
                                <div className="d-flex align-items-center mx-2">
                                    <span>{upvotes}</span>
                                    <GoArrowUp onClick={upVote} disabled={hasVoted} />
                                </div>
                                <div className="d-flex align-items-center mx-2">
                                    <span>{downvotes}</span>
                                    <GoArrowDown onClick={downVote} disabled={hasVoted} />
                                </div>
                            </>
                        )}
                        <GoCommentDiscussion className="mx-2" onClick={toggleComments} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InitialResponse;