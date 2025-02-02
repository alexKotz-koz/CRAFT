const mongoose = require('mongoose');
const { Schema } = mongoose;

const MediaSchema = new Schema({
    filePath: { type: String, required: true },
    fileType: { type: String, required: true },
    _owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    _dateCreated: { type: Date, default: Date.now, required: true }
});

const TableCellSchema = new Schema({
    column: { type: Number },
    row: { type: Number },
    value: { type: String }
});

const TableSchema = new Schema({
    numColumns: { type: Number, default: 0, min: 1, max: 100 },
    numRows: { type: Number, default: 0, min: 1, max: 500 },
    columnNames: [{ type: String }],
    rowNames: [{ type: String }],
    values: [TableCellSchema]
});

const StudyPromptSchema = new Schema({
    study: { type: Schema.Types.ObjectId, ref: 'Study', required: true },
    parentPrompt: { type: String, required: true },
    childPrompts: [this],
    mediaLinks: [MediaSchema],
    linkLinks: [{ type: String }],
    tables: [TableSchema]
});

mongoose.model('StudyPrompt', StudyPromptSchema);

module.exports = { MediaSchema };