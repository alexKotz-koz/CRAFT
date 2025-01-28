const mongoose = require('mongoose');
const Discussion = mongoose.model('Discussion');
const StudyResponse = mongoose.model('StudyResponse');
const { Comment, InitialResponseComment, SubComment } = require('../models/Comment');
const requireLogin = require('../middlewares/requireLogin');

module.exports = (app) => {
    // GET Discussion
    app.get('/api/discussion/:taskId', requireLogin, async (req, res) => {
        const { taskId } = req.params;
        try {
            const discussion = await Discussion.findOne({ task: taskId })
                .populate('prompts', 'prompt')
                .populate({
                    path: 'initialResponses',
                    populate: [
                        {
                            path: '_participant',
                            select: 'username'
                        },
                        {
                            path: 'responses.comments', 
                            populate: [
                                { path: 'user', select: 'username' }, 
                                { path: 'comments', populate: { path: 'user', select: 'username' }},
                                { path: 'votes', populate: { path: 'voter', select: 'username'}} 
                            ]
                        },
                        {
                            path: 'responses.votes', 
                            populate: { path: 'voter', select: 'username' } 
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
    app.post('/api/discussion/:promptId/:responseId/vote', requireLogin, async (req, res) => {
        const { promptId, responseId } = req.params;
        const { voteType } = req.body; 
        const userId = req.user._id; 

        try {
            const studyResponse = await StudyResponse.findById(responseId);
            if (!studyResponse) {
                return res.status(404).send("Response not found");
            }

            const response = studyResponse.responses.find(r => r.prompt.toString() === promptId);
            if (!response) {
                return res.status(404).send("Response not found");
            }

            const userVote = response.votes.find(vote => vote.voter.toString() === userId.toString());
            //console.log("USer vote: ", userVote

            // ToDo: Refactor to switch statement
            if (userVote){
                if (voteType === 'upvote'){
                    if (userVote.vote === 1){
                        //console.log("User is attempting to revert an upvote");
                        userVote.vote = 0;
                    } else if (userVote.vote === -1){
                        //console.log("User is attempting to switch an upvote for a downvote");
                        userVote.vote = 1;
                    } else if (userVote.vote === 0 ){
                        //console.log("User is attempting to switch a nuetral vote (from previous action) to an upvote");
                        userVote.vote = 1;
                    } else {
                        return res.status(400).send("Invalid vote operation");
                    }
                } else if (voteType === 'downvote') {
                    if (userVote.vote === -1){
                        //console.log("User is attempting to revert a downvote");
                        userVote.vote = 0;
                    } else if (userVote.vote === 1) {
                        //console.log("user is attempting to switch an upvote for a downvote");
                        userVote.vote = -1;
                    } else if (userVote.vote === 0){
                        //console.log("User is attempting to switch a nuetral vote (from previous action) to a downvote");
                        userVote.vote = -1;
                    }
                    else {
                        return res.status(400).send("Invalid vote operation");
                    }
                } else {
                    return res.status(400).send("Invalid vote type");
                } 
            } else {
                //console.log("no user vote exists")
                if (voteType === 'upvote'){
                    //console.log("User is trying to submit an initial upvote")
                    response.votes.push({ voter: userId, vote: 1});
                } else if (voteType === 'downvote'){
                    //console.log("user is trying to submit an initial downvote")
                    response.votes.push({ voter: userId, vote: -1});
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
    app.post('/api/discussion/:promptId/:responseId/comment', requireLogin, async (req, res) => {
        const { promptId, responseId } = req.params;
        const { content, studyId } = req.body;
        const userId = req.user._id;

        try {
            const studyResponse = await StudyResponse.findById(responseId);
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

            if (userVote){
                if (voteType === 'upvote'){
                    if (userVote.vote === 1){
                        userVote.vote = 0;
                    } else if (userVote.vote === -1){
                        userVote.vote = 1;
                    } else if (userVote.vote === 0 ){
                        userVote.vote = 1;
                    } else {
                        return res.status(400).send("Invalid vote operation");
                    }
                } else if (voteType === 'downvote') {
                    if (userVote.vote === -1){
                        userVote.vote = 0;
                    } else if (userVote.vote === 1) {
                        userVote.vote = -1;
                    } else if (userVote.vote === 0){
                        userVote.vote = -1;
                    }
                    else {
                        return res.status(400).send("Invalid vote operation");
                    }
                } else {
                    return res.status(400).send("Invalid vote type");
                } 
            } else {
                if (voteType === 'upvote'){
                    comment.votes.push({ voter: userId, vote: 1});
                } else if (voteType === 'downvote'){
                    comment.votes.push({ voter: userId, vote: -1});
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
            await newComment.populate('user', 'username');

            res.send(newComment);


        } catch (err) {
            console.error("Error posting subcomment: ", err);
            res.status(422).send(err);
        }
    });

    // GET all subcomments for a specific user
    app.get('/api/discussion/:commentId/subcomment', requireLogin, async (req, res) => {
        const { commentId } = req.params;
        try {
            const subcomments = await SubComment.find({ parentComment: commentId }).populate('user', 'username');
            res.send(subcomments);
        } catch (err) {
            console.error("Error fetching subcomments:", err);
            res.status(422).send(err);
        }
    });
};