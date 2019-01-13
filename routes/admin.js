var express = require('express');

var fs = require('fs');
var mkdirp = require('mkdirp');

var multer = require('multer');
var memoryStorage = multer.memoryStorage();
var formData = multer({
    storage: memoryStorage
});

var mysql = require('mysql');
var dbconfig = require('../config/db.js');
var conn = mysql.createConnection(dbconfig);
conn.connect();

var router = express.Router();

// 가이드 페이지 홈
router.get('', function (req, res, next) {
    if (req.session.authId)       //세션에 유저가 있다면
    {
        res.render('admin_main', { title: 'Home' });
    }
    else {
        res.redirect('/login');
    }
});

// 파트 및 서비스 추가 페이지
router.get('/addPS', function (req, res, next) {
    if (req.session.authId)       //세션에 유저가 있다면
    {

    }
    else {
        res.redirect('/login');
    }

    var sql = `SELECT * from parts;`;
    sql += `SELECT * from services;`;
    conn.query(sql, function (err, results, fields) {
        if (err) {
            console.log(err);
        } else {
            console.log(results[0]);
            res.render('add_pns', { partList: results[0], serviceList: results[1] });
        }
    })
});

// 파트 및 서비스 수정 페이지
router.get('/modifyPS', function (req, res, next) {
    if (req.session.authId)       //세션에 유저가 있다면
    {

    }
    else {
        res.redirect('/login');
    }

    var sql = `SELECT * from parts;`;
    sql += `SELECT * from services;`;
    conn.query(sql, function (err, results, fields) {
        if (err) {
            console.log(err);
        } else {
            console.log(results[0]);
            res.render('modify_pns', { contentList: results[0], serviceList: results[1] });
        }
    })
});

// 파트 및 서비스 삭제 페이지
router.get('/deletePS', function (req, res, next) {
    if (req.session.authId)       //세션에 유저가 있다면
    {

    }
    else {
        res.redirect('/login');
    }

    var sql = `SELECT * from parts;`;
    sql += `SELECT * from services;`;
    conn.query(sql, function (err, results, fields) {
        if (err) {
            console.log(err);
        } else {
            console.log(results[0]);
            res.render('delete_pns', { contentList: results[0], serviceList: results[1] });
        }
    })
});

// 파트 추가 수행
router.post('/part', formData.array('file'), function (req, res, next) {
    var partName = req.body.partName;

    var params = [partName];
    var sql = `INSERT INTO parts(name) VALUES(?)`;
    conn.query(sql, params, function (err, rows, fields) {
        if (err) {
            console.log(err);
        } else {
            console.log(rows);
            res.redirect('/admin')
        }
    })
});

// 파트 수정 수행
router.post('/changePart', formData.array('file'), function (req, res, next) {
    var partName = req.body.partName;
    var orgPartId = partName[0]
    var chgPartName = partName[1]

    var params = [chgPartName, orgPartId];
    var sql = `UPDATE parts SET name = ? WHERE id=?`;
    conn.query(sql, params, function (err, rows, fields) {
        if (err) {
            console.log(err);
        } else {
            console.log(rows);
            res.redirect('/admin')
        }
    })
});

// 파트 삭제 수행
router.post('/deletePart', formData.array('file'), function (req, res, next) {
    var partId = req.body.partName;

    var params = [partId];
    var sql = `DELETE FROM parts WHERE id=?`;
    conn.query(sql, params, function (err, rows, fields) {
        if (err) {
            console.log(err);
        } else {
            console.log(rows);
            res.redirect('/admin')
        }
    })
});

// 서비스 추가 수행
router.post('/service', formData.array('file'), function (req, res, next) {
    var serviceName = req.body.serviceName
    var partId = req.body.partName;

    var params = [serviceName, partId];
    var sql = `INSERT INTO services(name, part) VALUES(?, ?)`;
    conn.query(sql, params, function (err, rows, fields) {
        if (err) {
            console.log(err);
        } else {
            console.log(rows);
            res.redirect('/admin')
        }
    })
});

// 서비스 수정 수행
router.post('/changeService', formData.array('file'), function (req, res, next) {
    var selectService = req.body.selectService;
    var changeName = req.body.serviceName;

    service = selectService.split('&');
    var serviceId = service[0];
    var serviceName = service[1];

    var params = [changeName, serviceId];
    var sql = `UPDATE services SET name = ? WHERE id=?`;
    conn.query(sql, params, function (err, rows, fields) {
        if (err) {
            console.log(err);
        } else {
            console.log(rows);
            res.redirect('/admin')
        }
    })
});

