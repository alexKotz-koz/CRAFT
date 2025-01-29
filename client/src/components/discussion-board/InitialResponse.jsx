import { useState } from "react";
import { GoArrowUp, GoArrowDown, GoCommentDiscussion, GoPlus } from "react-icons/go";
import { useCreateVoteMutation, useCreateCommentMutation } from "../../store";
import Comment from "./Comment";
import '../../static/discussion-board.css';

const InitialResponse = ({ username, dateCreated, response, studyId, promptId, responseId, currentUser, votes, comments, taskId }) => {
    const [createVote, { error: errorVote, isLoading: isLoadingVote }] = useCreateVoteMutation();
    const [createComment, { error: errorComment, isLoading: isLoadingComment }] = useCreateCommentMutation();
    const [commentContent, setCommentContent] = useState("");
    const [showComments, setShowComments] = useState(false);
    const [showNewComment, setShowNewComment] = useState(false);
    const isParticipant = currentUser.role !== 'facilitator' && currentUser.role !== 'admin';

    let hasVoted = false;
    let currentUsersVote = 0;

    if (votes.length > 0) {
        votes.forEach((vote) => {
            if (vote.voter._id === currentUser._id) {
                hasVoted = true;
                currentUsersVote = vote.vote;
            }
        });
    }

    if (isLoadingVote || isLoadingComment) {
        return <div>Loading...</div>;
    }

    if (errorVote || errorComment) {
        return <div>Error: {errorVote?.data || errorComment?.data}</div>;
    }

    const upVote = () => {
        if (isParticipant) {
            createVote({ promptId, responseId, voteType: 'upvote' });
        }
    };

    const downVote = () => {
        if (isParticipant) {
            createVote({ promptId, responseId, voteType: 'downvote' });
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

    //ToDo: A duplicate of this exact fx is in Comment.jsx
    const renderVoteIconStyle = (voteType) => {
        if (!isParticipant) {
            return { cursor: 'not-allowed', color: 'gray' };
        }
        if (hasVoted) {
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
        if (hasVoted) {
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
                <div className=" d-flex justify-content-between align-items-center">
                    <h5 className="card-title ">{username}</h5>
                    <small className="text-muted">{new Date(dateCreated).toLocaleDateString()}</small>
                </div>
                <div className="d-flex justify-content-start align-items-start mb-1">
                    <p className="card-text">{response}</p>
                </div>
                <div className="d-flex align-items-center justify-content-start">
                    {currentUser.username !== username && (
                        <>
                            <div className="d-flex align-items-center">
                                {!isParticipant && <span>{votes.filter(vote => vote.vote === 1).length}</span>}
                                <span className={renderVoteSpanStyle('upvote')}>
                                    <GoArrowUp onClick={upVote} style={renderVoteIconStyle('upvote')} className="thick-icon" />
                                </span>

                            </div>
                            <div className="d-flex align-items-center ms-1">
                                {!isParticipant && <span>{votes.filter(vote => vote.vote === -1).length}</span>}
                                <span className={renderVoteSpanStyle('downvote')}>
                                    <GoArrowDown onClick={downVote} style={renderVoteIconStyle('downvote')} className="thick-icon" />

                                </span>
                            </div>
                        </>
                    )}
                    <div className={currentUser.username === username ? '' : 'ms-3'}>
                        <span>{comments.length}</span>
                        <GoCommentDiscussion className="mx-1" onClick={toggleComments} style={{ cursor: 'pointer' }} />
                    </div>


                </div>
                {showComments && (
                    <div className="mt-3">
                        {comments.map((comment, idx) => (
                            <Comment key={idx} comment={comment} currentUser={currentUser} studyId={studyId} taskId={taskId} />
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