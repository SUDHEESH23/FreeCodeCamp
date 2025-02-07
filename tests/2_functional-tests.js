require('dotenv').config();
const chai     = require('chai');
const chaiHttp = require('chai-http');
const server   = require('../server'); // ensure your server exports correctly

const assert = chai.assert;
chai.use(chaiHttp);

suite('Functional Tests', function() {
  
  let threadId;
  let replyId;
  const board = 'test';
  const threadText = 'Test thread';
  const threadPassword = 'pass123';
  const replyText = 'Test reply';
  const replyPassword = 'replypass';
  
  test('Creating a new thread: POST request to /api/threads/{board}', function(done) {
    chai.request(server)
      .post('/api/threads/' + board)
      .send({ text: threadText, delete_password: threadPassword })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        done();
      });
  });
  
  test('Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}', function(done) {
    chai.request(server)
      .get('/api/threads/' + board)
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        if (res.body.length) {
          threadId = res.body[0]._id;
        }
        done();
      });
  });
  
  test('Reporting a thread: PUT request to /api/threads/{board}', function(done) {
    chai.request(server)
      .put('/api/threads/' + board)
      .send({ thread_id: threadId })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'reported');
        done();
      });
  });
  
  test('Deleting a thread with the incorrect password: DELETE request to /api/threads/{board}', function(done) {
    chai.request(server)
      .delete('/api/threads/' + board)
      .send({ thread_id: threadId, delete_password: 'wrongpass' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'incorrect password');
        done();
      });
  });
  
  test('Creating a new reply: POST request to /api/replies/{board}', function(done) {
    chai.request(server)
      .post('/api/replies/' + board)
      .send({ thread_id: threadId, text: replyText, delete_password: replyPassword })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        done();
      });
  });
  
  test('Viewing a single thread with all replies: GET request to /api/replies/{board}', function(done) {
    chai.request(server)
      .get('/api/replies/' + board)
      .query({ thread_id: threadId })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'replies');
        if (res.body.replies.length) {
          replyId = res.body.replies[0]._id;
        }
        done();
      });
  });
  
  test('Reporting a reply: PUT request to /api/replies/{board}', function(done) {
    chai.request(server)
      .put('/api/replies/' + board)
      .send({ thread_id: threadId, reply_id: replyId })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'reported');
        done();
      });
  });
  
  test('Deleting a reply with the incorrect password: DELETE request to /api/replies/{board}', function(done) {
    chai.request(server)
      .delete('/api/replies/' + board)
      .send({ thread_id: threadId, reply_id: replyId, delete_password: 'wrongpass' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'incorrect password');
        done();
      });
  });
  
  test('Deleting a reply with the correct password: DELETE request to /api/replies/{board}', function(done) {
    chai.request(server)
      .delete('/api/replies/' + board)
      .send({ thread_id: threadId, reply_id: replyId, delete_password: replyPassword })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'success');
        done();
      });
  });
  
  test('Deleting a thread with the correct password: DELETE request to /api/threads/{board}', function(done) {
    chai.request(server)
      .delete('/api/threads/' + board)
      .send({ thread_id: threadId, delete_password: threadPassword })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'success');
        done();
      });
  });
});
