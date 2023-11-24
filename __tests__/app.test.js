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
    describe("GET", () => {
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
    });
    describe("Queries", () => {
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
        describe("/api/articles?sort=&order=    FEATURE REQUEST ", () => {
            describe("GET:200 sends a sorted/ordered array of articles", () => {
                test("When given order set default column to created_at", () => {
                    return request(app)
                        .get("/api/articles?order=asc")
                        .expect(200)
                        .then(({ body }) => expect(body.articles).toBeSortedBy("created_at", { ascending: true }));
                });
                test("When given sort column set default order to desc", () => {
                    return request(app)
                        .get("/api/articles?sort_by=title")
                        .expect(200)
                        .then(({ body }) => expect(body.articles).toBeSortedBy("title", { descending: true }));
                });
                test("When given column and order", () => {
                    return request(app)
                        .get("/api/articles?sort_by=title&order=asc")
                        .expect(200)
                        .then(({ body }) => expect(body.articles).toBeSortedBy("title", { ascending: true }));
                });
                test("When given more than two columns and equal or less orders", () => {
                    return request(app)
                        .get("/api/articles?sort_by=title&order=asc&sort_by=author&order=desc")
                        .expect(200)
                        .then(({ body }) => {
                            const ref = body.articles.map(article => article);
                            const opts = ['en', { numeric: true }];
                            const sorted = body.articles.sort((a, b) => a.title.localeCompare(b.title, ...opts) || b.author.localeCompare(a.author, ...opts));
                            expect(sorted).toEqual(ref)
                        });
                });
                test("Should be compatible with other queries", () => {
                    return request(app)
                        .get("/api/articles?sort_by=title&order=asc&sort_by=author&topic=mitch")
                        .expect(200)
                        .then(({ body }) => {
                            const ref = body.articles.map(article => article);
                            const opts = ['en', { numeric: true }];
                            const sorted = body.articles.sort((a, b) => a.title.localeCompare(b.title, ...opts) || b.author.localeCompare(a.author, ...opts));
                            expect(sorted).toEqual(ref)
                        });
                });
                test("Should be compatible with other queries when using same column names", () => {
                    return request(app)
                        .get("/api/articles?sort_by=topic&order=asc&sort_by=author&topic=mitch")
                        .expect(200)
                        .then(({ body }) => {
                            const ref = body.articles.map(article => article);
                            const opts = ['en', { numeric: true }];
                            const sorted = body.articles.sort((a, b) => a.topic.localeCompare(b.topic, ...opts) || b.author.localeCompare(a.author, ...opts));
                            expect(sorted).toEqual(ref)
                        });
                });
            });
            describe("GET:400 sends an appropriate status and error message when given invalid sort/order query parameters", () => {
                test("When sort_by has duplicated values", () => {
                    return request(app)
                        .get("/api/articles?sort_by=title&sort_by=title")
                        .expect(400)
                        .then(({ body }) => expect(body.msg).toBe("Bad request"));
                });
                test("When sort_by is set and order is not paired with sort_by", () => {
                    return request(app)
                        .get("/api/articles?sort_by=title&order=asc&order=desc")
                        .expect(400)
                        .then(({ body }) => expect(body.msg).toBe("Bad request"));
                });
                test("When sort_by is not one of the columns", () => {
                    return request(app)
                        .get("/api/articles?sort_by=not_a_column")
                        .expect(400)
                        .then(({ body }) => expect(body.msg).toBe("Bad request"));
                });
            });
        });
    });
    describe("POST", () => {
        test("POST:201 creates a new article to the given topic and username", () => {
            return request(app)
                .post("/api/articles")
                .send({
                    author: "butter_bridge",
                    title: "The Rise Of Thinking Machines: How IBM's Watson Takes On The World",
                    body: "Many people know Watson as the IBM-developed cognitive super computer that won the Jeopardy! gameshow in 2011. In truth, Watson is not actually a computer but a set of algorithms and APIs, and since winning TV fame (and a $1 million prize) IBM has put it to use tackling tough problems in every industry from healthcare to finance. Most recently, IBM has announced several new partnerships which aim to take things even further, and put its cognitive capabilities to use solving a whole new range of problems around the world.",
                    topic: "cats",
                    article_img_url: "https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?w=700&h=700"
                })
                .expect(201)
                .then(({ body }) => {
                    expect(body.article).toMatchObject({
                        article_id: 14,
                        author: "butter_bridge",
                        title: "The Rise Of Thinking Machines: How IBM's Watson Takes On The World",
                        body: "Many people know Watson as the IBM-developed cognitive super computer that won the Jeopardy! gameshow in 2011. In truth, Watson is not actually a computer but a set of algorithms and APIs, and since winning TV fame (and a $1 million prize) IBM has put it to use tackling tough problems in every industry from healthcare to finance. Most recently, IBM has announced several new partnerships which aim to take things even further, and put its cognitive capabilities to use solving a whole new range of problems around the world.",
                        topic: "cats",
                        article_img_url: "https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?w=700&h=700",
                        created_at: expect.any(String),
                        votes: 0,
                        comment_count: 0
                    });
                });
        });
        test("POST:201 creates a new article without optional article_img_url key", () => {
            return request(app)
                .post("/api/articles")
                .send({
                    author: "butter_bridge",
                    title: "The Rise Of Thinking Machines: How IBM's Watson Takes On The World",
                    body: "Many people know Watson as the IBM-developed cognitive super computer that won the Jeopardy! gameshow in 2011. In truth, Watson is not actually a computer but a set of algorithms and APIs, and since winning TV fame (and a $1 million prize) IBM has put it to use tackling tough problems in every industry from healthcare to finance. Most recently, IBM has announced several new partnerships which aim to take things even further, and put its cognitive capabilities to use solving a whole new range of problems around the world.",
                    topic: "cats"
                })
                .expect(201)
                .then(({ body }) => {
                    expect(body.article).toMatchObject({
                        article_id: 14,
                        author: "butter_bridge",
                        title: "The Rise Of Thinking Machines: How IBM's Watson Takes On The World",
                        body: "Many people know Watson as the IBM-developed cognitive super computer that won the Jeopardy! gameshow in 2011. In truth, Watson is not actually a computer but a set of algorithms and APIs, and since winning TV fame (and a $1 million prize) IBM has put it to use tackling tough problems in every industry from healthcare to finance. Most recently, IBM has announced several new partnerships which aim to take things even further, and put its cognitive capabilities to use solving a whole new range of problems around the world.",
                        topic: "cats",
                        article_img_url: "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700",
                        created_at: expect.any(String),
                        votes: 0,
                        comment_count: 0
                    });
                });
        });
        describe("POST:422 sends an appropriate status and error message", () => {
            test("When given a non-existent topic", () => {
                return request(app)
                    .post("/api/articles")
                    .send({
                        author: "butter_bridge",
                        title: "The Rise Of Thinking Machines: How IBM's Watson Takes On The World",
                        body: "Many people know Watson as the IBM-developed cognitive super computer that won the Jeopardy! gameshow in 2011. In truth, Watson is not actually a computer but a set of algorithms and APIs, and since winning TV fame (and a $1 million prize) IBM has put it to use tackling tough problems in every industry from healthcare to finance. Most recently, IBM has announced several new partnerships which aim to take things even further, and put its cognitive capabilities to use solving a whole new range of problems around the world.",
                        topic: "not_a_topic"
                    })
                    .expect(422)
                    .then(({ body }) => expect(body.msg).toBe("Unprocessable Entity"));
            });
            test("When given a non-existent username", () => {
                return request(app)
                    .post("/api/articles")
                    .send({
                        author: "not_an_user",
                        title: "The Rise Of Thinking Machines: How IBM's Watson Takes On The World",
                        body: "Many people know Watson as the IBM-developed cognitive super computer that won the Jeopardy! gameshow in 2011. In truth, Watson is not actually a computer but a set of algorithms and APIs, and since winning TV fame (and a $1 million prize) IBM has put it to use tackling tough problems in every industry from healthcare to finance. Most recently, IBM has announced several new partnerships which aim to take things even further, and put its cognitive capabilities to use solving a whole new range of problems around the world.",
                        topic: "cats"
                    })
                    .expect(422)
                    .then(({ body }) => expect(body.msg).toBe("Unprocessable Entity"));
            });
            test("When given an invalid author", () => {
                return request(app)
                    .post("/api/articles")
                    .send({
                        author: 1,
                        title: "The Rise Of Thinking Machines: How IBM's Watson Takes On The World",
                        body: "Many people know Watson as the IBM-developed cognitive super computer that won the Jeopardy! gameshow in 2011. In truth, Watson is not actually a computer but a set of algorithms and APIs, and since winning TV fame (and a $1 million prize) IBM has put it to use tackling tough problems in every industry from healthcare to finance. Most recently, IBM has announced several new partnerships which aim to take things even further, and put its cognitive capabilities to use solving a whole new range of problems around the world.",
                        topic: "cats",
                    })
                    .expect(422)
                    .then(({ body }) => expect(body.msg).toBe("Unprocessable Entity"));
            });
            test("When given an invalid topic", () => {
                return request(app)
                    .post("/api/articles")
                    .send({
                        author: "butter_bridge",
                        title: "The Rise Of Thinking Machines: How IBM's Watson Takes On The World",
                        body: "Many people know Watson as the IBM-developed cognitive super computer that won the Jeopardy! gameshow in 2011. In truth, Watson is not actually a computer but a set of algorithms and APIs, and since winning TV fame (and a $1 million prize) IBM has put it to use tackling tough problems in every industry from healthcare to finance. Most recently, IBM has announced several new partnerships which aim to take things even further, and put its cognitive capabilities to use solving a whole new range of problems around the world.",
                        topic: 1
                    })
                    .expect(422)
                    .then(({ body }) => expect(body.msg).toBe("Unprocessable Entity"));
            });
        });
        describe("POST:400 sends an appropriate status and error message", () => {
            test("When given an invalid request body", () => {
                return request(app)
                    .post("/api/articles")
                    .send({ msg: "hi" })
                    .expect(400)
                    .then(({ body }) => expect(body.msg).toBe("Bad request"));
            });
            test("When no request body is given", () => {
                return request(app)
                    .post("/api/articles")
                    .expect(400)
                    .then(({ body }) => expect(body.msg).toBe("Bad request"));
            });
        });
    });
})

