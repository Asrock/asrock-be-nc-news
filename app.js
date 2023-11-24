const express = require("express");
const { errorHandler, apiErrorHandler, sqlErrorHandler } = require("./errors-handler");
const { getEndpointsInfo } = require("./controllers/api-controller");
const { getTopics } = require("./controllers/topics-controller");
const { getArticle, getArticles, patchArticle, getArticleComments, postArticleComment, postArticle } = require('./controllers/articles-controller');
const { getUsers } = require("./controllers/users-controller");

const app = express();

app.use(express.json());

app.get("/api", getEndpointsInfo);
app.get("/api/topics", getTopics);
app.get("/api/users", getUsers);

app.get('/api/articles', getArticles);
app.get('/api/articles/:article_id', getArticle);
app.patch('/api/articles/:article_id', patchArticle);
app.get('/api/articles/:article_id/comments', getArticleComments);
app.post('/api/articles/:article_id/comments', postArticleComment);

app.post("/api/articles", postArticle)

app.use(apiErrorHandler);
app.use(sqlErrorHandler);
app.use(errorHandler);

module.exports = app;