const mongoose = require('mongoose');
const Discussion = mongoose.model('Discussion');
const StudyResponse = mongoose.model('StudyResponse');
const requireLogin = require('../middlewares/requireLogin');

module.exports = (app) => {
    app.get('/api/discussion/:studyId', requireLogin, async (req, res) => {
        const { studyId } = req.params;
        try {
            const discussion = await Discussion.findOne({ study: studyId })
                .populate('comments.user', 'username')
                .populate('prompts', 'prompt')
                .populate({
                    path: 'initialResponses',
                    populate: {
                        path: 'participant',
                        select: 'username'
                    }
                });
            console.log("Discussion Returned from query: ", discussion);
            if (!discussion) {
                return res.status(404).send("No discussion found for this study");
            }

            res.send(discussion);
        } catch (err) {
            console.log("Error: ", err)
            res.status(422).send(err);
        }
    });

    app.post('/api/discussion/:studyId/:promptId/:responseId', requireLogin, async (req, res) => {
        const { studyId, promptId, responseId } = req.params;
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

            if (!updatedResponse) {
                return res.status(404).send("Response not found");
            }

            res.send(updatedResponse);
        } catch (err) {
            console.log("Error: ", err);
            res.status(422).send(err);
        }
    });
};