describe("/api/articles/:article_id", () => {
    describe("GET", () => {
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
    });
    describe("PATCH", () => {
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
});

describe("/api/articles/:article_id/comments", () => {
    describe("GET", () => {
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
    });
    describe("POST", () => {
        test("POST:201 creates a new comment to the given article and username", () => {
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
                    .then(({ body }) => expect(body.msg).toBe("user does not exist"));
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
    describe("Queries", () => {
        describe("GET:200 sends an array of comments for an article to the client using pagination", () => {
            test("Should return the same columns when given query limit and p (page)", () => {
                return request(app)
                    .get("/api/articles/1/comments?p=1&limit=3")
                    .expect(200)
                    .then(({ body }) => {
                        expect(body.comments.length).toBe(3);
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
            test("Should return the results based on the limit and page", () => {
                return request(app)
                    .get("/api/articles/1/comments?p=3&limit=2")
                    .expect(200)
                    .then(({ body }) => {
                        expect(body.comments.length).toBe(2);
                        expect(body.comments).toMatchObject([{ comment_id: 6 }, { comment_id: 7 }])
                    });
            });
            test("When p is set and limit does not have value, limit defaults to 10", () => {
                return request(app)
                    .get("/api/articles/1/comments?p=2")
                    .expect(200)
                    .then(({ body }) => {
                        expect(body.comments.length).toBe(1);
                        expect(body.comments).toMatchObject([{ comment_id: 18 }])
                    });
            });
            test("When given page is empty should return empty array", () => {
                return request(app)
                    .get("/api/articles/1/comments?p=200")
                    .expect(200)
                    .then(({ body }) => expect(body.comments).toEqual([]));
            });
        });
        describe("GET:400 sends an appropriate status and error message using pagination", () => {
            test("When given an invalid value to parameter p", () => {
                return request(app)
                    .get("/api/articles/1/comments?p=not_a_number")
                    .expect(400)
                    .then(({ body }) => expect(body.msg).toBe("Bad request"));
            });
            test("When given an invalid value to parameter limit", () => {
                return request(app)
                    .get("/api/articles/1/comments?limit=not_a_number")
                    .expect(400)
                    .then(({ body }) => expect(body.msg).toBe("Bad request"));
            });
            test("When given limit has value of 0", () => {
                return request(app)
                    .get("/api/articles/1/comments?limit=0")
                    .expect(400)
                    .then(({ body }) => expect(body.msg).toBe("Bad request"));
            });
            test("When given page has value of 0", () => {
                return request(app)
                    .get("/api/articles/1/comments?p=0")
                    .expect(400)
                    .then(({ body }) => expect(body.msg).toBe("Bad request"));
            });
        });
    });
});

describe("/api/comments/:comment_id", () => {
    describe("PATCH", () => {
        describe("PATCH:200 updates a comment by id", () => {
            test("When given an object with property inc_votes will increment the votes", () => {
                return request(app)
                    .patch("/api/comments/1")
                    .send({ inc_votes: 1 })
                    .expect(200)
                    .then(({ body }) => expect(body.comment).toMatchObject({ votes: 17 }));
            });
            test("When given an object with property inc_votes negative will decrement the votes", () => {
                return request(app)
                    .patch("/api/comments/1")
                    .send({ inc_votes: -1 })
                    .expect(200)
                    .then(({ body }) => expect(body.comment).toMatchObject({ votes: 15 }));
            });
            test("When given an object with property inc_votes negative will decrement the votes allowing negative numbers", () => {
                return request(app)
                    .patch("/api/comments/1")
                    .send({ inc_votes: -20 })
                    .expect(200)
                    .then(({ body }) => expect(body.comment).toMatchObject({ votes: -4 }));
            });
            test("Should not modify the other properties", () => {
                return request(app)
                    .patch("/api/comments/1")
                    .send({ inc_votes: 0 })
                    .expect(200)
                    .then(({ body }) => expect(body.comment).toMatchObject({
                        comment_id: 1,
                        body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
                        article_id: 9,
                        author: "butter_bridge",
                        votes: 16,
                        created_at: "2020-04-06T12:17:00.000Z",
                    }));
            });
        });
        test("PATCH:404 sends an appropriate status and error message when given a valid but non-existent id", () => {
            return request(app)
                .patch("/api/comments/999")
                .send({ inc_votes: 1 })
                .expect(404)
                .then(({ body }) => expect(body.msg).toBe("comment does not exist"));
        });
        describe("PATCH:400 sends an appropriate status and error message", () => {
            test("When given an invalid id", () => {
                return request(app)
                    .patch("/api/comments/not-a-comment")
                    .send({ inc_votes: 1 })
                    .expect(400)
                    .then(({ body }) => expect(body.msg).toBe("Bad request"));
            });
            test("When given body is not valid", () => {
                return request(app)
                    .patch("/api/comments/1")
                    .send({ msg: "hi" })
                    .expect(400)
                    .then(({ body }) => expect(body.msg).toBe("Bad request"));
            });
            test("When body is empty", () => {
                return request(app)
                    .patch("/api/comments/1")
                    .expect(400)
                    .then(({ body }) => expect(body.msg).toBe("Bad request"));
            });
        });
    });
    describe("DELETE", () => {
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

describe("/api/users/:username", () => {
    test("GET:200 sends a single user to the client", () => {
        return request(app)
            .get("/api/users/butter_bridge")
            .expect(200)
            .then(({ body }) => {
                expect(body.user).toMatchObject({
                    username: "butter_bridge",
                    name: "jonny",
                    avatar_url: "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg"
                })
            });
    });
    test('GET:404 sends an appropriate status and error message when given a valid but non-existent id', () => {
        return request(app)
            .get('/api/users/user')
            .expect(404)
            .then(({ body }) => expect(body.msg).toBe("user does not exist"));
    });
});