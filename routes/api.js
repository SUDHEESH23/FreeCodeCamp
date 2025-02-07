'use strict';
const apiController = require('../controllers/apiController');

module.exports = function(app) {
  // Routes for threads
  app.route('/api/threads/:board')
    .get(apiController.getThreads)
    .post(apiController.createThread)
    .put(apiController.reportThread)
    .delete(apiController.deleteThread);
  
  // Routes for replies
  app.route('/api/replies/:board')
    .get(apiController.getReplies)
    .post(apiController.createReply)
    .put(apiController.reportReply)
    .delete(apiController.deleteReply);
};
