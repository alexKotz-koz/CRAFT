import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Spinner } from 'reactstrap';
import { useFetchStudyResponseQuery, useFetchUserQuery, useCreateCommentMutation, useUpdateNotificationMutation, useCreateNotificationMutation, useFetchCommentForClarificationQuery, useCreateSubCommentMutation, useLazyFindDiscussionQuery } from '../../../store';
import Comment from '../../discussion-board/Comment';
import { Form, Field } from "react-final-form";
import ReactGA from 'react-ga4';

const ClarificationModal = ({ isOpen, toggle, selectedStudyResponseId, notification }) => {


    const isCommentNotification = notification && notification.comment;
    const navigate = useNavigate();
  

    const { data: studyResponse, isLoading: isLoadingStudyResponse, error: errorStudyResponse } =
        !isCommentNotification ?
            useFetchStudyResponseQuery({ studyResponseId: selectedStudyResponseId }) :
            useFetchCommentForClarificationQuery({ commentId: notification.comment });

    const { data: currentUser, error: errorUser, isLoading: isLoadingUser, refetch } = useFetchUserQuery();
    const [createComment, { error: errorComment, isLoading: isLoadingComment }] = useCreateCommentMutation();
    const [createSubcomment, { error: errorSubcomment, isLoading: isLoadingSubcomment }] = useCreateSubCommentMutation();
    const [findDiscussion, {error: errorFindDiscussion, isLoading: isLoadingFindDiscussion}] = useLazyFindDiscussionQuery();

    const [updateNotification, { error: errorUpdateNotification, isLoading: isLoadingUpdateNotification }] = useUpdateNotificationMutation();
    const [createNotification, { error: errorCreateNotification, isLoading: isLoadingCreateNotification }] = useCreateNotificationMutation();

    const [showFullPrompt, setShowFullPrompt] = useState(false); 

    if (isLoadingStudyResponse || isLoadingUser || isLoadingComment || isLoadingUpdateNotification || isLoadingCreateNotification) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner color="primary" />
            </div>
        );
    }

    if (errorStudyResponse || errorUser || errorComment || errorUpdateNotification || errorCreateNotification) {
        return <div>Error: {errorStudyResponse?.data || errorUser?.data || errorComment?.data || errorUpdateNotification?.data || errorCreateNotification?.data}</div>;
    }

    // Helper functions to turn the prompt from html to text on the Modal Header
    const parseTextContent = (html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        return doc.body.textContent || ''; 
    };

    const parseFirstElementText = (html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        return doc.body.firstChild ? doc.body.firstChild.textContent : '';
    };

    let studyId, taskId, dataPrompt, fullPrompt, shortPrompt, response, comments;
    let username, avatar, promptId, responseId, dateCreated;

    if (!isCommentNotification && studyResponse) {
        studyId = studyResponse.study;
        taskId = studyResponse.task;
        dataPrompt = studyResponse.matchingResponse.prompt.prompt;
        fullPrompt = parseTextContent(dataPrompt);
        shortPrompt = parseFirstElementText(dataPrompt);
        response = studyResponse.matchingResponse.response;
        comments = studyResponse.matchingResponse.comments;
        username = studyResponse.participant.username;
        avatar = studyResponse.participant.avatar;
        promptId = studyResponse.matchingResponse.prompt._id;
        responseId = studyResponse.matchingResponse._id;
        dateCreated = studyResponse.dateCreated;
    }

    const currentUserId = currentUser._id;
    const notificationId = notification._id;
    const isParticipant = currentUser.role !== 'facilitator' && currentUser.role !== 'admin';

    const handleSubmitClarificationComment = async (commentContent) => {

        ReactGA.event({
            category: 'Clarification',
            action: 'Clarification Form Submit',
            label: 'Participant Responded to Clarification Request'
        })

        const comment = commentContent['update-comment'];

        try {
            if (!isCommentNotification) {
                // Handle initial response clarification
                await createComment({ promptId, responseId, content: comment, studyId });
                await updateNotification({ notificationId, newStatus: 'clarification-submitted' });
                await createNotification({
                    postId: responseId,
                    postType: 'initialResponse',
                    notificationType: 'clarify',
                    fromUser: currentUserId,
                    toUser: notification.fromUser.username,
                    task: taskId
                });
            } else {
                // Handle comment clarification
                await createSubcomment({
                    commentId: notification.comment,
                    content: comment,
                    studyId: studyResponse.studyId
                });
                await updateNotification({ notificationId, newStatus: 'clarification-submitted' });
                await createNotification({
                    postId: notification.comment,
                    postType: 'comment',
                    notificationType: 'clarify',
                    fromUser: currentUserId,
                    toUser: notification.fromUser.username,
                    task: notification.task
                });
            }

            refetch(); // Trigger refetch of user data
            toggle();
        } catch (err) {
            console.error("Error submitting clarification:", err);
        }
    };

    const markNotificationAsRead = async () => {
        try {
            await updateNotification({ notificationId, newStatus: 'read' });
            refetch();
            toggle();
        } catch (err) {
            console.error("Error updating notification status: ", err);
        }
    };

    const handleMarkReadAndNavigate = async () => {
        try {
            await updateNotification({ notificationId, newStatus: 'read' });
            refetch();
            console.log("hnrn: task", notification.task._id)
            if (notification && notification.task) {
                const discussion = await findDiscussion({ taskId: notification.task._id }).unwrap();
                console.log("discussion: ", discussion)
                if(discussion && discussion.task){
                    navigate(`/discussion/${discussion.task}`);
                } else {
                    alert("No discussion found for the given notification. Please contact an administrator if you believe there should be a discussion for this notificaiton.")
                }
            } else {
                console.error("Missing task Id in notification", notification)
            }

            toggle();


            
        } catch (err) {
            console.error("Error updating notification status: ", err);
        }
    };

    const toggleFullPrompt = () => {
        setShowFullPrompt(!showFullPrompt); // Toggle the visibility of the full prompt
    };

    const renderModalForInitialResponse = () => {
        return (
            <Modal isOpen={isOpen} toggle={toggle} centered backdrop='static'>
                <ModalHeader toggle={toggle}>
                    {showFullPrompt ? fullPrompt : shortPrompt}
                    <button
                        className="btn btn-link p-0 ms-2"
                        onClick={toggleFullPrompt}
                        style={{ textDecoration: 'none' }}
                    >
                        {showFullPrompt ? "Show Less" : "Show Full Prompt"}
                    </button>
                </ModalHeader>
                <ModalBody>
                    <div className='container-fluid'>
                        <div className='row'>
                            <div className='card mb-2 border-left-only'>
                                <div className="card-body">
                                    <div className='container'>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h5 className="card-title d-flex align-items-center">
                                                <img src={avatar} alt={`${username}'s avatar`} className="avatar-img-header mr-2" />
                                                {username}
                                            </h5>
                                            <small className="text-muted">{new Date(dateCreated).toLocaleDateString()}</small>
                                        </div>
                                        <div className='row'>
                                            <div className="d-inline justify-content-start align-items-start mb-1">
                                                <p className="card-text mb-2">{response}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {comments.map((comment, idx) => (
                            <Comment key={idx} comment={comment} currentUser={currentUser} studyId={studyId} location="clarification-modal" taskId={taskId} notifications={null} />
                        ))}
                        {isParticipant &&
                            <div className='row'>
                                <Form
                                    onSubmit={handleSubmitClarificationComment}
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
                                                <button className="mt-2 ms-2 btn btn-secondary" onClick={() => toggle()}>Cancel</button>
                                            </div>
                                        </form>
                                    )}
                                />
                            </div>
                        }
                    </div>
                </ModalBody>
                {!isParticipant &&
                    <ModalFooter>
                        <Button color='success' onClick={() => markNotificationAsRead()}>Mark as Read</Button>
                        <Button color='secondary' onClick={() => toggle()}>Cancel</Button>
                    </ModalFooter>
                }
            </Modal>
        );
    };

    const renderModalForComment = () => {
        // Make sure studyResponse contains the comment data
        if (!studyResponse) {
            return (
                <Modal isOpen={isOpen} toggle={toggle} centered backdrop='static'>
                    <ModalHeader toggle={toggle}>Comment Clarification</ModalHeader>
                    <ModalBody>
                        <p>Loading comment data...</p>
                    </ModalBody>
                    <ModalFooter>
                        <Button color='secondary' onClick={toggle}>Close</Button>
                    </ModalFooter>
                </Modal>
            );
        }

        // Determine user display name based on role
        const userDisplayName = studyResponse.user.role === 'participant'
            ? studyResponse.user.username
            : `${studyResponse.user.firstName} ${studyResponse.user.lastName}`;


        if (!isParticipant) {
            return (
                <Modal isOpen={isOpen} toggle={toggle} centered backdrop='static'>
                    <ModalHeader toggle={toggle}>
                        Comment Clarification Request
                    </ModalHeader>
                    <ModalBody>
                        <div className='container-fluid'>
                            <div className='row'>
                                <div className='card mb-2 border-left-only'>
                                    <div className="card-body">
                                        <div className='container'>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h5 className="card-title d-flex align-items-center">
                                                    {studyResponse.user && (
                                                        <>
                                                            <img
                                                                src={studyResponse.user.avatar}
                                                                alt={`${userDisplayName}'s avatar`}
                                                                className="avatar-img-header mr-2"
                                                            />
                                                            {userDisplayName}
                                                        </>
                                                    )}
                                                </h5>
                                                <small className="text-muted">
                                                    {studyResponse._dateCreated && new Date(studyResponse._dateCreated).toLocaleDateString()}
                                                </small>
                                            </div>
                                            <div className='row'>
                                                <div className="d-inline justify-content-start align-items-start mb-1">
                                                    <p className="card-text mb-2">{studyResponse.content}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="alert alert-info mt-3">
                                <p className="mb-0">
                                    <strong>A clarification request has been submitted for this comment.</strong>
                                    Please click the button below to view the full discussion.
                                </p>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color='primary' onClick={handleMarkReadAndNavigate}>View Discussion</Button>
                        <Button color='secondary' onClick={toggle}>Close</Button>
                    </ModalFooter>
                </Modal>
            );
        }

        return (
            <Modal isOpen={isOpen} toggle={toggle} centered backdrop='static'>
                <ModalHeader toggle={toggle}>
                    Comment Clarification Request
                </ModalHeader>
                <ModalBody>
                    <div className='container-fluid'>
                        <div className='row'>
                            <div className='card mb-2 border-left-only'>
                                <div className="card-body">
                                    <div className='container'>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h5 className="card-title d-flex align-items-center">
                                                {studyResponse.user && (
                                                    <>
                                                        <img
                                                            src={studyResponse.user.avatar}
                                                            alt={`${userDisplayName}'s avatar`}
                                                            className="avatar-img-header mr-2"
                                                        />
                                                        {userDisplayName}
                                                    </>
                                                )}
                                            </h5>
                                            <small className="text-muted">
                                                {studyResponse._dateCreated && new Date(studyResponse._dateCreated).toLocaleDateString()}
                                            </small>
                                        </div>
                                        <div className='row'>
                                            <div className="d-inline justify-content-start align-items-start mb-1">
                                                <p className="card-text mb-2">{studyResponse.content}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Display child comments if they exist */}
                        {studyResponse.childComments && studyResponse.childComments.length > 0 && (
                            <div className="mt-3">
                                <h6>Replies:</h6>
                                {studyResponse.childComments.map((childComment, idx) => (
                                    <div key={idx} className="card mb-2 ms-4 border-left-only">
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h6 className="card-title d-flex align-items-center">
                                                    <img
                                                        src={childComment.user.avatar}
                                                        alt={`${childComment.user.username}'s avatar`}
                                                        className="avatar-img-header mr-2"
                                                    />
                                                    {childComment.user.role === 'participant'
                                                        ? childComment.user.username
                                                        : `${childComment.user.firstName} ${childComment.user.lastName}`}
                                                </h6>
                                                <small className="text-muted">
                                                    {childComment._dateCreated && new Date(childComment._dateCreated).toLocaleDateString()}
                                                </small>
                                            </div>
                                            <p className="card-text">{childComment.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add comment input form for participant responses */}
                        {isParticipant && (
                            <div className='row mt-3'>
                                <Form
                                    onSubmit={handleSubmitClarificationComment}
                                    render={({ handleSubmit }) => (
                                        <form onSubmit={handleSubmit} className="needs-validation mb-3">
                                            <Field
                                                name="update-comment"
                                                component="textarea"
                                                type="text"
                                                className="form-control"
                                                placeholder="Add your clarification response..."
                                            />
                                            <Field name="update-comment">
                                                {({ meta }) => meta.error && meta.touched && <span className="text-danger">{meta.error}</span>}
                                            </Field>
                                            <div>
                                                <button type="submit" className="mt-2 btn btn-success">Submit</button>
                                                <button className="mt-2 ms-2 btn btn-secondary" onClick={() => toggle()}>Cancel</button>
                                            </div>
                                        </form>
                                    )}
                                />
                            </div>
                        )}
                    </div>
                </ModalBody>
                {!isParticipant &&
                    <ModalFooter>
                        <Button color='success' onClick={() => markNotificationAsRead()}>Mark as Read</Button>
                        <Button color='secondary' onClick={() => toggle()}>Close</Button>
                    </ModalFooter>
                }
            </Modal>
        );
    };


    return isCommentNotification ? renderModalForComment() : renderModalForInitialResponse();

};

export default ClarificationModal;