// 서비스 삭제 수행
router.post('/deleteService', formData.array('file'), function (req, res, next) {
    var selectService = req.body.selectService;
    var changeName = req.body.serviceName;

    service = selectService.split('&');
    var serviceId = service[0];
    var serviceName = service[1];

    var params = [serviceId];
    var sql = `DELETE FROM services WHERE id=?`;
    conn.query(sql, params, function (err, rows, fields) {
        if (err) {
            console.log(err);
        } else {
            console.log(rows);
            res.redirect('/admin')
        }
    })
});

// 컨텐츠 추가 페이지
router.get('/addContent', function (req, res, next) {
    if (req.session.authId)       //세션에 유저가 있다면
    {

    }
    else {
        res.redirect('/login');
    }

    var sql = `SELECT * from parts;`;
    sql += `SELECT * from services;`;
    conn.query(sql, function (err, results, fields) {
        if (err) {
            console.log(err);
        } else {
            console.log(results[0]);
            res.render('add_content', { contentList: results[0], serviceList: results[1] });
        }
    })
});

// 컨텐츠 수정 페이지
router.get('/modifyContent', function (req, res, next) {
    if (req.session.authId)       //세션에 유저가 있다면
    {

    }
    else {
        res.redirect('/login');
    }

    var sql = `SELECT * from parts;`;
    sql += `SELECT * from services;`;
    sql += `SELECT * from contents;`;
    conn.query(sql, function (err, results, fields) {
        if (err) {
            console.log(err);
        } else {
            console.log(results[0]);
            res.render('modify_content', { contentList: results[0], serviceList: results[1], docList: results[2] });
        }
    })
});

// 컨텐츠 삭제 페이지
router.get('/deleteContent', function (req, res, next) {
    if (req.session.authId)       //세션에 유저가 있다면
    {

    }
    else {
        res.redirect('/login');
    }

    var sql = `SELECT * from parts;`;
    sql += `SELECT * from services;`;
    sql += `SELECT * from contents;`;
    conn.query(sql, function (err, results, fields) {
        if (err) {
            console.log(err);
        } else {
            console.log(results[0]);
            res.render('delete_content', { contentList: results[0], serviceList: results[1], docList: results[2] });
        }
    })
});

// 컨텐츠 추가 수행
router.post('/addContent', formData.array('file'), function (req, res, next) {
    var partName = req.body.selectPart;
    var contentName = req.body.contentName;
    var contentText = req.body.contentText;
    var service = req.body.selectService;

    service = service.split('&');
    var serviceId = service[0];
    var serviceName = service[1];

    console.log(req.body)
    console.log(partName)
    console.log(service);
    console.log(serviceId)
    console.log(serviceName)
    console.log(contentName)

    var showdown = require('showdown')
    showdown.extension('codeButtonBar', function () {
        var matches = [];
        var result = '<button name="';
        return [
            {
                type: 'lang',
                regex: /%github%([^]+?)%end%/gi,
                replace: function (s, match) {
                    console.log(match)
                    matches.push(match);

                    var init = ""
                    var codeList = matches[0].split("\n");
                    codeList.pop();

                    var codeName = codeList[0];
                    for (var i = 1; i < codeList.length; i++) {
                        var value = codeList[i].split(" ")
                        var lang = value[0];
                        var gitURL = value[1];
                        
                        init += result;
                        init += lang;
                        init += '" onclick="getGithubCode(this,\''
                        init += codeName
                        init += '\')" value="'
                        init += gitURL;
                        init += '">';
                        init += lang;
                        init += '</button>'
                        init += ''
                    }
                    init += '<button name="'
                    init += codeName
                    init += '" onclick="copyToClipboard(this)">Copy</button>'
                    init += '<textarea style="display:none" id="'
                    init += "temp_" + codeName
                    init += '" class=""></textarea>'
                    init += '<pre><code id="'
                    init += codeName
                    init += '" name="codeArea"></code></pre>'
                    matches = [];   //reset array
                    return init;
                }
            }
        ];
    });

    var converter = new showdown.Converter({ tables: true, ghCodeBlocks: true, simpleLineBreaks: true, extensions: ['codeButtonBar'] }),
        text = contentText,
        html = converter.makeHtml(contentText);

    var path = "./views/guide/" + partName + "/" + serviceName;
    var md_filename = contentName + '.md';
    var ejs_filename = contentName + '.ejs';
    var md_filepath = path + "/" + md_filename;
    var ejs_filepath = path + "/" + ejs_filename;

    console.log(md_filepath)
    console.log(ejs_filepath)

    mkdirp(path, { recursive: true }, (err) => {
        if(err){
            console.log(err);
        }
        fs.writeFile(md_filepath, text, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("MD file was saved!");
            }
        });
        fs.writeFile(ejs_filepath, html, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Html file was saved!");
            }
        });

        var params = [contentName, serviceId];
        var sql = `INSERT INTO contents(name, service) VALUES(?, ?)`;
        conn.query(sql, params, function (err, rows, fields) {
            if (err) {
                console.log(err);
            } else {
                console.log(rows);
                res.redirect('/admin')
            }
        })
    });
});

