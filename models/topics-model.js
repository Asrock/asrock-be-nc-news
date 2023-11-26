const db = require("../db/connection")

const notFound = { status: 404, msg: "topic does not exist" };
const badRequest = { status: 400, msg: "Bad request" };

exports.getTopics = () => db
    .query("SELECT * FROM topics")
    .then(({ rows }) => rows);

exports.getTopic = (slug) => db
    .query("SELECT * FROM topics where slug = $1", [slug])
    .then(({ rows }) => rows.length ? rows[0] : Promise.reject(notFound));

exports.createTopic = ({ slug, description, ...invalidKeys }) => {
    if (Object.keys(invalidKeys).length) return Promise.reject(badRequest); //Null checks to avoid not found

    const [columns, params, values] = Object
        .entries({ slug, description })
        .reduce(([columns, params, values], [key, value], index) => [[...columns, key], [...params, `$${++index}`], [...values, value]], [[], [], []])

    return db.query(`INSERT INTO topics (${columns}) VALUES (${params}) RETURNING *`, values)
        .then(({ rows }) => rows[0]);
}