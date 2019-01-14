var express = require('express');

var fs = require('fs');

var multer = require('multer');
var memoryStorage = multer.memoryStorage();
var formData = multer({
  storage: memoryStorage
});

var mysql = require('mysql');
var dbconfig = require('../config/db.js');
var conn = mysql.createConnection(dbconfig);

var router = express.Router();

// 가이드 페이지 토스트 소개 페이지로 redirect
router.get('', function(req, res, next) {
  res.redirect('/guide/TOAST/TOAST/overview')
});

// 가이드 페이지 목차 데이터 가공 및 전송
router.get('/:part/:service/:content', function (req, res, next) {
  var part = req.params.part;
  var service = req.params.service;
  var content = req.params.content;

  var file_path = "./views/guide/" + part + "/" + service + "/" +content +".ejs"
  var html_data = fs.readFileSync(file_path, 'utf8');

  var sql = `SELECT *, name FROM parts;`;
  sql += `SELECT * FROM services;`;
  sql += `SELECT * FROM contents;`;
  conn.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err);
    } else {
      var data = [];
      for (var i = 0; i < results[0].length; i++) {
        var temp_part = {}
        temp_part["id"] = results[0][i].id;
        temp_part["name"] = results[0][i].name;
        temp_part["service"] = [];
        data[i] = temp_part;
      }

      service_list = [];
      for (var i = 0; i < results[1].length; i++) {
        var temp_service = {}
        temp_service["id"] = results[1][i].id
        temp_service["part"] = results[1][i].part
        temp_service["name"] = results[1][i].name
        temp_service["content"] = []

        for(var j=0; j<results[2].length; j++){
          if(results[2][j].service == temp_service["id"]){
            temp_service["content"].push(results[2][j].name)
          }
        }
        service_list.push(temp_service)
      }

      for (var i = 0; i < service_list.length; i++) {
        for(var j=0; j<data.length; j++){
          if(data[j].id == service_list[i].part){
            data[j].service.push(service_list[i])
          }
        }
      }
      console.log(data[7]["service"]);
      res.render('menu', { "data" : data, "html_data" : html_data})
    }
  })
});

module.exports = router;
