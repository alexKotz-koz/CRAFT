const mongoose = require('mongoose');
const Discussion = mongoose.model('Discussion');
const StudyResponse = mongoose.model('StudyResponse');
const { Comment, InitialResponseComment, SubComment } = require('../models/Comment');
const requireLogin = require('../middlewares/requireLogin');

module.exports = (app) => {
    // GET Discussion
    app.get('/api/discussion/:studyId', requireLogin, async (req, res) => {
        const { studyId } = req.params;
        try {
            const discussion = await Discussion.findOne({ study: studyId })
                .populate('prompts', 'prompt') // Populate prompts with their "prompt" field
                .populate({
                    path: 'initialResponses',
                    populate: [
                        {
                            path: 'participant', // Populate participant in initialResponses
                            select: 'username'
                        },
                        {
                            path: 'responses.comments', // Populate comments in responses
                            populate: [
                                { path: 'user', select: 'username' }, // Populate user in comments
                                { path: 'comments', populate: { path: 'user', select: 'username' }} // Populate nested comments
                            ]
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
    app.post('/api/discussion/:promptId/:responseId/vote', requireLogin, async (req, res) => {
        const { promptId, responseId } = req.params;
        const { voteType } = req.body; // Expecting { voteType: 'upvote' } or { voteType: 'downvote' }
        const userId = req.user._id; // Assuming req.user contains the authenticated user's info

        try {
            const studyResponse = await StudyResponse.findById(responseId);
            if (!studyResponse) {
                return res.status(404).send("Response not found");
            }

            // Find the specific response within the responses array
            const response = studyResponse.responses.find(r => r.prompt.toString() === promptId);
            if (!response) {
                return res.status(404).send("Response not found");
            }

            // Check if the user has already voted for this specific response
            if (response.voters.includes(userId)) {
                return res.status(400).send("You have already voted for this response");
            }

            const update = voteType === 'upvote'
                ? { $inc: { 'responses.$.upvotes': 1 }, $push: { 'responses.$.voters': userId } }
                : { $inc: { 'responses.$.downvotes': 1 }, $push: { 'responses.$.voters': userId } };

            const updatedResponse = await StudyResponse.findOneAndUpdate(
                { _id: responseId, 'responses.prompt': promptId },
                update,
                { new: true }
            );

            res.send(updatedResponse);
        } catch (err) {
            res.status(422).send(err);
        }
    });

    // Comment on Initial Response
    app.post('/api/discussion/:promptId/:responseId/comment', requireLogin, async (req, res) => {
        const { promptId, responseId } = req.params;
        const { content } = req.body;
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
                response: response._id
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
    app.post('/api/discussion/:commentId/vote', requireLogin, async (req, res) => {
        const { commentId } = req.params;
        const { voteType } = req.body;
        const userId = req.user._id;

        try {
            const comment = await Comment.findById(commentId);
            if (!comment) {
                return res.status(404).send("Comment not found");
            }
            if (comment.voters.includes(userId)) {
                return res.status(400).send("You have already voted for this comment");
            }
            const update = voteType === 'upvote'
                ? { $inc: { upvotes: 1 }, $push: { voters: userId } }
                : { $inc: { downvotes: 1 }, $push: { voters: userId } };


            const updatedComment = await Comment.findOneAndUpdate(
                { _id: commentId },
                update,
                { new: true }
            );

            res.send(updatedComment);
        } catch (err) {
            console.error("Error updating comment:", err);
            res.status(422).send(err);
        }
    });

    // Comment on Comment
    app.post('/api/discussion/:commentId/subcomment', requireLogin, async (req, res) => {
        const { commentId } = req.params;
        const { content } = req.body;
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
                parentComment: commentId
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