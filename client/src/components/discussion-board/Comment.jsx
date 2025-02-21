import { useState } from 'react';
import { Form, Field } from "react-final-form";

import { GoArrowUp, GoArrowDown, GoPencil, GoReply } from "react-icons/go";
import { useCreateCommentVoteMutation, useCreateSubCommentMutation, useFetchSubCommentsQuery, useUpdateCommentMutation } from "../../store";
import '../../static/discussion-board.css';

const Comment = ({ comment, currentUser, studyId }) => {
    const [createVote, { error: errorVote, isLoading: isLoadingVote }] = useCreateCommentVoteMutation();
    const [createSubcomment, { error: errorSubcomment, isLoading: isLoadingSubcomment }] = useCreateSubCommentMutation();
    const [updateComment, { error: errorUpdateComment, isLoading: isLoadingUpdateComment }] = useUpdateCommentMutation();
    const [subCommentContent, setSubCommentContent] = useState("");
    const [showReply, setShowReply] = useState(false);
    const [editComment, setEditComment] = useState(false);

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
    };

    const isCommentCreator = currentUser._id === comment.user._id;
    const originalComment = comment.content;

    const onSubmitUpdateComment =  (values) => {
        const update = {
            commentContent: values['update-comment'],
            notificationId: '', // currently no logic to handle notifications related to the comments
            type: 'comment'
        };
        updateComment({ commentId: comment._id, update });
        setEditComment(false);
    };

    return (
        <div className="card border-left-only">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                    <h6 className="card-title">
                        <img src={comment.user.avatar} alt={`${comment.user.username}'s avatar`} className="avatar-img-header mr-2" />
                        {comment.user.username}
                    </h6>
                    <small className="text-muted">{new Date(comment.dateCreated).toLocaleDateString()}</small>
                </div>
                <div className="d-inline justify-content-start align-items-start mb-1">
                    {editComment ?
                        <Form
                            onSubmit={onSubmitUpdateComment}
                            initialValues={{ 'update-comment': originalComment }}
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
                        />
                        : <p className="card-text mb-2">{originalComment}</p>}
                </div>
                <div className="d-flex align-items-center justify-content-start">
                    {!isCommentCreator && (
                        <>
                            <div className="d-flex align-items-center">
                                {!isParticipant && <span className="mx-1">{comment.votes.filter(vote => vote.vote === 1).length}</span>}
                                <span className={renderVoteSpanStyle('upvote')}>
                                    <GoArrowUp onClick={() => upVote(comment._id)} style={renderVoteIconStyle('upvote')} className="thick-icon" />
                                </span>
                            </div>
                            <div className="d-flex align-items-center ms-1">
                                {!isParticipant && <span className="mx-1">{comment.votes.filter(vote => vote.vote === -1).length}</span>}
                                <span className={renderVoteSpanStyle('downvote')}>
                                    <GoArrowDown onClick={() => downVote(comment._id)} style={renderVoteIconStyle('downvote')} className="thick-icon" />
                                </span>
                            </div>
                        </>
                    )}
                    {isParticipant && (
                        <div onClick={toggleReply} style={{ cursor: 'pointer' }} className="d-flex align-items-center small badge rounded-pill text-bg-light pe-2 ms-2">
                            <GoReply className="mx-1 thick-icon" />
                            <span>Reply</span>
                        </div>
                    )}
                    {(isParticipant && currentUser.username === comment.user.username) &&
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