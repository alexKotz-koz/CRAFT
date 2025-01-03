const mongoose = require('mongoose');
const { Schema } = mongoose;

const studyPromptSchema = new Schema({
    prompt: {type: String, required: true},
    response: {type: String, required: true},
});

module.exports = studyPromptSchema;