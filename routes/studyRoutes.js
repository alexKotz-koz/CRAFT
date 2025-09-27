const mongoose = require('mongoose');
const Study = mongoose.model('Study');
const StudyResponse = mongoose.model('StudyResponse');
const StudyPrompt = mongoose.model('StudyPrompt');
const { StudyTask, StudyTaskAppReview, StudyTaskSurvey } = require('../models/StudyTask');
const Discussion = mongoose.model('Discussion');
const Comment = mongoose.model('Comment');
const User = mongoose.model('User');
const Consent = mongoose.model('Consent');
const LLMResponseEvaluation = mongoose.model('LLMResponseEvaluation');
const LLMResponseEvaluationResponse = mongoose.model('LLMResponseEvaluationResponse');

const requireLogin = require('../middlewares/requireLogin');
const requireFacilitatorPermissions = require('../middlewares/requireFacilitatorPermissions');
const { createStudyDirectory, saveMediaFiles, createStudyPrompts, extractStudyPromptsRaw, createStudyTask, fetchStudyPrompts } = require('./studyNewUtils');

/* TODO:

Current implementation of StudyTask includes two discriminators. All routes currently hit StudyTaskSurvey. Will need to update these when another use case is added (e.g. StudyTaskAppReview)

*/


module.exports = (app) => {
    // Gets all studies in the database
    app.get('/api/study/fetch-all', requireLogin, async (req, res) => {
        try {
            const allStudies = await Study.find({})
                .populate({
                    path: 'tasks',
                    model: 'StudyTask'
                });
            res.send(allStudies);
        } catch (error) {
            console.error("error fetching all studies: ", error);
            res.status(500).send(error);
        }
    });
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
                    const assignedParticipants = task.assignedParticipants;

                    // Create a new StudyTaskAppReview for the current task
                    const studyTask = new StudyTaskAppReview({
                        study: study._id,
                        participants: assignedParticipants,
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
        } catch (error) {
            console.error("error creating study:", error);
            res.status(422).send({ error: "Failed to create study", details: error.message });
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

            } else if (taskType === 'app-review') {

                await StudyTaskAppReview.findOneAndUpdate(
                    { _id: taskId, 'participants.email': req.user.email },
                    { $set: { 'participants.$.responded': true } }
                );

                const tasks = await StudyTaskAppReview.find({ study: studyId });
                const allTasksCompleted = tasks
                    .filter(task =>
                        task.participants.some(participant => participant.email === req.user.email) // Check if user is a participant
                    )
                    .every(task =>
                        task.participants.some(participant =>
                            participant.email === req.user.email && participant.responded === true // Check if responded is true
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


        } catch (error) {
            console.error("error creating initial study response:", error);
            res.status(422).send(error);
        }
    });

    // Get all studies that are associated with the current user
    // API: useFetchStudiesQuery
    // Used in: Home.jsx
    // *** Note: Uses users email to find participants studies
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
        } catch (error) {
            console.error("error fetching study:", error);
            res.status(422).send({ error: "Failed to fetch study", details: error.message });
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
        } catch (error) {
            console.error("error fetching comments for study:", JSON.stringify(error));

            res.status(500).send(error)
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

        } catch (error) {
            console.error("error fetching task:", JSON.stringify(error));

            res.status(500).send(error)
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


        } catch (error) {
            console.error("error fetching tasks: ", JSON.stringify(error));
            res.status(500).send(error);
        }
    });

    // API: fetchAllStudyResponses
    // Used in: StudyDashboard.jsx
    app.get('/api/study/download-responses/:studyId', requireLogin, requireFacilitatorPermissions, async (req, res) => {
        const { studyId } = req.params;
        try {
            const studyResponses = await StudyResponse.find({ study: studyId })
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
                        },
                        {
                            path: 'prompt',
                            model: 'StudyPrompt'
                        },
                        {
                            path: 'task',
                            model: 'StudyTask'
                        }
                    ]
                })
                .populate({
                    path: '_participant',
                    select: 'username avatar jobRole jobDepartment jobYears email firstName lastName'
                })
                .populate({
                    path: 'task',
                    model: 'StudyTask'
                });

            res.send(studyResponses);

        } catch (error) {
            console.error("error fetching study responses: ", JSON.stringify(error));
            res.status(500).send(error);
        }
    });

    // Assign participant to study and tasks
    app.post('/api/study/:studyId/assign-participant', requireLogin, requireFacilitatorPermissions, async (req, res) => {
        try {
            const { studyId } = req.params;
            const { userId, taskIds } = req.body;

            if (!studyId || !userId || !taskIds || !taskIds.length) {
                return res.status(400).send("Missing required parameters");
            }

            // Get user details
            const user = await mongoose.model('User').findById(userId);
            if (!user) {
                return res.status(404).send("User not found");
            }

            // Add user to study participants if not already added
            const study = await Study.findById(studyId);
            if (!study) {
                return res.status(404).send("Study not found");
            }

            // Check if user is already a participant
            const isParticipant = study.participants.some(participant => {
                if (typeof participant === 'object' && participant._id) {
                    return participant._id.toString() === userId;
                } else {
                    return participant.toString() === userId;
                }
            });

            // If not already a participant, add to study
            if (!isParticipant) {
                await Study.findByIdAndUpdate(
                    studyId,
                    {
                        $push: {
                            participants: {
                                user: userId,
                                email: user.email,
                                username: user.username,
                                responded: false
                            }
                        }
                    },
                    { new: true }
                );
            }

            // Add user to each task's participants
            for (const taskId of taskIds) {
                // Need to determine task type (survey or app-review)
                let task = await StudyTask.findById(taskId);

                if (!task) {
                    task = await StudyTaskSurvey.findById(taskId);
                    if (!task) {
                        task = await StudyTaskAppReview.findById(taskId);
                    }
                }

                if (task) {
                    // Check if user is already a participant in the task
                    const isTaskParticipant = task.participants.some(participant => {
                        if (typeof participant === 'object' && participant._id) {
                            return participant._id.toString() === userId;
                        } else {
                            return participant.toString() === userId;
                        }
                    });

                    // If not already a task participant, add to task
                    if (!isTaskParticipant) {
                        const modelToUse = task.taskType === 'survey' ? StudyTaskSurvey : StudyTaskAppReview;
                        await modelToUse.findByIdAndUpdate(
                            taskId,
                            {
                                $push: {
                                    participants: {
                                        user: userId,
                                        email: user.email,
                                        username: user.username,
                                        responded: false
                                    }
                                }
                            },
                            { new: true }
                        );
                    }
                }
            }

            res.send({ message: "Participant assigned successfully" });
        } catch (error) {
            console.error("error assigning participant:", error);
            res.status(500).send(error);
        }
    });

    app.post('/api/study/:studyId/unassign-participant', requireLogin, requireFacilitatorPermissions, async (req, res) => {
        const { studyId } = req.params;
        const { userId, taskIds } = req.body;

        if (!studyId || !userId || !Array.isArray(taskIds) || taskIds.length === 0) {
            return res.status(400).send("Missing required parameters");
        }

        try {
            const user = await User.findById(userId);
            if (!user) return res.status(404).send("User not found");

            // Validate ids (explicit callback avoids TS/JS quirks)
            if (!mongoose.isValidObjectId(studyId) ||
                !mongoose.isValidObjectId(userId) ||
                !taskIds.every(id => mongoose.isValidObjectId(id))) {
                return res.status(400).send("Invalid id format");
            }

            // Support both shapes:
            // - participants: { user: ObjectId, email, username }
            // - participants: { user: { email, username } }
            const pullCriteria = {
                $or: [
                    { user: userId },                       // ObjectId stored at participants.user
                    { 'user._id': userId },                 // if embedded user subdoc has _id
                    { 'user.username': user.username },     // nested username
                    { 'user.email': user.email },           // nested email
                    { username: user.username },            // flat username
                    { email: user.email }                   // flat email
                ]
            };

            // How many tasks match by id + study?
            const tasksToUpdate = await StudyTask.find({ _id: { $in: taskIds }, study: studyId }).select('_id taskType');
            const foundCount = tasksToUpdate.length;

            // Update both discriminators (covers any implicit discriminator filtering)
            const [resSurvey, resApp] = await Promise.all([
                StudyTaskSurvey.updateMany(
                    { _id: { $in: taskIds }, study: studyId },
                    { $pull: { participants: pullCriteria } }
                ),
                StudyTaskAppReview.updateMany(
                    { _id: { $in: taskIds }, study: studyId },
                    { $pull: { participants: pullCriteria } }
                )
            ]);

            const matched = (resSurvey?.matchedCount || 0) + (resApp?.matchedCount || 0);
            const modified = (resSurvey?.modifiedCount || 0) + (resApp?.modifiedCount || 0);

            // If all tasks in the study were selected, also pull from Study.participants
            const allTaskIds = await StudyTask.find({ study: studyId }).distinct('_id');
            const allTaskIdsStr = allTaskIds.map(String);
            const selectedIdsStr = taskIds.map(String);
            const allSelected = allTaskIdsStr.length > 0 && allTaskIdsStr.every(id => selectedIdsStr.includes(id));

            if (allSelected) {
                await Study.findByIdAndUpdate(studyId, { $pull: { participants: pullCriteria } });
            }

            return res.send({
                foundTasksByFilter: foundCount,
                matched,
                modified,
                removedFromStudy: !!allSelected
            });
        } catch (error) {
            console.error("error unassigning participant:", error);
            res.status(500).send("Server error unassigning participant");
        }
    });

    app.get('/api/study-dashboard/user-ids', requireLogin, requireFacilitatorPermissions, async (req, res) => {
        try {
            const users = await User.find();
            const userIds = users.map(user => [user._id, user.username]);
            res.send(userIds);
        } catch (error) {
            console.error("error fetching user ids: ", JSON.stringify(error));
            res.status(500).send(error);
        }
    });

    app.get('/api/study-dashboard/fetch-user-data/:username/:userId', requireLogin, requireFacilitatorPermissions, async (req, res) => {
        const { username, userId } = req.params;

        try {
            let userData = {};
            const user = await User.findById(userId);
            const consent = await Consent.find({'participants.username': username});
            const studyTasks = await StudyTask.find({ 'participants.username': username }).select('name taskType');
            const studyResponses = await StudyResponse.find({_participant: userId});
            const llmRE = await LLMResponseEvaluation.find({'participants._id': userId}).select('title index');
            const llmREResponses = await LLMResponseEvaluationResponse.find({userId: userId});

            

            userData = {
                'user': user,
                'consent': consent.length > 0 ? consent : 'No Consent Found',
                'studyTasks': studyTasks.length > 0 ? studyTasks : 'No Study Tasks Assigned',
                'studyResponses': studyResponses.length > 0 ? studyResponses : 'No Study Task Responses Found',
                'llmRE': llmRE.length > 0 ? llmRE : 'No LLM Response Evaluations Assigned',
                'llmREResponses': llmREResponses.length > 0 ? llmREResponses : 'No LLM Response Evaluation Responses Found'
            }
            res.send(userData)
        } catch (error) {
            console.log("error fetching user data: ", error);
            res.status(500).send(error);
        }
    });

};
