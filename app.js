const express = require('express');
const { getTopics } = require('./controllers/topics-controller');
const { errorHandler, apiErrorHandler, sqlErrorHandler } = require('./errors-handler');
const app = express();

app.use(express.json());

app.get('/api/topics', getTopics);

app.use(apiErrorHandler)
app.use(sqlErrorHandler)
app.use(errorHandler);

module.exports = app;