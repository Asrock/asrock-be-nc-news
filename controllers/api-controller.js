const endpointsInfo = require("../endpoints.json")
exports.getEndpointsInfo = (_, res) => res.status(200).send(endpointsInfo);