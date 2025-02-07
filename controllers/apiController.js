'use strict';
const Thread = require('../models/Thread');

// THREADS

// Create a new thread
exports.createThread = async function(req, res) {
    const board = req.params.board;
    const { text, delete_password } = req.body;
    try {
      // Capture the current time once
      const now = new Date();
      const newThread = new Thread({
        board,
        text,
        delete_password,
        created_on: now,
        bumped_on: now  // set bumped_on equal to created_on
      });
      await newThread.save();
      res.redirect(`/b/${board}/`);
    } catch (err) {
      res.status(500).send(err);
    }
  };
  

// Get the 10 most recent threads with the 3 most recent replies each
exports.getThreads = async function(req, res) {
  const board = req.params.board;
  try {
    let threads = await Thread.find({ board })
      .sort({ bumped_on: -1 })
      .limit(10)
      .lean();
    // Remove sensitive fields and limit replies to the 3 most recent
    threads = threads.map(thread => {
      thread.replycount = thread.replies.length;
      thread.replies = thread.replies
        .sort((a, b) => b.created_on - a.created_on)
        .slice(0, 3);
      delete thread.delete_password;
      delete thread.reported;
      thread.replies = thread.replies.map(reply => {
        delete reply.delete_password;
        delete reply.reported;
        return reply;
      });
      return thread;
    });
    res.json(threads);
  } catch (err) {
    res.status(500).send(err);
  }
};

// Delete a thread if the delete_password is correct
exports.deleteThread = async function(req, res) {
  const board = req.params.board;
  const { thread_id, delete_password } = req.body;
  try {
    const thread = await Thread.findById(thread_id);
    if (!thread) return res.send('thread not found');
    if (thread.delete_password !== delete_password) {
      return res.send('incorrect password');
    }
    await Thread.findByIdAndDelete(thread_id);
    res.send('success');
  } catch (err) {
    res.status(500).send(err);
  }
};

// Report a thread (set its reported value to true)
exports.reportThread = async function(req, res) {
  const board = req.params.board;
  const { thread_id } = req.body;
  try {
    await Thread.findByIdAndUpdate(thread_id, { reported: true });
    res.send('reported');
  } catch (err) {
    res.status(500).send(err);
  }
};

// REPLIES

// Create a new reply for a thread
exports.createReply = async function(req, res) {
    const board = req.params.board;
    const { thread_id, text, delete_password } = req.body;
    try {
      const thread = await Thread.findById(thread_id);
      if (!thread) return res.send('thread not found');
  
      // Capture the current time once
      const now = new Date();
      const reply = {
        text,
        delete_password,
        created_on: now
      };
      thread.replies.push(reply);
      thread.bumped_on = now; // update bumped_on to the same time as the reply's created_on
      await thread.save();
      res.redirect(`/b/${board}/${thread_id}`);
    } catch (err) {
      res.status(500).send(err);
    }
  };
  

// Get a single thread with all its replies (removing sensitive fields)
exports.getReplies = async function(req, res) {
  const board = req.params.board;
  const thread_id = req.query.thread_id;
  try {
    let thread = await Thread.findById(thread_id).lean();
    if (!thread) return res.send('thread not found');
    delete thread.delete_password;
    delete thread.reported;
    thread.replies = thread.replies.map(reply => {
      delete reply.delete_password;
      delete reply.reported;
      return reply;
    });
    res.json(thread);
  } catch (err) {
    res.status(500).send(err);
  }
};

// Delete a reply if the delete_password is correct
exports.deleteReply = async function(req, res) {
  const board = req.params.board;
  const { thread_id, reply_id, delete_password } = req.body;
  try {
    const thread = await Thread.findById(thread_id);
    if (!thread) return res.send('thread not found');
    const reply = thread.replies.id(reply_id);
    if (!reply) return res.send('reply not found');
    if (reply.delete_password !== delete_password) {
      return res.send('incorrect password');
    }
    reply.text = "[deleted]";
    await thread.save();
    res.send('success');
  } catch (err) {
    res.status(500).send(err);
  }
};

// Report a reply (set its reported value to true)
exports.reportReply = async function(req, res) {
  const board = req.params.board;
  const { thread_id, reply_id } = req.body;
  try {
    const thread = await Thread.findById(thread_id);
    if (!thread) return res.send('thread not found');
    const reply = thread.replies.id(reply_id);
    if (!reply) return res.send('reply not found');
    reply.reported = true;
    await thread.save();
    res.send('reported');
  } catch (err) {
    res.status(500).send(err);
  }
};
