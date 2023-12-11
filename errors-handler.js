exports.apiErrorHandler = (err, _, res, next) => {
    return err.status ? res.status(err.status).send({ message: err.message }) : next(err);
}

exports.sqlErrorHandler = (err, _, res, next) => {
    if (!err.code) return next(err);

    /* Jest create the tables and seed before, therefore this is required to check when
    databases and tables are created under develoment enviroment */
    switch (err.code) {
        case "23505": //duplicate key value violates unique constraint
            return res.status(409).send({ message: `${err.detail.match(/=\((\w+)\)/)[1]} already exists` });
        case "23503": //insert/update violates foreign key constraint
            return res.status(422).send({ message: `${err.detail.match(/=\((\w+)\)/)[1]} cannot be processed` });
        case "42P01": //Table does not exist
        case "3D000": //DB does not exist
            return res.status(500).send({ message: "Database error" });
        default: return res.status(400).send({ message: "Bad request" });
    }
}

exports.errorHandler = (err, _, res, next) => res.status(500).send({ message: 'Internal error' });