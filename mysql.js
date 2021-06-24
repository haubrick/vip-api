const mysql = require('mysql');

var pool = mysql.createPool({
    "user": "root",
    "password": "",
    "database": "vip_bd",
    "port": 3306
});

exports.pool = pool;