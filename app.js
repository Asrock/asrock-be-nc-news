const express = require("express");
const cors = require('cors');
const { errorHandler, apiErrorHandler, sqlErrorHandler } = require("./errors-handler");
const { getEndpointsInfo } = require("./controllers/api-controller");
const { getTopics, postTopic, getTopicArticles } = require("./controllers/topics-controller");
const { getArticle, getArticles, patchArticle, getArticleComments, postArticleComment, postArticle, deleteArticle } = require("./controllers/articles-controller");
const { getUsers, getUser } = require("./controllers/users-controller");
const { patchComment, deleteComment } = require("./controllers/comments-controller");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api", getEndpointsInfo);

app.get("/api/topics", getTopics);
app.post("/api/topics", postTopic);
app.get("/api/topics/:topic/articles", getTopicArticles);

app.get("/api/users", getUsers);
app.get("/api/users/:username", getUser);

app.get("/api/articles", getArticles);
app.post("/api/articles", postArticle);
app.get("/api/articles/:article_id", getArticle);
app.patch("/api/articles/:article_id", patchArticle);
app.delete("/api/articles/:article_id", deleteArticle);

app.get("/api/articles/:article_id/comments", getArticleComments);
app.post("/api/articles/:article_id/comments", postArticleComment);

app.patch("/api/comments/:comment_id", patchComment);
app.delete("/api/comments/:comment_id", deleteComment);

app.use(apiErrorHandler);
app.use(sqlErrorHandler);
app.use(errorHandler);

module.exports = app;