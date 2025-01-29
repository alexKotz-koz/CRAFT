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
    // API: useCreateStudyMutation
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
                    instructions: task.instructions,
                    prompts: studyPrompts,
                    participants,
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
    // API: useCreateStudyResponseMutation
    app.post('/api/study/response', requireLogin, async (req, res) => {

        const { studyId, taskId, responses, participant, dateCreated } = req.body;

        const studyResponse = new StudyResponse({
            study: studyId,
            task: taskId,
            responses,
            _participant: participant,
            _dateCreated: dateCreated
        });

        try {
            await studyResponse.save();

            // Update the Study document to add the response
            await Study.findByIdAndUpdate(studyId, { $push: { responses: studyResponse._id } });

            await StudyTask.findOneAndUpdate(
                { _id: taskId, 'participants.email': req.user.email },
                { $set: { 'participants.$.responded': true } }
            );

            // Check if all tasks have been completed by the participant
            const tasks = await StudyTask.find({ study: studyId });
            const allTasksCompleted = tasks.every(task =>
                task.participants.some(participant =>
                    participant.email === req.user.email && participant.responded === true
                )
            );

            if (allTasksCompleted) {
                // Update the StudyParticipant.responded value to true
                await Study.findOneAndUpdate(
                    { _id: studyId, 'participants.email': req.user.email },
                    { $set: { 'participants.$.responded': true } }
                );
            }

            // Update the Discussion.initialResponses array with the new response
            await Discussion.findOneAndUpdate(
                { task: taskId },
                { $push: { initialResponses: studyResponse._id } }
            );
            res.send(studyResponse);
        } catch (err) {
            console.error("Error creating initial study response:", err);
            res.status(422).send(err);
        }
    });

    // Get all studies that are associated with the current user
    // API: useFetchStudiesQuery
    app.get('/api/study/my_studies', requireLogin, async (req, res) => {
        let studies;
        switch (req.user.role) {
            case 'facilitator':
            case 'admin':
                studies = await Study.find({ _createdBy: req.user.id });
                console.log(studies)
                break;
            case 'participant':
                studies = await Study.find({ 'participants.email': req.user.email });
                break;
            default:
                return res.status(400).send("Invalid user role");
        }

        res.send(studies)

    });

    // Get a study by a studyId
    // API: useFetchStudyQuery
    app.get('/api/study/:studyId', requireLogin, async (req, res) => {
        const { studyId } = req.params;
        const userId = req.user._id;
        let study = {};

        try {
            switch (req.user.role) {

                case 'participant':
                    console.log("User is a participant")
                    study = await Study.findById(studyId)
                        .populate({
                            path: 'tasks',
                            populate: {
                                path: 'prompts',
                                model: 'StudyPrompt'
                            }
                        });
                    break;
                default:
                    study = await Study.findById(studyId)
                        .populate({
                            path: 'tasks',
                            populate: [
                                {
                                    path: 'prompts',
                                    model: 'StudyPrompt'
                                },
                                {
                                    path: 'responses',
                                    model: 'StudyResponse',
                                    populate: {
                                        path: 'comments',
                                        model: 'Comment',
                                        populate: {
                                            path: 'user',
                                            select: 'username'
                                        }
                                    }
                                }
                            ]
                        });
                    break;
            }

            if (!study) {
                return res.status(404).send("Study not found");
            }

            res.send(study);
        } catch (err) {
            console.error("Error fetching study:", err);
            res.status(422).send({ error: "Failed to fetch study", details: err.message });
        }
    });
    //Get all comments for a specific study
    // API: useFetchStudyCommentsQuery
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

    app.get('/api/study/task/:taskId', requireLogin, async (req, res) => {
        const { taskId } = req.params;

        try {
            const task = await StudyTask.findById(taskId)
                .populate([
                    { path: 'participants', model: 'StudyParticipants' },
                    { path: 'prompts', model: 'StudyPrompt' },
                ]);

            if (!task) {
                res.status(400).send("No Task Found")
            }

            res.send(task);

        } catch (err) {
            console.error("Error fetching task:", JSON.stringify(err));

            res.status(500).send(err)
        }

    });

    app.get('/api/study/tasks/:studyId', requireLogin, async (req, res) => {
        const { studyId } = req.params;
        console.log("route studyID: ", studyId);
        try {
            const tasks = await StudyTask.find({ study: studyId})
                .populate([
                    { path: 'participants', model: 'StudyParticipants'},
                    { path: 'prompts', model: 'StudyPrompt'}
                ]);
            console.log("tasks found: ", tasks)
            if (!tasks){
                res.status(400).send("No Study Tasks Found");
            }
            res.send(tasks);


        } catch (err) {
            console.error("Error fetching tasks: ", JSON.stringify(err));
            res.status(500).send(err);
        }
    })
};
