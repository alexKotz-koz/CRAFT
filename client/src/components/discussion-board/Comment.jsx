import { useState } from 'react';
import { GoArrowUp, GoArrowDown, GoReply } from "react-icons/go";
import { useCreateCommentVoteMutation, useCreateSubCommentMutation, useFetchSubCommentsQuery } from "../../store";

const Comment = ({ comment, currentUser }) => {
    const [createVote, { error: errorVote, isLoading: isLoadingVote }] = useCreateCommentVoteMutation();
    const [createSubcomment, { error: errorSubcomment, isLoading: isLoadingSubcomment }] = useCreateSubCommentMutation();
    const [subCommentContent, setSubCommentContent] = useState("");
    const [showReply, setShowReply] = useState(false);
    const { data: subcomments, error: errorFetchSubcomments, isLoading: isLoadingFetchSubcomments } = useFetchSubCommentsQuery({ commentId: comment._id });

    const isParticipant = currentUser.role !== 'facilitator' && currentUser.role !== 'admin';
    const hasVotedComment = comment.voters ? comment.voters.includes(currentUser._id) : false;

    if (isLoadingVote || isLoadingSubcomment || isLoadingFetchSubcomments) {
        return <div>Loading...</div>;
    }

    if (errorVote || errorSubcomment || errorFetchSubcomments) {
        return <div>Error: {errorVote?.data || errorSubcomment?.data || errorFetchSubcomments?.data}</div>;
    }


    const upVote = (commentId) => {
        if (!hasVotedComment && isParticipant) {
            createVote({ commentId, voteType: 'upvote' });
        }
    };

    const downVote = (commentId) => {
        if (!hasVotedComment && isParticipant) {
            createVote({ commentId, voteType: 'downvote' });
        }
    };

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (subCommentContent.trim() && isParticipant) {
            await createSubcomment({ commentId: comment._id, content: subCommentContent });
            setSubCommentContent("");
            setShowReply(false);
        }
    };

    const toggleReply = () => {
        setShowReply(!showReply);
    };

    const disabledStyle = {
        pointerEvents: 'none',
        opacity: 0.5,
    };

    return (
        <div className="card mb-2">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                    <h6 className="card-title mb-0">{comment.user.username}</h6>
                    <small className="text-muted">{new Date(comment.dateCreated).toLocaleDateString()}</small>
                </div>
                <p className="card-text mt-2">{comment.content}</p>
                <div className="d-flex align-items-center">
                    <div className="d-flex align-items-center mx-2">
                        <span>{comment.upvotes}</span>
                        <GoArrowUp onClick={() => upVote(comment._id)} style={hasVotedComment || !isParticipant ? disabledStyle : { cursor: 'pointer' }} />
                    </div>
                    <div className="d-flex align-items-center mx-2">
                        <span>{comment.downvotes}</span>
                        <GoArrowDown onClick={() => downVote(comment._id)} style={hasVotedComment || !isParticipant ? disabledStyle : { cursor: 'pointer' }} />
                    </div>
                    {isParticipant ? <GoReply className="mx-2" onClick={toggleReply} style={{ cursor: 'pointer' }} /> : ''}

                </div>
                {showReply && (
                    <form onSubmit={handleReplySubmit} className="mt-3">
                        <div className="mb-3">
                            <textarea
                                className="form-control"
                                value={subCommentContent}
                                onChange={(e) => setSubCommentContent(e.target.value)}
                                placeholder="Add a reply"
                                rows="3"
                                disabled={!isParticipant}
                            ></textarea>
                        </div>
                        <div className='mb-3'>
                            <button type="submit" className="btn btn-primary" disabled={!isParticipant}>Submit</button>
                            <button type="button" className="btn btn-secondary" onClick={toggleReply}>Cancel</button>
                        </div>

                    </form>
                )}
                {subcomments && subcomments.map((subcomment) => (
                    <Comment key={subcomment._id} comment={subcomment} currentUser={currentUser} />
                ))}
            </div>
        </div>
    );
};

export default Comment;