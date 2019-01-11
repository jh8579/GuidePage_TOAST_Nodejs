var express = require('express');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);

var mysql = require('mysql');
var dbconfig = require('../config/db.js');
var conn = mysql.createConnection(dbconfig);
conn.connect();

var multer = require('multer');
var memoryStorage = multer.memoryStorage();
var formData = multer({
  storage: memoryStorage
});

var app_key = require('../config/email.js').app_key

var router = express.Router();

router.use(session({                    // MySQL에 세션 값 저장
  secret: '12sdfwerwersdfserwerwef',    // 랜덤값
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60    // 쿠키 유효기간 1시간
  }
}));

var options = require('../config/db.js');
var sessionStore = new MySQLStore(options);

// 가이드 페이지 리다이렉트
router.get('', function (req, res, next) {
  console.log(app_key)
  res.redirect('/guide')
});

// 로그인 홈페이지 출력
router.get('/login', formData.array('file'), function (req, res, next) {
  res.render('login');
});

// 비밀번호 찾기 출력
router.get('/findPassword', formData.array('file'), function (req, res, next) {
  res.render('find_password');
});

// 인증 페이지 출력
router.post('/auth', formData.array('file'), function (req, res, next) {
  var email = req.body.username;

  function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 8; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    //POST
    var request = require('request');

    // 헤더 부분
    var headers = {
      'Content-Type': 'application/json;charset=UTF-8'
    }

    var email_url = "https://api-mail.cloud.toast.com/email/v1.4/appKeys/"
    email_url += app_key;
    email_url += "/sender/auth-mail"

    // 요청 세부 내용
    var options = {
      url: email_url,
      method: 'POST',
      headers: headers,
      json: {
        'senderAddress': 'jinho.huh@nhnent.com',
        'templateId': 'authEmail',
        'receiver': {
          'receiveMailAddr': email,
          'templateParameter': {
            "auth_code": text
          }
        }
      }
    }

    // 요청 시작 받은값은 body
    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body)
      }
    })

    return text;
  }

  var code = makeid();
  var params = [code, email]
  var sql = `UPDATE users SET code=? WHERE email=?`;
  conn.query(sql, params, function (err, results, fields) {
    if (err) {
      console.log(err);
    } else {
      res.render('auth', { 'email': email });
    }
  })
});

// 인증 페이지 출력
router.post('/password', formData.array('file'), function (req, res, next) {
  var email = req.body.username;
  var code = req.body.code;

  var params = [code, email]
  var sql = `SELECT * FROM users WHERE code=? AND email=?`;
  conn.query(sql, params, function (err, results, fields) {
    if (err) {
      console.log(err);
      res.render('auth', { 'email': email });
    } else {
      if(results.length > 0){
        res.render('change_password', { 'email': email });
      }
    }
  })
});

// 인증 페이지 출력
router.post('/changePassword', formData.array('file'), function (req, res, next) {
  var email = req.body.username;
  var password1 = req.body.password1;
  var password2 = req.body.password2;

  if (password1 != password2) {
    res.render('change_password', { 'email': email });
  } else {
    var params = [password1, email]
    var sql = `UPDATE users SET password=? WHERE email=?`;
    conn.query(sql, params, function (err, results, fields) {
      if (err) {
        console.log(err);
      } else {
        res.redirect('/login')
      }
    })
  }
});

// 로그인 수행
router.post('/login', formData.array('file'), function (req, res, next) {
  var email = req.body.username;
  var password = req.body.password;

  var params = [email, password]
  var sql = `SELECT * from users WHERE email=? AND password=?`;
  conn.query(sql, params, function (err, results, fields) {
    if (err) {
      console.log(err);
      res.redirect('/login')
    } else {
      if (results.length > 0) {
        req.session.authId = email
        req.session.save(function () {
          res.redirect('/admin')
        });
      }
    }
  })
});

// 로그아웃 수행
router.post('/logout', function (req, res, next) {
  delete req.session.authId;
  req.session.save(function () {
    res.redirect('/login');
  });
});

module.exports = router;