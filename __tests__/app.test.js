const request = require("supertest");
const app = require("../app.js")
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const data = require("../db/data/test-data/index.js");


beforeEach(() => seed(data));
afterAll(() => db.end());

describe("/api", () => {
    const endpoints = app._router.stack
        .filter(({route}) => route)
        .map(({route})=> `${Object.keys(route.methods)?.[0].toUpperCase()} ${route.path}`);

    test("GET:200 sends an object describing all the endpoints availables to the client", () => {
        return request(app)
            .get("/api")
            .expect(200)
            .then(({body}) => {
                expect(Object.keys(body).length).toBe(endpoints.length);
                endpoints.forEach(endpoint => {
                    expect(typeof body[endpoint].description).toBe("string");
                })
            });
    });
});

describe("/api/topics", () => {
    test("GET:200 sends an array of topics to the client", () => {
        return request(app)
            .get("/api/topics")
            .expect(200)
            .then(({body}) => {
                expect(body.topics.length).toBe(3);
                body.topics.forEach(topic => {
                    expect(typeof topic.slug).toBe("string");
                    expect(typeof topic.description).toBe("string");
                });
            });
    });
});