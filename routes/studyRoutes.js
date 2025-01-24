const mongoose = require('mongoose');
const Study = mongoose.model('Study');
const StudyResponse = mongoose.model('StudyResponse');
const StudyPrompt = mongoose.model('StudyPrompt');
const StudyTask = mongoose.model('StudyTask');
const Discussion = mongoose.model('Discussion');
const Comment = mongoose.model('Comment');

const requireLogin = require('../middlewares/requireLogin');
const requireFacilitatorPermissions = require('../middlewares/requireFacilitatorPermissions');


module.exports = (app) => {
    // Create a new study

    app.post('/api/study/new', requireLogin, requireFacilitatorPermissions, async (req, res) => {
        console.log("POST New Study: ", req.body);
        const { name, description, participants, tasks } = req.body;

        const existingStudy = await Study.findOne({ name });
        if (existingStudy) {
            return res.status(409).send("Study with that name already exists, please select a different study name.");
        }

        const study = new Study({
            name,
            description,
            participants,
            _createdBy: req.user.id,
            _facilitator: req.user.id, // Future implementation -- allow sudo's to assign studies to facilitators
            _dateCreated: Date.now(),
        });

        try {
            await study.save();

            // Create StudyTask and StudyPrompt documents
            const studyTasks = await Promise.all(tasks.map(async task => {
                const studyPrompts = await Promise.all(task.prompts.map(async prompt => {
                    const studyPrompt = new StudyPrompt({
                        study: study._id,
                        prompt: prompt
                    });
                    await studyPrompt.save();
                    return studyPrompt._id;
                }));

                const studyTask = new StudyTask({
                    name: task.name,
                    instructions: task.description,
                    prompts: studyPrompts,
                    study: study._id,
                    _createdBy: req.user.id,
                    _dateCreated: Date.now()
                });

                await studyTask.save();


                const discussion = new Discussion({
                    study: study._id,
                    task: studyTask._id,
                    prompts: task.prompts,
                    initialResponses: []
                });

                await discussion.save();
                return studyTask._id;
            }));

            // Update the Study document with the saved StudyTask IDs
            study.tasks = studyTasks;
            await study.save();

            res.send({ study });
        } catch (err) {
            console.error("Error creating study:", err);
            res.status(422).send({ error: "Failed to create study", details: err.message });
        }
    });

    // Create a new Initial Response to the study
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

    // Get all studies that are associated with the current user
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

    //Get a study by a studyId
    app.get('/api/study/:studyId', requireLogin, async (req, res) => {
        const { studyId } = req.params;
        const userId = req.user._id;
        let study = {};

        switch(req.user.role) {
            case 'participant':
                study = await Study.findById(studyId)
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
                break;
            default:
                study = await Study.findById(studyId)
                .populate('prompts', 'prompt')
                .populate({
                    path: 'responses',
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
                break;
        }
        try {
            if (!study) {
                return res.status(404).send("Study not found");
            }
            res.send(study);
        } catch (err) {
            res.status(422).send(err);
        }
    });

    //Get all comments for a specific study
    app.get('/api/study/:studyId/comments', requireLogin, async (req, res) => {
        const { studyId } = req.params;
        try {
            const comments = await Comment.find({ studyId: studyId });
            console.log(comments);
            res.send(comments);
        } catch (err) {
            console.error("Error fetching comments for study:", JSON.stringify(err));

            res.status(500).send(err)
        }
    });
};
