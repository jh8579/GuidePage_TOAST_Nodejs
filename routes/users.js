var express = require('express');
var router = express.Router();

var mysql      = require('mysql');
var dbconfig   = require('../config/db.js');
var conn = mysql.createConnection(dbconfig);
conn.connect();

var multer = require('multer');
var memoryStorage = multer.memoryStorage();
var formData = multer({
  storage: memoryStorage
});

// 로그인 홈페이지 출력
router.get('/login', formData.array('file'), function(req, res, next) {
  res.render('login');
});

// 로그인 수행
router.post('/login', formData.array('file'), function(req, res, next) {
  var email = req.body.username;
  var password = req.body.password;
  
  var params = [email, password]
  var sql = `SELECT * from users WHERE email=? AND password=?`;
  conn.query(sql, params, function(err, results, fields){
    if(err){
      console.log(err);
      res.redirect('/login')
    }else{
      console.log(results);
      res.redirect('/admin')
    }
  })
});

// 회원가입 API
router.get('/', function(req, res, next) {
  var sql = `SELECT * FROM users WHERE name='허진호'`;
  conn.query(sql, function(err,rows,fields){
    if(err){
      console.log(err);
    }else{
      console.log(rows);
      res.render('index', { title: 'title' });
    }
  })
});



module.exports = router;
