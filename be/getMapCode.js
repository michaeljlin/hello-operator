const credentials = require('../cred.js').cred;
const mysql = require('mysql');

const connection = mysql.createConnection(credentials);

const db = {};

db.queryDBforMapCode = new Promise(function (resolve, reject) {
    connection.connect(() => {
        connection.query(
            `SELECT * FROM mapCode where MapID = 1;`
            , function (err, results, fields) {
                const output = {
                    success: !err,
                    data: results,
                    error: err ? err : 'No Errors',
                };
                resolve(output);
            }
        );
    });
});


module.exports = db;