// 컨텐츠 수정 수행
router.post('/modifyContent', formData.array('file'), function (req, res, next) {
    var partName = req.body.selectPart;
    var service = req.body.selectService;
    var content = req.body.selectContent;
    var contentText = req.body.contentText;
    var changeContentName = req.body.changeName;

    service = service.split('&');
    var serviceId = service[0];
    var serviceName = service[1];

    content = content.split('&');
    var contentId = content[0];
    var contentName = content[1];

    var showdown = require('showdown')
    showdown.extension('codeButtonBar', function () {
        var matches = [];
        var result = '<button name="';
        return [
            {
                type: 'lang',
                regex: /%github%([^]+?)%end%/gi,
                replace: function (s, match) {
                    console.log(match)
                    matches.push(match);

                    var init = ""
                    var codeList = matches[0].split("\n");
                    codeList.pop();

                    var codeName = codeList[0];
                    for (var i = 1; i < codeList.length; i++) {
                        var value = codeList[i].split(" ")
                        var lang = value[0];
                        var gitURL = value[1];
                        
                        init += result;
                        init += lang;
                        init += '" onclick="getGithubCode(this,\''
                        init += codeName
                        init += '\')" value="'
                        init += gitURL;
                        init += '">';
                        init += lang;
                        init += '</button>'
                        init += ''
                    }
                    init += '<button name="'
                    init += codeName
                    init += '" onclick="copyToClipboard(this)">Copy</button>'
                    init += '<textarea style="display:none" id="'
                    init += "temp_" + codeName
                    init += '" class=""></textarea>'
                    init += '<pre><code id="'
                    init += codeName
                    init += '" name="codeArea"></code></pre>'
                    matches = [];   //reset array
                    return init;
                }
            }
        ];
    });

    var converter = new showdown.Converter({ tables: true, ghCodeBlocks: true, simpleLineBreaks: true, extensions: ['codeButtonBar'] }),
        text = contentText,
        html = converter.makeHtml(contentText);

    var path = "./views/guide/" + partName + "/" + serviceName;
    var md_filename = '';
    var ejs_filename = '';
    if(!changeContentName){
        md_filename = contentName + '.md';
        ejs_filename = contentName + '.ejs';
    }else{
        md_filename = changeContentName + '.md';
        ejs_filename = changeContentName + '.ejs';
    }
    var md_filepath = path + "/" + md_filename;
    var ejs_filepath = path + "/" + ejs_filename;

    console.log(md_filepath)
    console.log(ejs_filepath)

    mkdirp(path, { recursive: true }, (err) => {
        if (err) throw err;
        fs.writeFile(md_filepath, text, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("MD file was saved!");
            }
        });
        fs.writeFile(ejs_filepath, html, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Html file was saved!");
            }
        });

        var params = [changeContentName, contentId];
        var sql = `UPDATE contents SET name = ? WHERE id=?`;
        conn.query(sql, params, function (err, rows, fields) {
            if (err) {
                console.log(err);
            } else {
                console.log(rows);
                res.redirect('/admin')
            }
        })
    });
});

// 컨텐츠 수정시 해당 마크다운 데이터 전송
router.post('/sendContent', formData.array('file'), function (req, res, next) {
    var partName = req.body.partName;
    var serviceName = req.body.serviceName;
    var contentName = req.body.contentName;


    console.log(partName);
    console.log(serviceName);
    console.log(contentName);

    var file_path = "./views/guide/" + partName + "/" + serviceName + "/" + contentName + ".md"
    var html_data = fs.readFileSync(file_path, 'utf8');

    res.send(html_data)
});

// 컨텐츠 삭제 수행
router.post('/deleteContent', formData.array('file'), function (req, res, next) {
    var content = req.body.selectContent;
    content = content.split('&');
    var contentId = content[0];
    var contentName = content[1];

    var params = [contentId];
    var sql = `DELETE FROM contents WHERE id=?`;
    conn.query(sql, params, function (err, rows, fields) {
        if (err) {
            console.log(err);
        } else {
            console.log(rows);
            res.redirect('/admin')
        }
    })
});

module.exports = router;


