import { useState } from "react";
import { GoArrowUp, GoArrowDown, GoCommentDiscussion, GoReply, GoLightBulb, GoPencil } from "react-icons/go";
import { Form, Field } from "react-final-form";
import { useCreateVoteMutation, useCreateCommentMutation, useCreateNotificationMutation, useUpdateCommentMutation, useFetchDiscussionQuery, useUpdateNotificationMutation } from "../../store";
import Comment from "./Comment";
import '../../static/discussion-board.css';

const InitialResponse = ({ username, avatar, dateCreated, response, notifications, studyId, promptId, responseId, currentUser, votes, comments, taskId }) => {
    const [createVote, { error: errorVote, isLoading: isLoadingVote }] = useCreateVoteMutation();
    const [createComment, { error: errorComment, isLoading: isLoadingComment }] = useCreateCommentMutation();
    const [createNotification, { error: errorCreateNotification, isLoading: isLoadingCreateNotification }] = useCreateNotificationMutation();
    const [updateComment, { error: errorUpdateComment, isLoading: isLoadingUpdateComment }] = useUpdateCommentMutation();
    const { refetch: refetchDiscussion } = useFetchDiscussionQuery(taskId);
    const [updateNotification, { error: errorUpdateNotification, isLoading: isLoadingUpdateNotification }] = useUpdateNotificationMutation();

    const [commentContent, setCommentContent] = useState("");
    const [showComments, setShowComments] = useState(true);
    const [showNewComment, setShowNewComment] = useState(false);
    const [editComment, setEditComment] = useState(false);
    const [showClarificationComment, setShowClarificationComment] = useState(false);
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

    if (isLoadingVote || isLoadingComment || isLoadingCreateNotification || isLoadingUpdateComment || isLoadingUpdateNotification) {
        return <div>Loading...</div>;
    }

    if (errorVote || errorComment || errorCreateNotification || errorUpdateComment || errorUpdateNotification) {
        return <div>Error: {errorVote?.data || errorComment?.data || errorCreateNotification?.data || errorUpdateComment?.data || errorUpdateNotification?.data}</div>;
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
        //console.log("note: ", notification)
        return notification.initialResponse === responseId && notification.status === 'clarify-pending-approval';
    });
    //console.log("hasNotification: ", hasNotification)

    const usersNotifications = notifications.filter((notification) => notification.toUser._id === currentUser._id);
    console.log("usersNotifications: ", usersNotifications);
    //const initialResponseNotification = usersNotifications.find((notification) => notification.initialResponse === responseId);
    const initialResponseNotification = usersNotifications.find((notification) =>
        notification.initialResponse === responseId && notification.status === 'clarify-pending-approval'
    );
    //console.log("initialResponseNotification: ", initialResponseNotification)
    let unApprovedInitialResponseNotification = false;
    if (initialResponseNotification) {
        unApprovedInitialResponseNotification = initialResponseNotification.status === 'clarify-pending-approval' ? true : false;
    }

    /*const triggerClarification = () => {
        setShowClarificationComment(true);
    }*/



    const onSubmitUpdateComment = (commentContent) => {
        const notification = usersNotifications.find((notification) => notification.initialResponse === responseId);
        //console.log("notification: ", notification)
        //console.log("Study Response ID: ", responseId);
        const update = {
            commentContent: commentContent['update-comment'],
            notificationId: notification?._id ?? '',
            type: 'initialResponse'
        };
        updateComment({ commentId: responseId, update, task: taskId });
        setEditComment(false);
        refetchDiscussion();

    };
    const handleSubmitClarification = async () => {
        try {
            await createNotification({ postId: responseId, postType: 'initialResponse', notificationType: 'clarify', fromUser: currentUser._id, toUser: username, task: taskId });
        } catch (error) {
            console.error("Error submitting clarification:", error);
        }
        setShowClarificationComment(!showClarificationComment);
    };
    const handleSubmitClarificationComment = async(commentContent) => {
        const comment = commentContent['facilitator-comment'];
        try {
            await createComment({ promptId, responseId, content: comment, studyId });
        } catch (error) {
            console.error("Error submitting clarification:", error);
            // Handle the error appropriately, e.g., show a notification or set an error state
        }
        setShowClarificationComment(!showClarificationComment);
    }
    /*const approveClarification = () => {
        updateNotification({ responseId });
    };*/
 

    // Div that colors the card based on notification status
    //<div className={`card mb-2 border-left-only ${unApprovedInitialResponseNotification ? 'bg-warning-subtle' : ''}`}></div>



    return (
        <div className='card mb-2 border-left-only'>
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
                            initialValues={{ 'update-comment': response }}
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
                    {showClarificationComment && (
                        <Form
                            onSubmit={handleSubmitClarificationComment}
                            render={({ handleSubmit }) => (
                                <form onSubmit={handleSubmit} className="needs-validation mb-3">
                                    <Field
                                        name="facilitator-comment"
                                        component="textarea"
                                        type="text"
                                        className="form-control"
                                        placeholder="Please specify what part of the response needs clarification..."
                                    />
                                    <Field name="facilitator-comment">
                                        {({ meta }) => meta.error && meta.touched && <span className="text-danger">{meta.error}</span>}
                                    </Field>
                                    <div>
                                        <button type="submit" className="mt-2 btn btn-success">Submit</button>
                                        <button className="mt-2 ms-2 btn btn-secondary" onClick={() => setShowClarificationComment(!showClarificationComment)}>Cancel</button>
                                    </div>
                                </form>
                            )}
                        >
                        </Form>
                    )}

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
                    {isParticipant && (
                        <div onClick={toggleNewComment} style={{ cursor: 'pointer' }} className="d-flex align-items-center small badge rounded-pill text-bg-light pe-2 ms-2">
                            <GoReply className="mx-1 thick-icon" />
                            <span>Reply</span>
                        </div>
                    )}
                    {!isParticipant &&
                        <div className={`badge rounded-pill text-bg-light ${currentUser.username === username ? '' : 'ms-3'}`}>
                            <span>{comments.length}</span>
                            <GoCommentDiscussion className="mx-1" onClick={toggleComments} style={{ cursor: 'pointer' }} />
                        </div>
                    }
                    {!isParticipant &&
                        <button
                            className={`ms-2 badge rounded-pill ${hasNotification ? 'text-bg-secondary' : 'text-bg-warning'}`}
                            onClick={handleSubmitClarification}
                            disabled={hasNotification}
                        >
                            {!hasNotification ? 'Clarify' : 'Clairification Pending'} <GoLightBulb />
                        </button>
                    }
                    {(isParticipant && currentUser.username === username) &&
                        <button
                            className="ms-2 badge rounded-pill text-bg-light"
                            onClick={() => setEditComment(true)}
                        >
                            <span className="me-1">
                                <GoPencil />
                            </span>
                            <span>Edit</span>
                        </button>

                    }
                </div>
                {showComments && (
                    <div className="mt-3">
                        {comments.map((comment, idx) => (
                            <Comment key={idx} comment={comment} currentUser={currentUser} studyId={studyId} location="discussion-board" taskId={taskId} />
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
                    </div>
                )}
            </div>
        </div>
    );
};

export default InitialResponse;