import { useState } from 'react';
import { GoArrowUp, GoArrowDown, GoReply } from "react-icons/go";
import { useCreateCommentVoteMutation, useCreateSubCommentMutation, useFetchSubCommentsQuery } from "../../store";

const Comment = ({ comment, currentUser, studyId, taskId }) => {
    const [createVote, { error: errorVote, isLoading: isLoadingVote }] = useCreateCommentVoteMutation();
    const [createSubcomment, { error: errorSubcomment, isLoading: isLoadingSubcomment }] = useCreateSubCommentMutation();
    const [subCommentContent, setSubCommentContent] = useState("");
    const [showReply, setShowReply] = useState(false);
    const { data: subcomments, error: errorFetchSubcomments, isLoading: isLoadingFetchSubcomments } = useFetchSubCommentsQuery({ commentId: comment._id });

    const isParticipant = currentUser.role !== 'facilitator' && currentUser.role !== 'admin';
    
    let hasVotedComment = false;
    let currentUsersVote = 0;

    let votes = comment.votes;
    if (votes.length > 0) {
        votes.forEach((vote) => {
            if (vote.voter._id === currentUser._id) {
                hasVotedComment = true;
                currentUsersVote = vote.vote;
            }
        });
    }

    if (isLoadingVote || isLoadingSubcomment || isLoadingFetchSubcomments) {
        return <div>Loading...</div>;
    }

    if (errorVote || errorSubcomment || errorFetchSubcomments) {
        return <div>Error: {errorVote?.data || errorSubcomment?.data || errorFetchSubcomments?.data}</div>;
    }


    const upVote = (commentId) => {
        if (isParticipant) {
            createVote({ commentId, voteType: 'upvote' });
        }
    };

    const downVote = (commentId) => {
        if (isParticipant) {
            createVote({ commentId, voteType: 'downvote' });
        }
    };

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (subCommentContent.trim() && isParticipant) {
            await createSubcomment({ commentId: comment._id, content: subCommentContent, studyId });
            setSubCommentContent("");
            setShowReply(false);
        }
    };

    const toggleReply = () => {
        setShowReply(!showReply);
    };

    //ToDo: This is duplicated in InitialResponse
    const renderVoteIconStyle = (voteType) => {
        if (!isParticipant) {
            return { cursor: 'not-allowed', color: 'gray'};
        }
        if (hasVotedComment) {
            if (voteType === 'upvote' && currentUsersVote === 1) {
                return { cursor: 'pointer', color: 'green' };
            }
            if (voteType === 'downvote' && currentUsersVote === -1) {
                return { cursor: 'pointer', color: 'red' };
            }
        }
        return { cursor: 'pointer', color: 'black' };
    };

    return (
        <div className="card mb-2 bg-dark-subtle border border-tertiary p-2 rounded">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                    <h6 className="card-title mb-0">{comment.user.username}</h6>
                    <small className="text-muted">{new Date(comment.dateCreated).toLocaleDateString()}</small>
                </div>
                <p className="card-text mt-2">{comment.content}</p>
                <div className="d-flex align-items-center">
                    <div className="d-flex align-items-center mx-1 small">
                        {!isParticipant && <span>{comment.upvotes}</span>}
                        <GoArrowUp onClick={() => upVote(comment._id)} style={renderVoteIconStyle('upvote')} className='thick-icon' />
                    </div>
                    <div className="d-flex align-items-center mx-1 me-2 small">
                        {!isParticipant && <span>{comment.downvotes}</span>}
                        <GoArrowDown onClick={() => downVote(comment._id)} style={renderVoteIconStyle('downvote')} className='thick-icon' />
                    </div>
                    {isParticipant && (
                        <div onClick={toggleReply} style={{ cursor: 'pointer' }} className="d-flex align-items-center small">
                            <GoReply className="mx-1 thick-icon" />
                            <span>Reply</span>
                        </div>
                    )}
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