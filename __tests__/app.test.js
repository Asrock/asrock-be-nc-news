const request = require("supertest");
const app = require("../app.js")
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const data = require("../db/data/test-data/index.js");
const endpointInfo = require("../endpoints.json")

//Shorthand function
const expectAnyOrNull = (sample) => expect.toBeOneOf([expect.any(sample), null]);

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
                        description: expectAnyOrNull(String)
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
                        created_at: expectAnyOrNull(String),
                        votes: expect.any(Number),
                        article_img_url: expectAnyOrNull(String),
                        comment_count: expect.any(Number)
                    });
                });
                expect(body.articles).toBeSortedBy("created_at", { ascending: true });
            });
    });
});

describe("/api/articles/:article_id", () => {
    test("GET:200 sends a single article to the client", () => {
        return request(app)
            .get('/api/articles/1')
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
    test('GET:404 sends an appropriate status and error message when given a valid but non-existent id', () => {
        return request(app)
            .get('/api/articles/999')
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe('article does not exist');
            });
    });
    test('GET:400 sends an appropriate status and error message when given an invalid id', () => {
        return request(app)
            .get('/api/articles/not-a-article')
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('Bad request');
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
                console.log(body.comments)
                body.comments.forEach(comment => {
                    expect(comment).toMatchObject({
                        comment_id: expect.any(Number),
                        votes: expect.any(Number),
                        created_at: expectAnyOrNull(String),
                        author: expect.any(String),
                        body: expect.any(String),
                        article_id: expect.any(Number)
                    });
                });
            });
    });
    test('GET:404 sends an appropriate status and error message when given a valid but non-existent id', () => {
        return request(app)
            .get('/api/articles/999/comments')
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe('comments does not exist');
            });
    });
    test('GET:400 sends an appropriate status and error message when given an invalid id', () => {
        return request(app)
            .get('/api/articles/not-a-article/comments')
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('Bad request');
            });
    });
});

