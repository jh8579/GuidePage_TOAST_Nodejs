var express = require('express');
var expressSession = require('express-session');

var fs = require('fs');

var multer = require('multer');
var memoryStorage = multer.memoryStorage();
var formData = multer({
  storage: memoryStorage
});

var mysql      = require('mysql');
var dbconfig   = require('../config/db.js');
var conn = mysql.createConnection(dbconfig);
conn.connect();

var router = express.Router();

router.use(expressSession({
    secret: 'my key',           //이때의 옵션은 세션에 세이브 정보를 저장할때 할때 파일을 만들꺼냐
                                //아니면 미리 만들어 놓을꺼냐 등에 대한 옵션들임
    resave: true,
    saveUninitialized:true
}));

/* GET users listing. */
router.get('', function(req, res, next) {
    res.render('admin_main', { title: 'Home' });
    // if (req.session.user)       //세션에 유저가 있다면
    //     {
    //         res.render('index', { title: 'Home' });
    //     }
    //     else
    //     {
    //         res.redirect('/login');
    //     }
});

router.get('/content', function(req, res, next) {
    var sql = `SELECT name from parts;`;
    sql += `SELECT name from services;`;
    conn.query(sql, function(err, results, fields){
        if(err){
            console.log(err);
        }else{
            console.log(results[0]);
            res.render('add_content', { contentList: results[0], serviceList :results[1] });
        }
    })
});

router.get('/partservice', function(req, res, next) {
    var sql = `SELECT * from parts;`;
    conn.query(sql, function(err, results, fields){
        if(err){
            console.log(err);
        }else{
            console.log(results)
            res.render('add_pns', { partList: results });
        }
    })
});

router.post('/part', function(req, res, next) {
    var partName = req.body.partName;

    var params = [partName];
    var sql = `INSERT INTO parts(name) VALUES(?)`;
    conn.query(sql, params, function(err,rows,fields){
      if(err){
        console.log(err);
      }else{
        console.log(rows);
        res.redirect('/admin')
      }
    })
});

router.post('/service', function(req, res, next) {
    var partName = req.body.partName;
    var serviceName = req.body.serviceName

    var params = [serviceName, partName];
    var sql = `INSERT INTO services(name, part) VALUES(?, ?)`;
    conn.query(sql, params, function(err,rows,fields){
      if(err){
        console.log(err);
      }else{
        console.log(rows);
        res.redirect('/admin')
      }
    })
});

module.exports = router;


