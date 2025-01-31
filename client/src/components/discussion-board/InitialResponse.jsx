import { useState } from "react";
import { GoArrowUp, GoArrowDown, GoCommentDiscussion, GoPlus, GoLightBulb, GoPencil } from "react-icons/go";
import { Form, Field } from "react-final-form";
import { useCreateVoteMutation, useCreateCommentMutation, useCreateNotificationMutation, useUpdateCommentMutation } from "../../store";
import Comment from "./Comment";
import '../../static/discussion-board.css';

const InitialResponse = ({ username, avatar, dateCreated, response, notifications, studyId, promptId, responseId, currentUser, votes, comments, taskId }) => {
    const [createVote, { error: errorVote, isLoading: isLoadingVote }] = useCreateVoteMutation();
    const [createComment, { error: errorComment, isLoading: isLoadingComment }] = useCreateCommentMutation();
    const [createNotification, { error: errorCreateNotification, isLoading: isLoadingCreateNotification }] = useCreateNotificationMutation();
    const [updateComment, {error: errorUpdateComment, isLoading: isLoadingUpdateComment}] = useUpdateCommentMutation();

    const [commentContent, setCommentContent] = useState("");
    const [showComments, setShowComments] = useState(false);
    const [showNewComment, setShowNewComment] = useState(false);
    const [editComment, setEditComment] = useState(false);
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

    if (isLoadingVote || isLoadingComment || isLoadingCreateNotification) {
        return <div>Loading...</div>;
    }

    if (errorVote || errorComment || errorCreateNotification) {
        return <div>Error: {errorVote?.data || errorComment?.data || errorCreateNotification?.data}</div>;
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
    };

    const hasNotification = notifications.some((notification) => {
        return notification.initialResponse === responseId;
    });

    const usersNotifications = notifications.filter((notification) => notification.toUser._id === currentUser._id);
    const initialResponseNotification = usersNotifications.find((notification) => notification.initialResponse === responseId);
    let unApprovedInitialResponseNotification = false;
    if (initialResponseNotification) {
        unApprovedInitialResponseNotification = initialResponseNotification.status === 'clairfy-pending-approval' ? true : false;
    }


    const handleSubmitClarification = () => {
        createNotification({ postId: responseId, postType: 'initialResponse', notificationType: 'clairfy', fromUser: currentUser._id, toUser: username, task: taskId });
    };

    const onSubmitUpdateComment = (commentContent) => {
        const notification = usersNotifications.find((notification) => notification.initialResponse === responseId);
        if (notification) {
            const update = {
                commentContent: commentContent['update-comment'],
                notificationId: notification._id
            };
            updateComment({ commentId: responseId, update });
        }
    };

    return (
        <div className={`card mb-2 border-left-only ${unApprovedInitialResponseNotification ? 'bg-warning-subtle' : ''}`}>
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                    <h5 className="card-title">
                        <img src={avatar} alt={`${username}'s avatar`} className="avatar-img-header mr-2" />
                        {username}
                    </h5>
                    <small className="text-muted">{new Date(dateCreated).toLocaleDateString()}</small>
                </div>
                <div className="d-inline justify-content-start align-items-start mb-1">
                    {editComment ?

                        <Form
                            onSubmit={onSubmitUpdateComment}
                            render={({ handleSubmit }) => (
                                <form onSubmit={handleSubmit} className="needs-validation mb-3">
                                    <Field
                                        name="update-comment"
                                        component="textarea"
                                        type="text"
                                        className="form-control"
                                    />
                                    <Field name="update-comment">
                                        {({ meta }) => meta.error && meta.touched && <span className="text-danger">{meta.error}</span>}
                                    </Field>
                                    <div>
                                        <button type="submit" className="mt-2 btn btn-success">Submit</button>
                                        <button className="mt-2 ms-2 btn btn-secondary" onClick={() => setEditComment(!editComment)}>Cancel</button>
                                    </div>

                                </form>
                            )}
                        >

                        </Form>

                        : <p className="card-text mb-2">{response}</p>}

                </div>
                <div className="d-flex align-items-center justify-content-start">
                    {currentUser.username !== username && (
                        <>
                            <div className="d-flex align-items-center">
                                {!isParticipant && <span className="mx-1">{votes.filter(vote => vote.vote === 1).length}</span>}
                                <span className={`badge rounded-pill ${renderVoteSpanStyle('upvote')}`}>
                                    <GoArrowUp onClick={upVote} style={renderVoteIconStyle('upvote')} className="thick-icon" />
                                </span>
                            </div>
                            <div className="d-flex align-items-center ms-1">
                                {!isParticipant && <span className="mx-1">{votes.filter(vote => vote.vote === -1).length}</span>}
                                <span className={`badge rounded-pill ${renderVoteSpanStyle('downvote')}`}>
                                    <GoArrowDown onClick={downVote} style={renderVoteIconStyle('downvote')} className="thick-icon" />
                                </span>
                            </div>
                        </>
                    )}
                    <div className={`badge rounded-pill text-bg-dark ${currentUser.username === username ? '' : 'ms-3'}`}>
                        <span>{comments.length}</span>
                        <GoCommentDiscussion className="mx-1" onClick={toggleComments} style={{ cursor: 'pointer' }} />
                    </div>
                    {!isParticipant &&
                        <button
                            className={`ms-2 badge rounded-pill ${hasNotification ? 'text-bg-dark' : 'text-bg-warning'}`}
                            onClick={handleSubmitClarification}
                            disabled={hasNotification}
                        >
                            {!hasNotification ? 'Clairfy' : 'Clairification Pending'} <GoLightBulb />
                        </button>
                    }
                    {(isParticipant && unApprovedInitialResponseNotification) &&
                        <button
                            className="ms-2 badge rounded-pill text-bg-dark  "
                            onClick={() => setEditComment(true)}
                        >
                            <GoPencil />
                        </button>

                    }
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