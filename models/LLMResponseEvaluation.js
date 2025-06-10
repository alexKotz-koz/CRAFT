const mongoose = require('mongoose');
const { Schema } = mongoose;

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
    checkboxLabels: [{type: String}],
    radioLabels: [{type: String}],
    reason: { type: String },
    _dateCreated: { type: Date, default: Date.now }
});
// Helper model for SectionsLLMResponseEvaluation
const LLMOutputSectionsSchema = new Schema({
    sectionId: { type: Number, required: true },
    llmOutput: { type: String, required: true }
})


// Base LLM Response Evaluation Schema
const BaseLLMResponseEvaluationSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rubricInstructions: { type: String },
    rubricItems: [RubricItemSchema],
}, { discriminatorKey: 'kind', timestamps: true });

// Create the base model
const LLMResponseEvaluation = mongoose.model('LLMResponseEvaluation', BaseLLMResponseEvaluationSchema);

const FullLLMResponseEvaluationSchema = new Schema({
    llmOutput: { type: String, required: true },
});

const SectionsLLMResponseEvaluationSchema = new Schema({
    llmOutput: [LLMOutputSectionsSchema]
});

// Discriminators (the models being using in the app)
const FullLLMResponseEvaluation = LLMResponseEvaluation.discriminator('FullLLMResponseEvaluation', FullLLMResponseEvaluationSchema);
const SectionsLLMResponseEvaluation = LLMResponseEvaluation.discriminator('SectionsLLMResponseEvaluation', SectionsLLMResponseEvaluationSchema);


module.exports = { LLMResponseEvaluation, FullLLMResponseEvaluation, SectionsLLMResponseEvaluation };