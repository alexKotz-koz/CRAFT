const mongoose = require('mongoose');
const { Schema } = mongoose;
const MediaSchema = require('./StudyPrompt').MediaSchema;
const StudyParticipantSchema = require('./StudyParticipant');
const options = { discriminatorKey: 'taskType', _id: false };

const StudyTaskSchema = new Schema({
    study: { type: Schema.Types.ObjectId, ref: 'Study', required: true },
    participants: { type: [StudyParticipantSchema], required: true },
    prompts: [{ type: Schema.Types.ObjectId, ref: 'StudyPrompt' }],
    media: { type: MediaSchema },
    _createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    _dateCreated: { type: Date, default: Date.now, required: true }
}, options);

const StudyTask = mongoose.model('StudyTask', StudyTaskSchema);

const StudyTaskAppReviewSchema = new Schema({
    name: { type: String, required: true },
    instructions: { type: String, required: true },
});

const StudyTaskSurveySchema = new Schema({
    instructions: { type: String }
});

const StudyTaskAppReview = StudyTask.discriminator('app-review', StudyTaskAppReviewSchema);
const StudyTaskSurvey = StudyTask.discriminator('survey', StudyTaskSurveySchema);

module.exports = {
    StudyTask,
    StudyTaskAppReview,
    StudyTaskSurvey
};