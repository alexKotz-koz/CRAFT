const mongoose = require('mongoose');
const { Schema } = mongoose;

const ParticipantSchema = new Schema({
    _id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    email: { type: String, required: true },
    username: { type: String, required: true },
    responded: { type: Boolean, default: false },
});

// Helper model for LLMResponseEvaluation
const RubricItemSchema = new Schema({
    itemId: { type: Number, required: true },
    title: { type: String, required: true },
    caption: { type: String, required: true },
    objectType: {
        type: String,
        enum: ['radio', 'checkbox', 'switch', 'range'],
        required: true
    },
    checkboxLabels: [{ type: String }],
    radioLabels: [{ type: String }],
    reason: { type: String },
});

const ChatSchema = new Schema({
    chatId: { type: Number, required: true }, // An internal id to keep track of chat order in sections
    kind: {
        type: String,
        enum: ['human', 'llm'],
        required: true
    },
    content: { type: String, required: true }
});

// Helper model for SectionsLLMResponseEvaluation
const LLMOutputSectionsSchema = new Schema({
    sectionId: { type: Number, required: true },
    transcript: [ChatSchema],
})


// Base LLM Response Evaluation Schema
const BaseLLMResponseEvaluationSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    instructions: { type: String, required: true },
    rubricItems: [RubricItemSchema],
    /////Remove this for future use cases/////
    participants: { type: [ParticipantSchema], required: true },
}, { discriminatorKey: 'kind', timestamps: true });

// Create the base model
const LLMResponseEvaluation = mongoose.model('LLMResponseEvaluation', BaseLLMResponseEvaluationSchema);

const FullLLMResponseEvaluationSchema = new Schema({
    transcript: [ChatSchema],
});

const SectionsLLMResponseEvaluationSchema = new Schema({
    sections: [LLMOutputSectionsSchema]
});

// Discriminators (the models being using in the app)
const FullLLMResponseEvaluation = LLMResponseEvaluation.discriminator('FullLLMResponseEvaluation', FullLLMResponseEvaluationSchema);
const SectionsLLMResponseEvaluation = LLMResponseEvaluation.discriminator('SectionsLLMResponseEvaluation', SectionsLLMResponseEvaluationSchema);


module.exports = { LLMResponseEvaluation, FullLLMResponseEvaluation, SectionsLLMResponseEvaluation };