const mongoose = require('mongoose');
const { Schema } = mongoose;

// Schema for storing responses to LLM Response Evaluations
const LLMResponseEvaluationResponseSchema = new Schema({
    evaluationId: { type: Schema.Types.ObjectId, ref: 'LLMResponseEvaluation', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    responses: [{
        sectionId: { type: Schema.Types.Mixed, required: true },
        rubricResponses: [{
            itemId: { type: Number, required: true },
            selectedRadioOption: { type: String }, 
            selectedCheckboxOptions: [{ type: String }],
            selectedSwitchOption: { type: String },
            selectedRangeOption: { type: Number },
            feedback: { type: String } 
        }],
        otherFeedback: { type: String },
    }],
    createdAt: { type: Date, default: Date.now }
});

// Create the model
const LLMResponseEvaluationResponse = mongoose.model('LLMResponseEvaluationResponse', LLMResponseEvaluationResponseSchema);

module.exports = {LLMResponseEvaluationResponse};