const express = require('express');
const { errorHandler, apiErrorHandler, sqlErrorHandler } = require('./errors-handler');
const { getEndpointsInfo } = require('./controllers/api-controller');
const { getTopics } = require('./controllers/topics-controller');
const app = express();

app.get('/api', getEndpointsInfo)
app.get('/api/topics', getTopics);

app.use(apiErrorHandler)
app.use(sqlErrorHandler)
app.use(errorHandler);

module.exports = app;