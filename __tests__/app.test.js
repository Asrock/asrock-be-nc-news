const request = require("supertest");
const app = require("../app.js")
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const data = require("../db/data/test-data/index.js");
const endpointInfo = require("../endpoints.json")

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("/api", () => {
    test("GET:200 sends an object describing all the endpoints availables to the client", () => {
        return request(app)
            .get("/api")
            .expect(200)
            .then(({ body }) => expect(body).toEqual(endpointInfo));
    });
    test("GET:200 ensure the endpoints information is up to date with the application", () => {
        return request(app)
            .get("/api")
            .expect(200)
            .then(({ body }) => {
                const appEndpoints = app._router.stack
                    .filter(({ route }) => route && route.path !== "/api")
                    .map(({ route }) => `${Object.keys(route.methods)[0].toUpperCase()} ${route.path}`);

                expect(Object.keys(body).length).toBe(appEndpoints.length);
                appEndpoints.forEach(endpoint => {
                    expect(body).toHaveProperty(endpoint);
                    expect(body[endpoint]).toMatchObject({
                        description: expect.any(String),
                        queries: expect.any(Array),
                        format: expect.any(String),
                        exampleResponse: expect.any(Object)
                    })
                });
            });
    });
});

describe("/api/topics", () => {
    test("GET:200 sends an array of topics to the client", () => {
        return request(app)
            .get("/api/topics")
            .expect(200)
            .then(({ body }) => {
                expect(body.topics.length).toBe(3);
                body.topics.forEach(topic => {
                    expect(topic).toMatchObject({
                        slug: expect.any(String),
                        description: expect.any(String)
                    });
                });
            });
    });
});

describe("/api/articles", () => {
    test("GET:200 sends an array of articles to the client", () => {
        return request(app)
            .get("/api/articles")
            .expect(200)
            .then(({ body }) => {
                expect(body.articles.length).toBe(13);
                body.articles.forEach(article => {
                    expect(article).toMatchObject({
                        article_id: expect.any(Number),
                        author: expect.any(String),
                        title: expect.any(String),
                        topic: expect.any(String),
                        created_at: expect.any(String),
                        votes: expect.any(Number),
                        article_img_url: expect.any(String),
                        comment_count: expect.any(Number)
                    });
                });
                expect(body.articles).toBeSortedBy("created_at", { ascending: true });
            });
    });
    test("GET:200 sends an array of articles in ascending order by create_at", () => {
        return request(app)
            .get("/api/articles")
            .expect(200)
            .then(({ body }) => {
                expect(body.articles).toBeSortedBy("created_at", { ascending: true });
            });
    });

    describe("/api/articles?topic=", () => {
        test("GET:200 when matches the topic sends an array of articles to the client", () => {
            return request(app)
                .get("/api/articles?topic=mitch")
                .expect(200)
                .then(({ body }) => {
                    expect(body.articles.length).toBe(12);
                    body.articles.forEach(article => {
                        expect(article).toMatchObject({
                            article_id: expect.any(Number),
                            author: expect.any(String),
                            title: expect.any(String),
                            topic: "mitch",
                            created_at: expect.any(String),
                            votes: expect.any(Number),
                            article_img_url: expect.any(String),
                            comment_count: expect.any(Number)
                        });
                    });
                });
        });
        test("GET:200 sends an array of articles in ascending order by create_at", () => {
            return request(app)
                .get("/api/articles?topic=mitch")
                .expect(200)
                .then(({ body }) => expect(body.articles).toBeSortedBy("created_at", { ascending: true }));
        });
        test("GET:200 sends an empty array of articles when topic is not found in articles but it does exist", () => {
            return request(app)
                .get("/api/articles?topic=paper")
                .expect(200)
                .then(({ body }) => expect(body.articles).toEqual([]));
        });
        test("GET:404 sends an empty array of articles when topic does not exist", () => {
            return request(app)
                .get("/api/articles?topic=not_in_topics")
                .expect(404)
                .then(({ body }) => expect(body.msg).toBe("topic does not exist"));
        });
        test("GET:400 sends an appropriate status and error message when given an invalid filter", () => {
            return request(app)
                .get("/api/articles?test=mitch")
                .expect(400)
                .then(({ body }) => expect(body.msg).toBe("Bad request"));
        });
        test("GET:400 sends an appropriate status and error message when given the same filter twice", () => {
            return request(app)
                .get("/api/articles?topic=mitch&topic=mitch")
                .expect(400)
                .then(({ body }) => expect(body.msg).toBe("Bad request"));
        });
    });
});

