const express = require('express');
const { errorHandler, apiErrorHandler, sqlErrorHandler } = require('./errors-handler');
const { getEndpointsInfo } = require('./controllers/api-controller');
const { getTopics } = require('./controllers/topics-controller');
const { getArticle, getArticles, getArticleComments } = require('./controllers/articles-controller');
const app = express();

app.get('/api', getEndpointsInfo)
app.get('/api/topics', getTopics);

app.get('/api/articles', getArticles);
app.get('/api/articles/:article_id', getArticle);
app.get('/api/articles/:article_id/comments', getArticleComments);

app.use(apiErrorHandler)
app.use(sqlErrorHandler)
app.use(errorHandler);

module.exports = app;