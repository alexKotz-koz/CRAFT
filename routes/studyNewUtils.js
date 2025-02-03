const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const StudyPrompt = mongoose.model('StudyPrompt');

const createStudyDirectory = (studyId) => {
    const studyDir = path.join(__dirname, '..', 'uploads', studyId.toString());
    if (!fs.existsSync(studyDir)) {
        fs.mkdirSync(studyDir, { recursive: true });
    }
    return studyDir;
};

const saveMediaFiles = (studyDir, mediaFiles, userId) => {
    const mediaLinks = [];
    mediaFiles.forEach((file) => {
        const filePath = path.join(studyDir, file.name);
        fs.writeFileSync(filePath, file);
        mediaLinks.push({
            filePath,
            fileType: file.type,
            _owner: userId,
        });
    });
    return mediaLinks;
};

const createStudyPrompts = async (questionList, studyId, userId) => {
    const studyDir = createStudyDirectory(studyId);
    console.log("transformContentList studyDir Created: ", studyDir);
    console.log("transformContentList questionList: ", questionList);
    
    const studyPrompts = [];

    for (const question of questionList) {

        const tables = question.tables.map(table => ({
            numColumns: table.numColumns,
            numRows: table.numRows,
            columnNames: table.columnNames,
            values: table.values.flat().map(cell => ({
                column: cell.column,
                row: cell.row,
                value: cell.value
            }))
        }));

        const studyPrompt = new StudyPrompt({
            study: studyId,
            parentPrompt: question.parentQuestion,
            childPrompts: question.children.map((child) => ({
                parentPrompt: child.question,
            })),
            mediaLinks: question.media,
            linkLinks: question.links,
            tables
        });
        await studyPrompt.save();
        studyPrompts.push(studyPrompt._id);
    }

    return studyPrompts;
};

const createStudyTask = async (studyId, userId, studyPrompts, instructions, participants) => {
    const StudyTask = mongoose.model('StudyTask');
    const studyTask = new StudyTask({
        study: studyId,
        participants,
        prompts: studyPrompts,
        instructions,
        _createdBy: userId,
    });
    await studyTask.save();
    return studyTask._id;
};

module.exports = {
    createStudyDirectory,
    saveMediaFiles,
    createStudyPrompts,
    createStudyTask,
};