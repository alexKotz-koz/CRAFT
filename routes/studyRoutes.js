const mongoose = require('mongoose');
const Study = mongoose.model('Study');
const StudyResponse = mongoose.model('StudyResponse');
const StudyPrompt = mongoose.model('StudyPrompt');
const { StudyTask, StudyTaskAppReview, StudyTaskSurvey } = require('../models/StudyTask');
const Discussion = mongoose.model('Discussion');
const Comment = mongoose.model('Comment');

const requireLogin = require('../middlewares/requireLogin');
const requireFacilitatorPermissions = require('../middlewares/requireFacilitatorPermissions');
const { createStudyDirectory, saveMediaFiles, createStudyPrompts, extractStudyPromptsRaw, createStudyTask, fetchStudyPrompts } = require('./studyNewUtils');
const { forEach } = require('lodash');

/* TODO:

Current implementation of StudyTask includes two discriminators. All routes currently hit StudyTaskSurvey. Will need to update these when another use case is added (e.g. StudyTaskAppReview)

*/


module.exports = (app) => {
    // Create a new study
    // API: useCreateStudyMutation
    // Used in: StudyNewWizard.jsx
    app.post('/api/study/new', requireLogin, requireFacilitatorPermissions, async (req, res) => {

        const { name, description, preface, type, participants, tasks } = req.body;

        const existingStudy = await Study.findOne({ name });
        if (existingStudy) {
            return res.status(409).send("Study with that name already exists, please select a different study name.");
        }

        const study = new Study({
            name,
            description,
            preface,
            type,
            participants,
            _createdBy: req.user.id,
            _facilitator: req.user.id,
            _dateCreated: Date.now(),
        });

        try {
            await study.save();

            if (type === 'survey') {
                const studyPrompts = await createStudyPrompts(tasks, study._id, req.user.id);
                const studyTask = new StudyTaskSurvey({
                    study: study._id,
                    participants,
                    prompts: studyPrompts,
                    instructions: tasks[0].instructions,
                    _createdBy: req.user.id,
                    _dateCreated: Date.now()
                });

                await studyTask.save();

                const studyPromptsForDiscussion = await fetchStudyPrompts(studyPrompts);
                const studyPromptsRaw = extractStudyPromptsRaw(studyPromptsForDiscussion);
                const discussion = new Discussion({
                    study: study._id,
                    task: studyTask._id,
                    prompts: studyPromptsRaw,
                    initialResponses: []
                });

                await discussion.save();
                study.tasks = studyTask._id;
                await study.save();
            } else if (type === 'app-review') {
                for (const task of tasks) {
                    // Create study prompts for the current task
                    const studyPrompts = await createStudyPrompts(task.questions, study._id, req.user.id);

                    // Create a new StudyTaskAppReview for the current task
                    const studyTask = new StudyTaskAppReview({
                        study: study._id,
                        participants,
                        prompts: studyPrompts,
                        instructions: task.instructions,
                        name: task.name, // Include the task name
                        _createdBy: req.user.id,
                        _dateCreated: Date.now()
                    });

                    await studyTask.save();

                    // Fetch prompts for discussion
                    const studyPromptsForDiscussion = await fetchStudyPrompts(studyPrompts);
                    const studyPromptsRaw = extractStudyPromptsRaw(studyPromptsForDiscussion);

                    // Create a discussion for the current task
                    const discussion = new Discussion({
                        study: study._id,
                        task: studyTask._id,
                        prompts: studyPromptsRaw,
                        initialResponses: []
                    });

                    await discussion.save();

                    // Add the task to the study's tasks array
                    if (!study.tasks) {
                        study.tasks = [];
                    }
                    study.tasks.push(studyTask._id);
                }

                // Save the study with the updated tasks array
                await study.save();
            }

            res.send({ study });
        } catch (err) {
            console.error("Error creating study:", err);
            res.status(422).send({ error: "Failed to create study", details: err.message });
        }
    });

    // Create a new Initial Response to the study
    // API: useCreateStudyResponseMutation
    // Used in: StudyResponse.jsx
    // *** Note: Uses users email to find and update records
    app.post('/api/study/response', requireLogin, async (req, res) => {

        const { studyId, taskId, taskType, responses, participant, dateCreated } = req.body;

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

            if (taskType === 'survey') {
                await StudyTaskSurvey.findOneAndUpdate(
                    { _id: taskId, 'participants.email': req.user.email },
                    { $set: { 'participants.$.responded': true } }
                );

                // Check if all tasks have been completed by the participant
                const tasks = await StudyTaskSurvey.find({ study: studyId });
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

            } else if (taskType === 'app-review'){

                await StudyTaskAppReview.findOneAndUpdate(
                    {_id: taskId, 'participants.email': req.user.email},
                    { $set: { 'participants.$.responded': true } }
                );

                const tasks = await StudyTaskAppReview.find({ study: studyId });
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
            }


        } catch (err) {
            console.error("Error creating initial study response:", err);
            res.status(422).send(err);
        }
    });

    // Get all studies that are associated with the current user
    // API: useFetchStudiesQuery
    // Used in: Home.jsx
    app.get('/api/study/my_studies', requireLogin, async (req, res) => {
        let studies;
        switch (req.user.role) {
            case 'facilitator':
            case 'admin':
                studies = await Study.find({ _createdBy: req.user.id });
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
    // Used in: StudyDashboard.jsx, StudyResponse.jsx, StudyResponseWizard.jsx, Study.jsx
    app.get('/api/study/:studyId', requireLogin, async (req, res) => {
        const { studyId } = req.params;
        const userId = req.user._id;
        let study = {};

        try {
            switch (req.user.role) {

                case 'participant':
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
                                /*{
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
                                }*/
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
    // Used in: StudyDashboard.jsx
    app.get('/api/study/:studyId/comments', requireLogin, async (req, res) => {
        const { studyId } = req.params;
        try {
            const comments = await Comment.find({ studyId: studyId });
            res.send(comments);
        } catch (err) {
            console.error("Error fetching comments for study:", JSON.stringify(err));

            res.status(500).send(err)
        }
    });

    //API: fetchTask
    //Used in: DiscussionBoard.jsx, StudyResponse.jsx
    app.get('/api/study/task/:taskId', requireLogin, async (req, res) => {
        const { taskId } = req.params;
        try {
            let task;
            task = await StudyTask.findById(taskId)
                .populate({ path: 'prompts', model: 'StudyPrompt' });
            if (!task) {
                task = await StudyTaskSurvey.findById(taskId)
                    .populate({ path: 'prompts', model: 'StudyPrompt' });
                if (!task) {
                    task = await StudyTaskAppReview.findById(taskId)
                        .populate({ path: 'prompts', model: 'StudyPrompt' });
                    if (!task) {
                        return res.status(404).send("No Task Found");
                    }
                }
            }
            res.send(task);

        } catch (err) {
            console.error("Error fetching task:", JSON.stringify(err));

            res.status(500).send(err)
        }

    });

    // API: fetchStudyTasks
    // Used in: DiscussionBoardLanding.jsx
    app.get('/api/study/tasks/:studyId', requireLogin, async (req, res) => {
        const { studyId } = req.params;
        try {
            const tasks = await StudyTaskSurvey.find({ study: studyId })
                .populate([
                    { path: 'study', model: "Study" },
                    { path: 'participants', model: 'StudyParticipants' },
                    { path: 'prompts', model: 'StudyPrompt' }
                ]);

            if (!tasks) {
                res.status(400).send("No Study Tasks Found");
            }
            res.send(tasks);


        } catch (err) {
            console.error("Error fetching tasks: ", JSON.stringify(err));
            res.status(500).send(err);
        }
    })
};