describe("/api/articles/:article_id", () => {
    test("GET:200 sends a single article to the client", () => {
        return request(app)
            .get("/api/articles/1")
            .expect(200)
            .then(({ body }) => expect(body.article).toMatchObject({
                article_id: 1,
                author: "butter_bridge",
                title: "Living in the shadow of a great man",
                body: "I find this existence challenging",
                topic: "mitch",
                created_at: "2020-07-09T20:11:00.000Z",
                votes: 100,
                article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
            }));
    });
    test("FEATURE GET:200 sends the total count of all the comments by article_id to the client", () => {
        return request(app)
            .get("/api/articles/1")
            .expect(200)
            .then(({ body }) => expect(body.article.comment_count).toBe(11));
    });
    test("GET:404 sends an appropriate status and error message when given a valid but non-existent id", () => {
        return request(app)
            .get("/api/articles/999")
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe("article does not exist");
            });
    });
    test("GET:400 sends an appropriate status and error message when given an invalid id", () => {
        return request(app)
            .get("/api/articles/not-a-article")
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("Bad request");
            });
    });
    describe("PATCH:200 updates an article by id", () => {
        test("When given an object with property inc_votes will increment the votes", () => {
            return request(app)
                .patch("/api/articles/1")
                .send({ inc_votes: 1 })
                .expect(200)
                .then(({ body }) => expect(body.article).toMatchObject({ votes: 101 }));
        });
        test("When given an object with property inc_votes negative will decrement the votes", () => {
            return request(app)
                .patch("/api/articles/1")
                .send({ inc_votes: -100 })
                .expect(200)
                .then(({ body }) => expect(body.article).toMatchObject({ votes: 0 }));
        });
        test("When given an object with property inc_votes negative will decrement the votes allowing negative numbers", () => {
            return request(app)
                .patch("/api/articles/1")
                .send({ inc_votes: -200 })
                .expect(200)
                .then(({ body }) => expect(body.article).toMatchObject({ votes: -100 }));
        });
        test("Should not modify the other properties", () => {
            return request(app)
                .patch("/api/articles/1")
                .send({ inc_votes: 0 })
                .expect(200)
                .then(({ body }) => expect(body.article).toMatchObject({
                    article_id: 1,
                    author: "butter_bridge",
                    title: "Living in the shadow of a great man",
                    body: "I find this existence challenging",
                    topic: "mitch",
                    created_at: "2020-07-09T20:11:00.000Z",
                    votes: 100,
                    article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
                }));
        });
    });
    test("PATCH:404 sends an appropriate status and error message when given a valid but non-existent id", () => {
        return request(app)
            .patch("/api/articles/999")
            .send({ inc_votes: 1 })
            .expect(404)
            .then(({ body }) => expect(body.msg).toBe("article does not exist"));
    });
    describe("PATCH:400 sends an appropriate status and error message", () => {
        test("When given an invalid id", () => {
            return request(app)
                .patch("/api/articles/not-a-article")
                .send({ inc_votes: 1 })
                .expect(400)
                .then(({ body }) => expect(body.msg).toBe("Bad request"));
        });
        test("When given body is not valid", () => {
            return request(app)
                .patch("/api/articles/1")
                .send({ msg: "hi" })
                .expect(400)
                .then(({ body }) => expect(body.msg).toBe("Bad request"));
        });
        test("When body is empty", () => {
            return request(app)
                .patch("/api/articles/1")
                .expect(400)
                .then(({ body }) => expect(body.msg).toBe("Bad request"));
        });
    });
});

