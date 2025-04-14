const mongoose = require('mongoose');
const Discussion = mongoose.model('Discussion');
const StudyResponse = mongoose.model('StudyResponse');
const User = mongoose.model('User');
const Notification = mongoose.model('Notification');
const { Comment, InitialResponseComment, SubComment } = require('../models/Comment');
const requireLogin = require('../middlewares/requireLogin');

module.exports = (app) => {
    // GET Task Discussion
    // API: fetchDiscussion, useLazyFetchDiscussionQuery
    // Used in: DiscussionBoard.jsx, InitialResponse.jsx, (lazy) StudyDashboard
    app.get('/api/discussion/:taskId', requireLogin, async (req, res) => {
        const { taskId } = req.params;
        try {
            const discussion = await Discussion.findOne({ task: taskId })
                .populate({ path: 'prompts', model: 'StudyPrompt' })
                .populate({ path: 'study', populate: [{ path: 'name', select: 'name' }] })
                .populate({
                    path: 'initialResponses',
                    populate: [
                        {
                            path: '_participant',
                            select: 'username avatar'
                        },
                        {
                            path: 'responses.comments',
                            populate: [
                                { path: 'user', select: 'username avatar firstName lastName role' },
                                { path: 'comments', populate: { path: 'user', select: 'username avatar firstName lastName role' } },
                                { path: 'votes', populate: { path: 'voter', select: 'username avatar' } }
                            ]
                        },
                        {
                            path: 'responses.votes',
                            populate: { path: 'voter', select: 'username avatar' }
                        }

                    ]
                });

            if (!discussion) {
                return res.status(404).send("No discussion found for this study");
            }

            res.send(discussion);
        } catch (err) {
            console.error("Error fetching discussion:", err);
            res.status(422).send(err);
        }
    });

    // Vote Initial Response
    // API: createVote
    // Used in: InitialResponse.jsx
    app.post('/api/discussion/:promptId/:responseId/vote', requireLogin, async (req, res) => {
        const { promptId, responseId } = req.params;
        const { voteType } = req.body;
        const userId = req.user._id;
        try {
            const studyResponse = await StudyResponse.findOne({ 'responses._id': responseId });
            if (!studyResponse) {
                return res.status(404).send("Response not found");
            }

            const response = studyResponse.responses.find(r => r.prompt.toString() === promptId);
            if (!response) {
                return res.status(404).send("Response not found");
            }

            const userVote = response.votes.find(vote => vote.voter.toString() === userId.toString());
       

            // ToDo: Refactor to switch statement
            if (userVote) {
                if (voteType === 'upvote') {
                    if (userVote.vote === 1) {
                        userVote.vote = 0;
                    } else if (userVote.vote === -1) {
                        userVote.vote = 1;
                    } else if (userVote.vote === 0) {
                        userVote.vote = 1;
                    } else {
                        return res.status(400).send("Invalid vote operation");
                    }
                } else if (voteType === 'downvote') {
                    if (userVote.vote === -1) {
                        userVote.vote = 0;
                    } else if (userVote.vote === 1) {
                        userVote.vote = -1;
                    } else if (userVote.vote === 0) {
                        userVote.vote = -1;
                    }
                    else {
                        return res.status(400).send("Invalid vote operation");
                    }
                } else {
                    return res.status(400).send("Invalid vote type");
                }
            } else {
                if (voteType === 'upvote') {
                    response.votes.push({ voter: userId, vote: 1 });
                } else if (voteType === 'downvote') {
                    response.votes.push({ voter: userId, vote: -1 });
                } else {
                    return res.status(400).send("Invalid vote type");
                }
            }

            await studyResponse.save();
            res.send(studyResponse);

        } catch (err) {
            console.error("Error submitting vote: ", err)
            res.status(422).send(err);
        }
    });

    // Comment on Initial Response
    // API: createComment
    // Used in: InitialResponse.jsx, ClarificationModal.jsx
    app.post('/api/discussion/:promptId/:responseId/comment', requireLogin, async (req, res) => {
        const { promptId, responseId } = req.params;
        const { content, studyId } = req.body;
        const userId = req.user._id;

        try {
            const studyResponse = await StudyResponse.findOne({ 'responses._id': responseId });
            if (!studyResponse) {
                return res.status(404).send("Response not found");
            }

            const response = studyResponse.responses.find(r => r.prompt.toString() === promptId);
            if (!response) {
                return res.status(404).send("Response not found");
            }

            // Create a new comment
            const newComment = new InitialResponseComment({
                user: userId,
                content,
                response: response._id,
                studyId,
            });

            await newComment.save();

            // Add the new comment to the response's comments array
            response.comments.push(newComment._id);

            // Save the updated StudyResponse document
            await studyResponse.save();

            // Populate the user field in the new comment
            await newComment.populate('user', 'username');

            res.send(newComment);
        } catch (err) {
            res.status(422).send(err);
        }
    });

    // Vote on Subcomment
    // API: createCommentVote
    // Used in: Comment.jsx
    app.post('/api/discussion/:commentId/vote', requireLogin, async (req, res) => {
        const { commentId } = req.params;
        const { voteType } = req.body;
        const userId = req.user._id;

        try {
            const comment = await Comment.findById(commentId);
            if (!comment) {
                return res.status(404).send("Comment not found");
            }

            const userVote = comment.votes.find(vote => vote.voter.toString() === userId.toString());

            if (userVote) {
                if (voteType === 'upvote') {
                    if (userVote.vote === 1) {
                        userVote.vote = 0;
                    } else if (userVote.vote === -1) {
                        userVote.vote = 1;
                    } else if (userVote.vote === 0) {
                        userVote.vote = 1;
                    } else {
                        return res.status(400).send("Invalid vote operation");
                    }
                } else if (voteType === 'downvote') {
                    if (userVote.vote === -1) {
                        userVote.vote = 0;
                    } else if (userVote.vote === 1) {
                        userVote.vote = -1;
                    } else if (userVote.vote === 0) {
                        userVote.vote = -1;
                    }
                    else {
                        return res.status(400).send("Invalid vote operation");
                    }
                } else {
                    return res.status(400).send("Invalid vote type");
                }
            } else {
                if (voteType === 'upvote') {
                    comment.votes.push({ voter: userId, vote: 1 });
                } else if (voteType === 'downvote') {
                    comment.votes.push({ voter: userId, vote: -1 });
                } else {
                    return res.status(400).send("Invalid vote type");
                }
            }

            await comment.save();
            res.send(comment);

        } catch (err) {
            console.error("Error submitting vote: ", err)
            res.status(422).send(err);
        }
    });

    // Comment on Comment
    // API: createSubComment
    // Used in: Comment.jsx
    app.post('/api/discussion/:commentId/subcomment', requireLogin, async (req, res) => {
        const { commentId } = req.params;
        const { content, studyId } = req.body;
        const userId = req.user._id;

        try {

            const comment = await Comment.findById(commentId);
            if (!comment) {
                return res.status(404).send("Comment not found");
            }

            // Create a new comment
            const newComment = new SubComment({
                user: userId,
                content,
                parentComment: commentId,
                studyId
            });

            await newComment.save();

            // Populate the user field in the new comment
            await newComment.populate('user', 'username avatar firstName lastName role');

            res.send(newComment);


        } catch (err) {
            console.error("Error posting subcomment: ", err);
            res.status(422).send(err);
        }
    });

    // GET all subcomments for a specific user
    // API: fetchSubComments
    // Used in: Comment.jsx
    app.get('/api/discussion/:commentId/subcomment', requireLogin, async (req, res) => {
        const { commentId } = req.params;
        try {
            const subcomments = await SubComment.find({ parentComment: commentId }).populate('user', 'username avatar role firstName lastName');
            res.send(subcomments);
        } catch (err) {
            console.error("Error fetching subcomments:", err);
            res.status(422).send(err);
        }
    });

    // Create and Send Notification
    // API: createNotification
    // Used in: InitialResponse.jsx, ClarificationModal.jsx
    app.post('/api/discussion/:postId/notify', requireLogin, async (req, res) => {
        const { postId } = req.params;
        const { postType, notificationType, fromUser, toUser, task } = req.body;

        try {
            switch (postType) {
                case 'comment':
                    switch (notificationType) {
                        case 'clarify':
                            try {
                                const toUserId = await User.findOne({ username: toUser }).select('_id');

                                if (!toUserId) {
                                    res.status(400).send("No participant found");
                                }

                                const notification = new Notification({
                                    type: notificationType,
                                    comment: postId, // Use comment instead of initialResponse
                                    fromUser,
                                    toUser: toUserId,
                                    status: 'clarify-pending-approval',
                                    task: task
                                });

                                notification.save();

                                await User.findByIdAndUpdate(
                                    toUserId._id,
                                    { $push: { notifications: notification._id } },
                                    { new: true, useFindAndModify: false }
                                );

                                res.send(notification);
                            } catch (err) {
                                console.error("Error creating notification: ", err);
                                res.status(400).send(err);
                            }
                            break;
                        // Other notification types (if needed)
                        default:
                            res.status(400).send("Invalid notification type");
                    }
                    break;
                case 'initialResponse':
                    switch (notificationType) {
                        case 'clarify':

                            try {
                                const toUserId = await User.findOne({ username: toUser }).select('_id');

                                if (!toUserId) {
                                    res.status(400).send("No participant found");
                                }

                                const notification = new Notification({
                                    type: notificationType,
                                    initialResponse: postId,
                                    fromUser,
                                    toUser: toUserId,
                                    status: 'clarify-pending-approval',
                                    task: task
                                });

                                notification.save();

                                await User.findByIdAndUpdate(
                                    toUserId._id,
                                    { $push: { notifications: notification._id } },
                                    { new: true, useFindAndModify: false }
                                );

                                res.send(notification);
                            } catch (err) {
                                console.error("Error creating notification: ", err);
                                res.status(400).send(err);
                            }

                            break;
                        case 'upvote':
                            break;
                        case 'downvote':
                            break;
                        case 'comment':
                            break;
                        default:
                            res.status(400).send("Invalid notification type");
                    }
                    break;
                default:
                    return res.status(400).send("Invalid post type");
            }
        } catch (err) {
            console.error("Error creating notification: ", err);
            res.status(422).send(err);
        }

    });

    // Update notificaiton status
    // API: updateNotification
    // Used in: InitialResponse.jsx, ClarificationModal.jsx
    app.post('/api/discussion/notifications/update', requireLogin, async (req, res) => {
        const { notificationId, newStatus } = req.body;
        try {
            const result = await Notification.updateMany(
                { _id: notificationId },
                { $set: { status: newStatus } }
            );
            res.send(result);
        } catch (err) {
            console.error("Error updating notifications:", err);
            res.status(422).send(err);
        }
    });

    // GET notifications related to a task
    // API: fetchTaskNotifications
    // Used in: DiscussionBoard.jsx
    app.get('/api/discussion/notifications/:taskId', requireLogin, async (req, res) => {
        const { taskId } = req.params;
        try {
            const notifications = await Notification.find({ task: taskId })
                .populate('fromUser', 'username')
                .populate('toUser', 'username')
                .populate('initialResponse.responses')
                .populate('comment');

            if (!notifications) {
                return res.status(404).send("No notifications found for this task");
            }

            res.send(notifications);
        } catch (err) {
            console.error("Error fetching notifications:", err);
            res.status(422).send(err);
        }
    });

    // Update a comment, update notification related to comment, create facilitator notification
    // API: updateComment 
    // Used in: Comment.jsx, InitialResponse.jsx
    app.post('/api/discussion/update-comment/:commentId', requireLogin, async (req, res) => {
        const { commentId } = req.params;
        const { commentContent, notificationId, type, task } = req.body;
        let response;
        let fromUser;
        let toUser;
        try {
            // update the response
            if (type === 'initialResponse') {
                const studyResponse = await StudyResponse.findOneAndUpdate(
                    { 'responses._id': commentId },
                    { $set: { 'responses.$.response': commentContent } },
                    { new: true }
                );

                if (!studyResponse) {
                    return res.status(404).send({ error: 'Response not found' });
                } else {
                    response = studyResponse;
                }
            } else if (type === 'comment') {
                const comment = await Comment.findOneAndUpdate(
                    { '_id': commentId },
                    { $set: { 'content': commentContent } },
                    { new: true } // returns the new comment
                )
                if (!comment) {
                    return res.status(404).send({ error: 'Comment not found' });
                } else {
                    response = comment;
                }
            }

            res.send({ response });
        } catch (err) {
            console.error("Error updating comment: ", err);
            res.status(422).send(err);
        }
    });

    //GET a full StudyResponse
    // API: fetchStudyResponse 
    // Used in: ClarificationModal.jsx
    app.get('/api/discussion/studyResponse/:studyResponseId', requireLogin, async (req, res) => {
        const { studyResponseId } = req.params;

        try {
            const studyResponse = await StudyResponse.findOne({ 'responses._id': studyResponseId })
                .populate({
                    path: 'responses',
                    populate: [
                        {
                            path: 'comments',
                            model: 'Comment',
                            populate: { path: 'user', select: 'username avatar firstName lastName role' }
                        },
                        {
                            path: 'votes',
                            populate: { path: 'voter', select: 'username avatar firstName lastName role' }
                        }
                    ]
                })
                .populate({
                    path: '_participant',
                    select: 'username avatar'
                });

            if (!studyResponse) {
                return res.status(404).send("StudyResponse not found");
            }

            const matchingResponse = studyResponse.responses.find(response => response._id.toString() === studyResponseId);
            if (!matchingResponse) {
                return res.status(404).send("Response not found in StudyResponse");
            }

            // Check if the prompt ID contains "childPrompt"
            const promptId = matchingResponse.prompt;
            let prompt;

            if (typeof promptId === 'string' && promptId.includes('childPrompt')) {
                // Extract the parent prompt ID and the child index
                const [parentPromptId, childIndex] = promptId.split('-childPrompt-');
                const parentPrompt = await mongoose.model('StudyPrompt').findById(parentPromptId);

                if (!parentPrompt || !parentPrompt.childPrompts || !parentPrompt.childPrompts[childIndex]) {
                    return res.status(404).send("Child prompt not found");
                }

                // Get the correct child prompt
                prompt = parentPrompt.childPrompts[childIndex];
            } else {
                // Populate the prompt normally if it's not a child prompt
                prompt = await mongoose.model('StudyPrompt').findById(promptId);
                if (!prompt) {
                    return res.status(404).send("Prompt not found");
                }
            }

            const response = {
                matchingResponse: {
                    ...matchingResponse.toObject(),
                    prompt // Include the resolved prompt
                },
                participant: studyResponse._participant,
                study: studyResponse.study,
                task: studyResponse.task,
                dateCreated: studyResponse._dateCreated
            };

            res.send(response);
        } catch (err) {
            console.error("Error fetching study response:", err);
            res.status(422).send(err);
        }
    });

    // Toggle visibility of comment
    // API: hideComment
    // Used in: Comment.jsx
    app.post('/api/discussion/hide-comment/:commentId', requireLogin, async (req, res) => {
        const { commentId } = req.params;
        const { state } = req.body;

        try {
            const comment = await Comment.findOneAndUpdate(
                { '_id': commentId },
                { $set: { 'visible': state } },
                { new: true } // returns the new comment
            )
            res.send({ comment });
        } catch (err) {
            console.error("Error deleteing comment: ", err);
            res.status(422).send(err);
        }
    });


    // Fetch single comment for clarification request on comment
    // API: fetchCommentForClarification
    // Used in: ClarificationModel.jsx
        // Add this new endpoint
    // Fetch single comment for clarification request on comment
    app.get('/api/discussion/comment/:commentId', requireLogin, async (req, res) => {
        const { commentId } = req.params;
        
        try {
            const comment = await Comment.findById(commentId)
                .populate('user', 'username avatar firstName lastName role')
                .populate({
                    path: 'parentComment',
                    populate: { path: 'user', select: 'username avatar firstName lastName role' }
                });
                
            if (!comment) {
                return res.status(404).send("Comment not found");
            }

            // Find child comments (subcomments) for this comment
            const childComments = await SubComment.find({ parentComment: commentId })
                .populate('user', 'username avatar firstName lastName role');
            
            // Create a response object with both the comment and its child comments
            const responseData = {
                ...comment.toObject(),
                childComments: childComments
            };
            
            res.send(responseData);
        } catch (err) {
            console.error("Error fetching comment:", err);
            res.status(422).send(err);
        }
    });

    app.get('/api/discussion/find-discussion/:taskId', requireLogin, async (req, res) => {
        const { taskId } = req.params;

        try {
            const discussion = await Discussion.findOne({ task: taskId });
            if(!discussion) {
                return res.status(404).send("No discussion found for that task");
            }
            res.send(discussion)
        } catch (err) {
            console.error("Error finding discussion from taskId: ", err)
            res.status(422).send(err)
        }
    })

    // GET Complete Task Discussion with all nested subcomments
    // API: fetchCompleteDiscussion
    // Used in: StudyDashboard.jsx for downloading full discussion data
    app.get('/api/discussion/complete/:taskId', requireLogin, async (req, res) => {
        const { taskId } = req.params;
        // Validate taskId parameter
        if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).send("Invalid task ID format");
        }
        
        try {
            // First get the base discussion with basic population
            const discussion = await Discussion.findOne({ task: taskId })
                .populate({ path: 'prompts', model: 'StudyPrompt' })
                .populate({ path: 'study' })
                .populate({
                    path: 'initialResponses',
                    populate: [
                        {
                            path: '_participant',
                            select: 'username avatar firstName lastName'
                        },
                        {
                            path: 'responses.votes',
                            populate: { path: 'voter', select: 'username avatar' }
                        }
                    ]
                });
    
            if (!discussion) {
                return res.status(404).send("No discussion found for this task");
            }
    
            // Get all top-level comments from all responses
            const commentIds = [];
            discussion.initialResponses.forEach(initialResponse => {
                initialResponse.responses.forEach(response => {
                    if (response.comments && response.comments.length > 0) {
                        commentIds.push(...response.comments.map(comment => 
                            comment._id ? comment._id : comment // Handle both populated and unpopulated comments
                        ));
                    }
                });
            });
    
            // If there are no comments, return the discussion as is
            if (commentIds.length === 0) {
                return res.send(discussion);
            }
    
            // Fetch all top-level comments with basic user data
            const populatedComments = await InitialResponseComment.find({
                _id: { $in: commentIds }
            }).populate('user', 'username avatar firstName lastName role')
              .populate('votes.voter', 'username avatar');
    
            // Create a map of comments by ID for easy lookup
            const commentMap = {};
            populatedComments.forEach(comment => {
                commentMap[comment._id.toString()] = {
                    ...comment.toObject(),
                    comments: [] // Placeholder for subcomments
                };
            });
    
            // Recursive function to get all subcomments at any depth
            async function getAllSubcomments(parentIds) {
                if (!parentIds || parentIds.length === 0) return {};
    
                // Convert all parentIds to strings to ensure proper comparison
                const parentIdStrings = parentIds.map(id => id.toString());
    
                // Get direct subcomments for these parent IDs
                const subcomments = await SubComment.find({
                    parentComment: { $in: parentIds }
                }).populate('user', 'username avatar firstName lastName role')
                  .populate('votes.voter', 'username avatar');
    
                // If no subcomments found, end recursion
                if (subcomments.length === 0) return {};
    
                // Create a map of subcomments organized by parent ID
                const subcommentsMap = {};
                const nextLevelParentIds = [];
    
                subcomments.forEach(subcomment => {
                    const parentId = subcomment.parentComment.toString();
                    if (!subcommentsMap[parentId]) {
                        subcommentsMap[parentId] = [];
                    }
                    
                    // Add this subcomment to its parent's array
                    const subcommentObj = {
                        ...subcomment.toObject(),
                        comments: [] // Placeholder for its own subcomments
                    };
                    subcommentsMap[parentId].push(subcommentObj);
                    
                    // Track this subcomment's ID for the next recursive call
                    nextLevelParentIds.push(subcomment._id);
                });
                
                // Recursively get the next level of subcomments if any
                if (nextLevelParentIds.length > 0) {
                    const nextLevelSubcomments = await getAllSubcomments(nextLevelParentIds);
                    
                    // Attach next-level subcomments to their parents
                    Object.keys(nextLevelSubcomments).forEach(parentId => {
                        // Find the parent subcomment in our current level
                        for (const currentParentId in subcommentsMap) {
                            subcommentsMap[currentParentId].forEach(subcomment => {
                                if (subcomment._id.toString() === parentId) {
                                    subcomment.comments = nextLevelSubcomments[parentId];
                                }
                            });
                        }
                    });
                }
                
                return subcommentsMap;
            }
    
            // Execute the recursive function starting with top-level comments
            const allSubcomments = await getAllSubcomments(commentIds);
            
            // Attach subcomments to their parent comments
            Object.keys(allSubcomments).forEach(parentId => {
                if (commentMap[parentId]) {
                    commentMap[parentId].comments = allSubcomments[parentId];
                }
            });
            
            // Replace comment IDs with the populated comment objects in the response
            discussion.initialResponses.forEach(initialResponse => {
                initialResponse.responses.forEach(response => {
                    if (response.comments && response.comments.length > 0) {
                        const populatedResponseComments = response.comments.map(commentId => {
                            const commentIdStr = commentId.toString ? commentId.toString() : commentId;
                            return commentMap[commentIdStr] || commentId;
                        });
                        response.comments = populatedResponseComments;
                    }
                });
            });
    
            res.send(discussion);
        } catch (err) {
            console.error("Error fetching complete discussion:", err);
            res.status(422).send({ error: err.message || "Error fetching discussion data" });
        }
    });
};