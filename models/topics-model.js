const db = require("../db/connection")

const notFound = { status: 404, message: "topic does not exist" };
const badRequest = { status: 400, message: "Bad request" };

exports.getTopics = () => db
    .query("SELECT * FROM topics")
    .then(({ rows }) => rows);

exports.getTopic = (slug) => db
    .query("SELECT * FROM topics where slug = $1", [slug])
    .then(({ rows }) => rows.length ? rows[0] : Promise.reject(notFound));

exports.createTopic = ({ slug, description, ...invalidKeys }) => {
    if (Object.keys(invalidKeys).length) return Promise.reject(badRequest); //Null checks to avoid not found

    return db
        .query(`INSERT INTO topics (slug, description) VALUES ($1, $2) RETURNING *`, [slug, description])
        .then(({ rows }) => rows[0]);
}