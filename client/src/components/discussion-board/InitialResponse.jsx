import { useState, useEffect } from "react";
import { GoArrowUp, GoArrowDown, GoCommentDiscussion, GoPlus } from "react-icons/go";
import { useCreateVoteMutation, useCreateCommentMutation } from "../../store";
import Comment from "./Comment";

const InitialResponse = ({ username, dateCreated, response, studyId, promptId, responseId, currentUser, upvotes, downvotes, voters, comments }) => {
    const [createVote, { error: errorVote, isLoading: isLoadingVote }] = useCreateVoteMutation();
    const [createComment, { error: errorComment, isLoading: isLoadingComment }] = useCreateCommentMutation();
    const [commentContent, setCommentContent] = useState("");
    const [showComments, setShowComments] = useState(false);
    const [showNewComment, setShowNewComment] = useState(false);
    const isParticipant = currentUser.role !== 'facilitator' && currentUser.role !== 'admin';

    const hasVoted = voters.includes(currentUser._id);

    if (isLoadingVote || isLoadingComment) {
        return <div>Loading...</div>;
    }

    if (errorVote || errorComment) {
        return <div>Error: {errorVote?.data || errorComment?.data}</div>;
    }



    const upVote = () => {
        if (!hasVoted && isParticipant) {
            createVote({ studyId, promptId, responseId, voteType: 'upvote' });
        }
    };

    const downVote = () => {
        if (!hasVoted && isParticipant) {
            createVote({ studyId, promptId, responseId, voteType: 'downvote' });
        }
    };

    const toggleComments = () => {
        setShowComments(!showComments);
    };

    const toggleNewComment = () => {
        if (isParticipant) {
            setShowNewComment(!showNewComment);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (commentContent.trim() && isParticipant) {
            await createComment({ promptId, responseId, content: commentContent, studyId });
            setCommentContent("");
            setShowNewComment(false);
        }
    };

    const disabledStyle = {
        pointerEvents: 'none',
        opacity: 0.5,
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
                                    <GoArrowUp onClick={upVote} style={hasVoted || !isParticipant ? disabledStyle : {cursor: 'pointer'}} />
                                </div>
                                <div className="d-flex align-items-center mx-2">
                                    <span>{downvotes}</span>
                                    <GoArrowDown onClick={downVote} style={hasVoted || !isParticipant ? disabledStyle : {cursor: 'pointer'}} />
                                </div>
                            </>
                        )}
                        <span>{comments.length}</span>
                        <GoCommentDiscussion className="mx-2" onClick={toggleComments} style={{ cursor: 'pointer' }} />
                    </div>
                </div>
                {showComments && (
                    <div className="mt-3">
                        {comments.map((comment, idx) => (
                            <Comment key={idx} comment={comment} currentUser={currentUser} studyId={studyId} />
                        ))}
                        {showNewComment && (
                            <form onSubmit={handleCommentSubmit} className="mt-3">
                                <div className="mb-3">
                                    <textarea
                                        className="form-control"
                                        value={commentContent}
                                        onChange={(e) => setCommentContent(e.target.value)}
                                        placeholder="Add a comment"
                                        rows="3"
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary">Submit</button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowNewComment(!showNewComment)}>
                                    Cancel
                                </button>
                            </form>
                        )}
                        {!showNewComment && isParticipant &&
                            <div className="end-0 m-1 btn btn-warning" style={{ cursor: 'pointer' }} onClick={toggleNewComment}>
                                <GoPlus />
                                <span className="ms-1">Add a new comment</span>
                            </div>
                        }
                    </div>
                )}
            </div>
        </div>
    );
};

export default InitialResponse;