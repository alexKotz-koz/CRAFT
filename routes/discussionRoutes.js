const mongoose = require('mongoose');
const Discussion = mongoose.model('Discussion');
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
};