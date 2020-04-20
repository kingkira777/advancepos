const mysql = require('mysql');



var con;

function Connection(){

    con = mysql.createPool({
        host : 'localhost',
        user : 'root',
        password : 'admin',
        database : 'apos'
    });

    return con;
}

module.exports = Connection();