describe("/api/articles/:article_id/comments", () => {
    test("GET:200 sends an array of comments for an article to the client", () => {
        return request(app)
            .get("/api/articles/1/comments")
            .expect(200)
            .then(({ body }) => {
                expect(body.comments.length).toBe(11);
                body.comments.forEach(comment => {
                    expect(comment).toMatchObject({
                        comment_id: expect.any(Number),
                        votes: expect.any(Number),
                        created_at: expect.any(String),
                        author: expect.any(String),
                        body: expect.any(String),
                        article_id: expect.any(Number)
                    });
                });
            });
    });
    test("GET:200 when article does not have comments, sends an empty array to the client", () => {
        return request(app)
            .get("/api/articles/2/comments")
            .expect(200)
            .then(({ body }) => expect(body.comments).toEqual([]));
    });
    test("GET:404 sends an appropriate status and error message when given a valid but non-existent article_id", () => {
        return request(app)
            .get("/api/articles/999/comments")
            .expect(404)
            .then(({ body }) => expect(body.msg).toBe("article does not exist"));
    });
    test("GET:400 sends an appropriate status and error message when given an invalid article_id", () => {
        return request(app)
            .get("/api/articles/not-a-article/comments")
            .expect(400)
            .then(({ body }) => expect(body.msg).toBe("Bad request"));
    });
    test("POST:201 creates a new comment to the given to the article and username", () => {
        return request(app)
            .post("/api/articles/1/comments")
            .send({ username: "butter_bridge", body: "test" })
            .expect(201)
            .then(({ body }) => {
                expect(body.comment).toMatchObject({
                    comment_id: expect.any(Number),
                    votes: 0,
                    created_at: expect.any(String),
                    author: "butter_bridge",
                    body: "test",
                    article_id: 1
                });
            });
    });
    describe("POST:404 sends an appropriate status and error message", () => {
        test("When given a valid but non-existent article_id", () => {
            return request(app)
                .post("/api/articles/999/comments")
                .send({ username: "butter_bridge", body: "test" })
                .expect(404)
                .then(({ body }) => expect(body.msg).toBe("article does not exist"));
        });
        test("When given a non-existent username", () => {
            return request(app)
                .post("/api/articles/1/comments")
                .send({ username: "not_a_user", body: "test" })
                .expect(404)
                .then(({ body }) => expect(body.msg).toBe("username does not exist"));
        });
    });
    describe("POST:400 sends an appropriate status and error message", () => {
        test("When given an invalid article_id", () => {
            return request(app)
                .post("/api/articles/not-a-article/comments")
                .send({ username: "butter_bridge", body: "test" })
                .expect(400)
                .then(({ body }) => expect(body.msg).toBe("Bad request"));
        });
        test("When given an invalid request body", () => {
            return request(app)
                .post("/api/articles/1/comments")
                .send({ msg: "hi" })
                .expect(400)
                .then(({ body }) => expect(body.msg).toBe("Bad request"));
        });
        test("When no request body is given", () => {
            return request(app)
                .post("/api/articles/1/comments")
                .expect(400)
                .then(({ body }) => expect(body.msg).toBe("Bad request"));
        });
    });
});

describe("/api/users", () => {
    test("GET:200 sends an array of users to the client", () => {
        return request(app)
            .get("/api/users")
            .expect(200)
            .then(({ body }) => {
                expect(body.users.length).toBe(4);
                body.users.forEach(user => {
                    expect(user).toMatchObject({
                        username: expect.any(String),
                        name: expect.any(String),
                        avatar_url: expect.any(String)
                    })
                });
            });
    });
});

describe("/api/comments/:comment_id", () => {
    test("DELETE:204 delete the given comment by comment_id", () => {
        return request(app)
            .delete("/api/comments/1")
            .expect(204);
    });
    test("DELETE:400 sends an appropriate status and error message when given an invalid comment_id", () => {
        return request(app)
            .delete("/api/comments/not_a_comment_id")
            .expect(400)
            .then(({ body }) => expect(body.msg).toBe("Bad request"));
    });
    test("DELETE:404 sends an unappropriate status and error message when given a non existent comment_id", () => {
        return request(app)
            .delete("/api/comments/999")
            .expect(404)
            .then(({ body }) => expect(body.msg).toBe("comment does not exist"));
    });
});