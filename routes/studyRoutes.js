const mongoose = require('mongoose');
const Study = mongoose.model('Study');
const StudyResponse = mongoose.model('StudyResponse');
const StudyPrompt = mongoose.model('StudyPrompt');
const Discussion = mongoose.model('Discussion');

const requireLogin = require('../middlewares/requireLogin');


module.exports = (app) => {
    app.post('/api/study/new', requireLogin, async (req, res) => {
        const { name, instructions, description, participants, prompts } = req.body;
    
        const existingStudy = await Study.findOne({ name });
        if (existingStudy) {
            return res.status(409).send("Study with that name already exists, please select a different study name.");
        }
    
        const study = new Study({
            name,
            instructions,
            description,
            participants,
            _user: req.user.id,
            dateCreated: Date.now(),
            dateModified: Date.now(),
        });
    
        try {
            await study.save();
    
            // Create StudyPrompt documents with the studyId
            const studyPrompts = await Promise.all(prompts.map(async prompt => {
                const studyPrompt = new StudyPrompt({
                    study: study._id,
                    prompt: prompt.prompt
                });
                await studyPrompt.save();
                return studyPrompt._id;
            }));
    
            // Update the Study document with the saved StudyPrompt IDs
            study.prompts = studyPrompts;
            await study.save();
    
            // Create a new Discussion for the newly created Study
            const discussion = new Discussion({
                study: study._id,
                prompts: studyPrompts,
                initialResponses: [],
                comments: []
            });
    
            await discussion.save();
    
            res.send({ study, discussion });
        } catch (err) {
            res.status(422).send(err);
        }
    });

    app.post('/api/study/response', requireLogin, async (req, res) => {

        const { studyId, responses, participant, dateCreated } = req.body;

        const studyResponse = new StudyResponse({
            study: studyId,
            responses,
            participant,
            dateCreated
        });

        try {
            await studyResponse.save();

            // Update the Study document to add the response
            await Study.findByIdAndUpdate(studyId, { $push: { responses: studyResponse._id } });

            // Update the StudyParticipant.responded value to true
            await Study.findOneAndUpdate(
                { _id: studyId, 'participants.email': req.user.email },
                { $set: { 'participants.$.responded': true } }
            );

            // Update the Discussion.initialResponses array with the new response
            await Discussion.findOneAndUpdate(
                { study: studyId },
                { $push: { initialResponses: studyResponse._id } }
            );
            res.send(studyResponse);
        } catch (err) {
            res.status(422).send(err);
        }
    });

    app.get('/api/study/my_studies', requireLogin, async (req, res) => {
        let studies;
        switch (req.user.role) {
            case 'facilitator':
            case 'admin':
                studies = await Study.find({ _user: req.user.id });
                break;
            case 'participant':
                studies = await Study.find({ 'participants.email': req.user.email });
                break;
            default:
                return res.status(400).send("Invalid user role");
        }

        res.send(studies)

    });
    app.get('/api/study/:studyId', requireLogin, async (req, res) => {
        const { studyId } = req.params;
        const userId = req.user._id;

        try {
            const study = await Study.findById(studyId)
                .populate('prompts', 'prompt')
                .populate({
                    path: 'responses',
                    match: { participant: userId }, // Filter responses by logged-in user
                    populate: [
                        {
                            path: 'responses',
                            select: 'response'
                        },
                        {
                            path: 'responses.comments', // Populate comments in responses
                            populate: [
                                { path: 'user', select: 'username' }, // Populate user in comments
                            ]
                        }
                    ]
                });

            if (!study) {
                return res.status(404).send("Study not found");
            }

            res.send(study);
        } catch (err) {
            res.status(422).send(err);
        }
    });
};
