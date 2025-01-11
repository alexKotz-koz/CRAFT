const mongoose = require('mongoose');
const StudyResponse = mongoose.model('StudyResponse');
const User = mongoose.model('users');
const requireLogin = require('../middlewares/requireLogin');

module.exports = (app) => {
    app.get('/api/discussion/:studyId', requireLogin, async (req, res) => {
        const { studyId } = req.params;
        console.log("Discussion Study Id: ", studyId);
        try {
            const responses = await StudyResponse.find({ study: studyId });
            if (!responses) {
                return res.status(404).send("No responses found for this study");
            }

            // Fetch usernames based on participant IDs
            const participantIds = responses.map(response => response.participant);
            const users = await User.find({ _id: { $in: participantIds } }, 'username');
            console.log(users)
            const userMap = users.reduce((acc, user) => {
                acc[user._id] = user.username;
                return acc;
            }, {});
            console.log(userMap)

            // Replace participant IDs with usernames in responses
            const updatedResponses = responses.map(response => ({
                ...response.toObject(),
                participant: userMap[response.participant]
            }));

            res.send(updatedResponses);
        } catch (err) {
            res.status(422).send(err);
        }
    });
};