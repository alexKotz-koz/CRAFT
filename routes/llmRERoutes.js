const mongoose = require('mongoose');
const { LLMResponseEvaluation, FullLLMResponseEvaluation, SectionsLLMResponseEvaluation } = require('../models/LLMResponseEvaluation');
const { LLMResponseEvaluationResponse } = require('../models/LLMResponseEvaluationResponse');

const requireLogin = require('../middlewares/requireLogin');
const requireFacilitatorPermissions = require('../middlewares/requireFacilitatorPermissions');

module.exports = (app) => {
    app.post('/api/llm-response-evaluation/create', requireFacilitatorPermissions, requireLogin, async (req, res) => {

        ////REMOVE: For reuse (participants)
        const { title, instructions, isFullTranscript, transcript, sections, rubricItems, participants } = req.body;

        //REMOVE: For reuse (participants)
        try {
            let evaluation;
            if (!isFullTranscript) {
                evaluation = new SectionsLLMResponseEvaluation({
                    user: req.user._id,
                    title,
                    instructions,
                    sections,
                    rubricItems,
                    participants
                });
            } else if (isFullTranscript) {
                evaluation = new FullLLMResponseEvaluation({
                    user: req.user._id,
                    title,
                    instructions,
                    transcript,
                    rubricItems,
                    participants
                });
            }

            await evaluation.save();
            res.status(201).json(evaluation);
        } catch (error) {
            console.error("Error creating evaluation: ", error);
            res.status(500).send("Internal Server Error");
        }
    });

    app.get('/api/llm-response-evaluation/all', async (req, res) => {
        try {
            const allLLMREs = await LLMResponseEvaluation.find();
            res.send(allLLMREs);
        } catch (err) {
            return res.status(500).send("Internal Server Error");
        }
    });

    app.get('/api/llm-response-evaluation/:evaluationId', requireLogin, async (req, res) => {
        const { evaluationId } = req.params;
        try {
            const llmre = await LLMResponseEvaluation.findById(evaluationId);

            res.send(llmre);

        } catch (err) {
            console.error("Error fetching LLM Response Evaluation:", err);
            res.status(422).send(err);
        }
    });

    app.post('/api/llm-response-evaluation/:evaluationId/response', requireLogin, async (req, res) => {
        const { evaluationId } = req.params;
        const userId = req.user._id;
        const { responses } = req.body;

        try {
            // Upsert: update if exists, otherwise create new
            const responseDoc = await LLMResponseEvaluationResponse.findOneAndUpdate(
                { evaluationId, userId },
                { $set: { responses, createdAt: new Date() } },
                { new: true, upsert: true }
            );
            const llmre = await LLMResponseEvaluation.findById(evaluationId);
            if (llmre && llmre.participants && req.user && req.user._id) {
                const participant = llmre.participants.find(
                    p => p._id && p._id.toString() === req.user._id.toString()
                );
                if (participant && !participant.responded) {
                    participant.responded = true;
                    await llmre.save();

                }
            }
            res.status(200).json(responseDoc);
        } catch (err) {
            console.error("Error saving LLM Response Evaluation Response:", err);
            res.status(500).send("Internal Server Error");
        }
    });

    app.get('/api/llm-response-evaluation/:evaluationId/response/me', requireLogin, async (req, res) => {
        const { evaluationId } = req.params;
        const userId = req.user._id;
        try {
            const response = await LLMResponseEvaluationResponse.findOne({ evaluationId, userId });
            if (!response) return res.status(200).send(null);
            res.json(response);
        } catch (err) {
            console.error("Error fetching current user response:", err);
            res.status(500).send("Internal Server Error");
        }
    });

    app.get('/api/llm-response-evaluation/participant-response/:evaluationId/:userId', requireLogin, async (req, res) => {
        const { evaluationId, userId } = req.params;
        try {
            const response = await LLMResponseEvaluationResponse.findOne({ evaluationId, userId });
            if (!response) return res.status(200).send(null);
            res.json(response);
        } catch (err) {
            console.error("Error fetching specific user response:", err);
            res.status(500).send("Internal Server Error");
        }
    });
    // Example Express route
    app.get('/api/llm-response-evaluation/response/:responseId', requireLogin, async (req, res) => {
        const { responseId } = req.params;
        const response = await LLMResponseEvaluationResponse.findById(responseId)
            .populate('evaluationId')
            .populate('userId');
        res.json(response);
    });
    app.get('/api/llm-response-evaluation/responses/all', requireLogin, async (req, res) => {
        try {
            const responses = await LLMResponseEvaluationResponse.find()
                .populate({ path: 'evaluationId', model: 'LLMResponseEvaluation' })
                .populate({ path: 'userId', model: 'User' });
            res.send(responses)
        } catch (err) {
            return res.status(500).send("Internal Server Error");
        }
    });

    app.get('/api/llm-response-evaluation/prepare-download/:evaluationId/:participantIds', requireLogin, requireFacilitatorPermissions, async (req, res) => {
        const { evaluationId, participantIds } = req.params;

        const participantIdArray = participantIds.split(',');

        try {
            const responses = await LLMResponseEvaluationResponse.find({
                evaluationId,
                userId: { $in: participantIdArray }
            })
                .populate({ path: 'evaluationId', model: 'LLMResponseEvaluation' })
                .populate({ path: 'userId', model: 'User' });

            res.status(200).json(responses);
        } catch (err) {
            console.error("Error preparing download:", err);
            res.status(500).send("Internal Server Error");
        }

    });

    app.post('/api/llm-response-evaluation/:evaluationId/assign-participant', requireLogin, requireFacilitatorPermissions, async (req, res) => {
        try {
            const { evaluationId } = req.params;
            const { userId } = req.body;
            if (!evaluationId || !userId) {
                return res.status(400).send("Missing requireid parameters");
            }

            const user = await mongoose.model('User').findById(userId);
            if (!user) {
                return res.status(404).send("User not found");
            }

            const evaluation = await mongoose.model('LLMResponseEvaluation').findById(evaluationId);
            if (!evaluation) {
                return res.status(404).send('Evaluation not found');
            }

            const isParticipant = evaluation.participants.some(participant => {
                if (typeof participant === 'object' && participant._id) {
                    return participant._id.toString() === userId;
                } else {
                    return participant.toString() === userId;
                }
            });

            if (!isParticipant) {
                await LLMResponseEvaluation.findByIdAndUpdate(
                    evaluationId,
                    {
                        $push: {
                            participants: {
                                _id: userId,
                                user: userId,
                                email: user.email,
                                username: user.username,
                                responded: false
                            }
                        }
                    },
                    { new: true }
                )
            }
            res.send({ message: "Participant assigned successfully" });
        } catch (err) {
            console.error("Error assigning participant:", err);
            res.status(500).send(err);
        }
    });

    app.post('/api/llm-response-evaluation/:evaluationId/edit', requireLogin, requireFacilitatorPermissions, async (req, res) => {
        try {
            const { evaluationId } = req.params;
            const { evaluationEdits } = req.body;
    
            const llmre = await LLMResponseEvaluation.findById(evaluationId);
            if (!llmre) {
                return res.status(404).send('Evaluation not found');
            }
    
            if (!evaluationEdits || typeof evaluationEdits !== "object" || Object.keys(evaluationEdits).length === 0) {
                return res.status(400).send("Evaluation edits not formatted properly");
            }
    
            // Update top-level fields
            if (evaluationEdits.instructions !== undefined) {
                llmre.instructions = evaluationEdits.instructions;
            }
    
            // Update chat content and rubric items
            Object.entries(evaluationEdits).forEach(([key, value]) => {
                // Chat updates
                if (key.startsWith("chat_")) {
                    const chatId = parseInt(key.replace("chat_", ""), 10);
                    if (llmre.transcript) {
                        const chat = llmre.transcript.find(c => c.chatId === chatId);
                        if (chat) chat.content = value;
                    }
                    if (llmre.sections) {
                        llmre.sections.forEach(section => {
                            const chat = section.transcript.find(c => c.chatId === chatId);
                            if (chat) chat.content = value;
                        });
                    }
                }
    
                // Rubric item updates
                const rubricMatch = key.match(/^rubricItem_(\d+)_(title|caption|reason)$/);
                if (rubricMatch) {
                    const itemId = parseInt(rubricMatch[1], 10);
                    const field = rubricMatch[2];
                    const rubricItem = llmre.rubricItems.find(item => item.itemId === itemId);
                    if (rubricItem) rubricItem[field] = value;
                }
            });
    
            await llmre.save();
            res.send({ message: "Evaluation updated successfully", llmre });
        } catch (err) {
            console.error("Error updating llm response evaluation: ", err);
            res.status(500).send(err);
        }
    });
};