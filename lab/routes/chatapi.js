const express = require('express');
const router = express.Router();
const Chat = require('../models/chat');
const ChatLog = require('../models/chatlog');
const db = require('../dbgoose').db;
const getChatById = require('../openaiutils').getChatById;

/* 
** Chat Logs API 
*/
// Create one chat log entry
router.post('/chatlog', async (req, res) => {
    if (req.body._chat_id == null) {
        return res.status(400).json({ message: 'Must provide a _chat_id' });
    }
    if (req.body.message == null) {
        return res.status(400).json({ message: 'Must provide a message' });
    }
    if (req.body.message_type == null) {
        return res.status(400).json({ message: 'Must provide a message_type' });
    }

    const chatlog = new ChatLog({
        _chat_id: req.body._chat_id,
        message: req.body.message,
        message_type: req.body.message_type,
        source_code: req.body.source_code,
        who: req.body.who,
    });

    try {
        const newChatLog = await chatlog.save();
        res.status(201).json(newChatLog);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update one chat log entry
router.patch('/chatlog/:id', getChatById, async (req, res) => {
    // we should not allowed to update the _chat_id, as this would move this log to another chat
    // if (req.body._chat_id != null) {
    //     res.chatlog._chat_id = req.body._chat_id;
    // }
    if (req.body.message != null) {
        res.chatlog.message = req.body.message;
    }
    if (req.body.message_type != null) {
        res.chatlog.message_type = req.body.message_type;
    }
    if (req.body.source_code != null) {
        res.chatlog.source_code = req.body.source_code;
    }
    if (req.body.who != null) {
        res.chatlog.who = req.body.who;
    }
    try {
        const updatedChatLog = await res.chatlog.save();
        res.send(updatedChatLog);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// On second thought, the GET chat/:id can return the chatlogs
// // Get all chat logs by chat_id from the chat collection
// // Test if there is no need to get a chat by id, I need to see if the
// // res.chat will be available in the response after res.send(chatlog)
// router.get('/chatlog/:chat_id', getChatById, async (req, res) => {
//     try {
//         const chatlog = await ChatLog.find({ _chat_id: res.chat._id });
//         res.send(chatlog);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });


/* 
** Chat API 
*/
// Create one chat
router.post('/chat', async (req, res) => {
    // a chat should always happen within the context of a dataset
    if (req.body._dataset_id == null) {
        return res.status(400).json({ message: 'Must provide a _dataset_id' });
    }

    if (req.body.title == null) {
        return res.status(400).json({ message: 'Must provide a title' });
    }

    // we can prevent chats with a duplicat title by checking here
    // but chatGPT currently allows duplicates. We can revisit this later.

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

// Get all chats
// This endpoint will not return the chatlogs
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
    // get all chatlogs associated with this chat
    ChatLog.find({ _chat_id: res.chat._id }, function (err, chatlogs) {
        if (err) {
            res.status(500).json({ message: err.message });
        }
        res.send({ chat: res.chat, chatlogs: chatlogs });
    });
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
        // remove all chatlogs associated with this chat
        await ChatLog.deleteMany({ _chat_id: res.chat._id });

        res.send({ message: 'Deleted chat' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// // Get one chat log entry by id
// async function getChatLogById(req, res, next) {
//     let chatlog;
//     try {
//         chatlog = await ChatLog.findById(req.params.id);
//         if (chatlog == null) {
//             return res.status(404).json({ message: 'Cannot find chatlog' });
//         }
//     } catch (err) {
//         return res.status(500).json({ message: err.message });
//     }

//     console.log('getChatLogById:', chatlog);

//     res.chatlog = chatlog;
//     next();
// }

// Update one chat log entry
router.patch('/chatlog/:id', getChatById, async (req, res) => {
    // _chat_id should not be updated
    if (req.body.message != null) {
        res.chatlog.message = req.body.message;
    }
    if (req.body.message_type != null) {
        res.chatlog.message_type = req.body.message_type;
    }
    if (req.body.source_code != null) {
        res.chatlog.source_code = req.body.source_code;
    }
    if (req.body.who != null) {
        res.chatlog.who = req.body.who;
    }
    try {
        const updatedChatLog = await res.chatlog.save();
        res.send(updatedChatLog);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


module.exports = router;