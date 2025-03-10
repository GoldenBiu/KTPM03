const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'mysql-b20d932-thuanbill2k22-144c.i.aivencloud.com',
    port: '22350',
    user: 'avnadmin',
    password: 'AVNS_6K_jK3EO-MTPnyTAG7J', // Thay bằng mật khẩu của bạn
    database: 'TravelJourneyDB'
});

connection.connect((err) => {
    if (err) {
        console.error('Lỗi kết nối MySQL: ' + err.stack);
        return;
    }
    console.log('Đã kết nối MySQL rồi đó');
});

module.exports = connection.promise();;