import { useState } from 'react';
import { GoArrowUp, GoArrowDown, GoReply } from "react-icons/go";
import { useCreateCommentVoteMutation, useCreateSubCommentMutation, useFetchSubCommentsQuery } from "../../store";
import '../../static/discussion-board.css';

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

    const renderVoteIconStyle = (voteType) => {
        if (!isParticipant) {
            return { cursor: 'not-allowed', color: 'gray' };
        }
        if (hasVotedComment) {
            if (voteType === 'upvote' && currentUsersVote === 1) {
                return { cursor: 'pointer', color: 'white' };
            }
            if (voteType === 'downvote' && currentUsersVote === -1) {
                return { cursor: 'pointer', color: 'white' };
            }
        }
        return { cursor: 'pointer', color: 'black' };
    };

    const renderVoteSpanStyle = (voteType) => {
        if (!isParticipant) {
            return 'badge rounded-pill'
        }
        if (hasVotedComment) {
            if (voteType === 'upvote' && currentUsersVote === 1) {
                return 'badge rounded-pill text-bg-success';
            }
            if (voteType === 'downvote' && currentUsersVote === -1) {
                return 'badge rounded-pill text-bg-danger'
            }
        }
        return 'badge rounded-pill';
    }

    return (
        <div className="card mb-2 border-left-only">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                    <h6 className="card-title">{comment.user.username}</h6>
                    <small className="text-muted">{new Date(comment.dateCreated).toLocaleDateString()}</small>
                </div>
                <div className="d-flex justify-content-start align-items-start mb-1">
                    <p className="card-text">{comment.content}</p>
                </div>
                <div className="d-flex align-items-center justify-content-start">
                    <div className="d-flex align-items-center">
                        {!isParticipant && <span>{comment.upvotes}</span>}
                        <span className={renderVoteSpanStyle('upvote')}>
                            <GoArrowUp onClick={() => upVote(comment._id)} style={renderVoteIconStyle('upvote')} className="thick-icon" />
                        </span>
                    </div>
                    <div className="d-flex align-items-center ms-1`">
                        {!isParticipant && <span>{comment.downvotes}</span>}
                        <span className={renderVoteSpanStyle('downvote')}>
                            <GoArrowDown onClick={() => downVote(comment._id)} style={renderVoteIconStyle('downvote')} className="thick-icon" />
                        </span>
                        
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