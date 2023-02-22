const express = require('express');
const router = express.Router();
const Chat = require('../models/chat');
const db = require('../dbgoose').db;
const getChatById = require('../openaiutils').getChatById;

/* 
** Chat Logs API 
*/
// Get all chats
router.get('/chat', async (req, res) => {
    try {
        const chat = await Chat.find();
        res.send(chat);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get one chat
router.get('/chat/:id', getChatById, (req, res) => {
    console.log('getChatById: ' + res.chat);
    res.send(res.chat);
});

// Create one chat
router.post('/chat', async (req, res) => {
    // maybe check that at least a dataset_id OR experiment_id is provided
    if (req.body._dataset_id == null && req.body._experiment_id == null) {
        return res.status(400).json({ message: 'Must provide a dataset_id or experiment_id' });
    }
    const chat = new Chat({
        title: req.body.title,
        _dataset_id: req.body._dataset_id,
        _experiment_id: req.body._experiment_id,
    });

    try {
        const newChat = await chat.save();
        res.status(201).json(newChat);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update one chat
router.patch('/chat/:id', getChatById, async (req, res) => {
    if (req.body.title != null) {
        res.chat.title = req.body.title;
    }
    if (req.body._dataset_id != null) {
        res.chat._dataset_id = req.body._dataset_id;
    }
    if (req.body._experiment_id != null) {
        res.chat._experiment_id = req.body._experiment_id;
    }
    try {
        const updatedChat = await res.chat.save();
        res.send(updatedChat);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete one chat
router.delete('/chat/:id', getChatById, async (req, res) => {
    try {
        await res.chat.remove();
        res.send({ message: 'Deleted chat' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;