'use strict';
require('dotenv').config();

const express    = require('express');
const bodyParser = require('body-parser');
const cors       = require('cors');
const helmet     = require('helmet');
const mongoose   = require('mongoose');

const apiRoutes        = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner           = require('./test-runner');

const app = express();

// SECURITY MIDDLEWARE
app.use(helmet());
// Prevent your site from being embedded in iframes on other domains.
app.use(helmet.frameguard({ action: 'sameorigin' }));
// Only send referrer for your own pages.
app.use(helmet.referrerPolicy({ policy: 'same-origin' }));
// Disable DNS prefetching.
app.use(helmet.dnsPrefetchControl({ allow: false }));

// Serve static assets
app.use('/public', express.static(process.cwd() + '/public'));

// Allow CORS for testing purposes (for FCC tests, otherwise restrict this in production)
app.use(cors({ origin: '*' }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CONNECT TO MONGODB
mongoose.connect(process.env.DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('DB connected'))
.catch(err => console.error(err));

// SAMPLE FRONT-END ROUTES
app.route('/b/:board/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/board.html');
  });
app.route('/b/:board/:threadid')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/thread.html');
  });

// INDEX PAGE (STATIC HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

// FCC TESTING ROUTES
fccTestingRoutes(app);

// API ROUTES
apiRoutes(app);

// 404 Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

// START SERVER AND RUN TESTS (if in test environment)
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (e) {
        console.log('Tests are not valid:');
        console.error(e);
      }
    }, 1500);
  }
});

module.exports = app; // for testing
