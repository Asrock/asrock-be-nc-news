exports.apiErrorHandler = ({statusCode, msg, ...err}, req, res, next) => {
    return statusCode ? res.status(statusCode).send({ msg }) : next(err);
};

exports.sqlErrorHandler = (err, _, res, next) => {
    if (!err.code) return next(err);

    /* Jest create the tables and seed before, therefore this is required to check when
    databases and tables are created under develoment enviroment */
    switch (err.code) {
        case '42P01': //Table does not exist
        case '3D000': //DB does not exist
            return res.status(500).send({msg: "database error"});
        default: return res.status(400).send({ msg: 'Bad request' });
    }
};

exports.errorHandler = (err, _, res, next) => {    
    res.status(500).send({ msg: 'Internal error' }) && console.log("UNHANDLED ERROR", err);
}