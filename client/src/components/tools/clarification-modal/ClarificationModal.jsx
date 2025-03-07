import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { useFetchStudyResponseQuery, useFetchUserQuery, useCreateCommentMutation, useUpdateNotificationMutation, useCreateNotificationMutation } from '../../../store';
import Comment from '../../discussion-board/Comment';
import { Form, Field } from "react-final-form";

const ClarificationModal = ({ isOpen, toggle, selectedStudyResponseId, notification }) => {
    const { data: studyResponse, isLoading: isLoadingStudyResponse, error: errorStudyResponse } = useFetchStudyResponseQuery({ studyResponseId: selectedStudyResponseId });
    const { data: currentUser, error: errorUser, isLoading: isLoadingUser, refetch } = useFetchUserQuery();
    const [createComment, { error: errorComment, isLoading: isLoadingComment }] = useCreateCommentMutation();
    const [updateNotification, { error: errorUpdateNotification, isLoading: isLoadingUpdateNotification }] = useUpdateNotificationMutation();
    const [createNotification, { error: errorCreateNotification, isLoading: isLoadingCreateNotification }] = useCreateNotificationMutation();

    if (isLoadingStudyResponse || isLoadingUser || isLoadingComment || isLoadingUpdateNotification || isLoadingCreateNotification) {
        return <div>Loading...</div>;
    }

    if (errorStudyResponse || errorUser || errorComment || errorUpdateNotification || errorCreateNotification) {
        return <div>Error: {errorStudyResponse?.data || errorUser?.data || errorComment?.data || errorUpdateNotification?.data || errorCreateNotification?.data}</div>;
    }

    const stripHtmlTags = (html) => {
        return html.replace(/<\/?[^>]+(>|$)/g, "");
    };

    const studyId = studyResponse.study;
    const taskId = studyResponse.task;
    const dataPrompt = studyResponse.matchingResponse.prompt.prompt;
    const prompt = stripHtmlTags(dataPrompt);
    const { response, comments } = studyResponse.matchingResponse;
    const { username, avatar } = studyResponse.participant;
    const promptId = studyResponse.matchingResponse.prompt._id;
    const responseId = studyResponse.matchingResponse._id;
    const dateCreated = studyResponse.dateCreated;
    const currentUserId = currentUser._id;
    const notificationId = notification._id;

    const isParticipant = currentUser.role !== 'facilitator' && currentUser.role !== 'admin';

    const handleSubmitClarificationComment = async (commentContent) => {
        const comment = commentContent['update-comment'];
        try {
            await createComment({ promptId, responseId, content: comment, studyId });
            await updateNotification({ notificationId, newStatus: 'clarification-submitted' });
            await createNotification({ postId: responseId, postType: 'initialResponse', notificationType: 'clarify', fromUser: currentUserId, toUser: notification.fromUser.username, task: taskId });
            refetch(); // Trigger refetch of user data
            toggle();
        } catch (err) {
            console.error("Error submitting clarification:", err);
        }
    };

    const markNotificationAsRead = async () => {
        try {
            await updateNotification({ notificationId, newStatus: 'read' });
            refetch(); // Trigger refetch of user data
            toggle();
        } catch (err) {
            console.error("Error updating notification status: ", err);
        }
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle} centered backdrop='static'>
            <ModalHeader toggle={toggle}>{prompt}</ModalHeader>
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
                        <Comment key={idx} comment={comment} currentUser={currentUser} studyId={studyId} location="clarification-modal" />
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

export default ClarificationModal;