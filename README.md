# TOAST 사용자 가이드 페이지

# 차례

* 설계
* 백앤드
* 프론트앤드 (가이드 페이지)
* Log & Crash
* 프론트앤드 (관리자 페이지)
* 빌드 및 배포
* 시연

## 주제

### 동적으로 관리 가능한 사용자 가이드 페이지 구현

## 일정 및 기간

- 총 3주 진행
    - 1주차: 기획 및 역할 분담
    - 2주차: 구현
    - 3주차: 버그 수정, 기능 보완

## 개발 환경

### 인프라
* 계정 명 - irteam
* WEB Server - nginx 1.4.0
* WAS Server - node v11.6.0
* npm 6.5.0

## DB
Mysql RDS

## Framework
Nodejs Express

### IDE
* VS Code
* Mysql Workbench

## 요구사항

> 1. 동적으로 관리 가능해야 한다.
> 2. TOAST 서비스를 이용해야 한다.
> 3. 샘플코드를 언어별로 사용자 편의에 맞게 보여주어야 한다.  

## 역할 분담

* 이한결 - 프론트앤드 개발, 웹디자인, Log & Crash 적용
* 임기봉 - 인프라, 프론트앤드 개발 및 Deploy 적용
* 허진호 - 백앤드 개발 및 Notification 적용

# 설계

## 아키텍처

![Infra.jpg](/files/2392203473443741226)

### WEB Server Compile 설치

* Log & Crash 서비스에서 Client IP를 확인하기 위해 http_realip_module을 설치
* NGINX 설치 폴더를 지정하여 효율적으로 관리
```
$sudo ./configure --with-http_ssl_module --with-debug --with-http_realip_module --prefix=/usr/local/nginx --user=irteam
```
### WEB Server 로써 NGINX vs Apache 비교
|  | **Nginx** | **Apache** |
| ---- | ---- | ---- | 
| 요청 처리 방식 | Event Driven<br/>이벤트가 발생할 때마다 비동기로 처리 | MPM<br/>하나의 요청 당 프로세스 혹은 쓰레드가 처리 | 

### ```WEB Server 로 NGINX를 선택한 이유!```
* NGINX가 Apache보다 적은 수의 쓰레드를 사용하여, 메모리 사용량이 적음

## 주요 기능

### 페이지 구성
```
* 홈(가이드 홈으로 리다이렉트)
* 가이드 페이지
* 관리자 페이지
```
## 프레임워크 선택

* ### Java Spring
    * 구성 - JAVA Servlet + MVC 패턴 + 라이브러리
    * 자유도가 낮지만 안정성은 높다.
    * 스크립트 언어에 비해 배포가 까다롭다(소스코드 복사 or war 파일 )
    * 많은 NHN 서비스가 사용 중이기 때문에 추가적인 관리 요소 감소
* ### Nodejs Express
    * 구성 - Javascript + V8 엔진 + 오픈소스 프레임웍 및 라이브러리
    * Javascript 특성상 자유도 높다.
    * 프론트앤드와 백앤드를 같은 개발 언어로 개발
* ### Python Django
    * 구성 - Python + MVC 패턴 + ORM + 라이브러리
    * DB 관리도 장고 소스코드 프로젝트에서 관리

### ```Nodejs를 선택한 이유!```

* Nodejs와 비교하여 Java로 웹 개발을 하는 것이 미숙함
* 프론트앤드와 백앤드를 같은 언어로 개발할 수 있다는 장점
* html과 거의 같은 구조에 동적으로 data를 용이하게 사용할 수 있는 ejs 형식을 쉽게 적용할 수 있다는 장점

## DB 선택

### SQL, NoSQL 중에 ```SQL 선택!```
* 필요한 데이터 형식이 Part, Service, Content로 정형화되어있고 해당 요소 모두 필요한 컬럼들이 정해져 있음
* 서비스마다 달라지는 Content 내용에 경우 파일로 저장하기 때문에 DB에서 동적으로 바뀌는 요소들이 없음.

### ```TOAST RDS for MySQL 선택!```

### users Table

|  | type | 내용 |
| :---: | :---: | :---: |
| id | int | User ID |
| type | char | User 타입(admin, client) |
| email | char | User ID, email |
| password | char | User password |
| name | char | User 이름 |
| phone | char | User 휴대폰번호 |
| code | char | 비밀번호 찾기시 참조할 코드 |

### parts Table

| col | type | 내용 |
| :---: | :---: | :---: |
| id | int | Part ID |
| name | char | Part 이름 |

### services Table

| col | type | 내용 |
| :---: | :---: | :---: |
| id | int | Service ID |
| name | char | Service 이름 |
| part | int | 해당 서비스가 속해 있는 Part ID(Foriegn Key 지정) |

### contents Table

| col | type | 내용 |
| :---: | :---: | :---: |
| id | int | Content가 ID |
| name | char | Content가 이름 |
| service | int | 해당 Content가 속해 있는 Service ID(Foriegn Key 지정) |

### sessions Table

* Nodejs 연동시 자동 생성

| col | type | 내용 |
| :---: | :---: | :---: |
| session_id | char | 세션 ID |
| expires | int | 세션 만료 시간 |
| data | text | 세션 Data |

## Markdown HTML 변환 모듈

### Read the Docs - MkDocs
* 파일이나 github 에 특정 형식(reStructuredText, Markdown)으로 작성하면 그것을 .html 로 변환해서 hosting
* Python pip로 제공
### Showdown 모듈
* 마크다운으로 작성된 String data를 html 형식으로 변환
* Extension을 이용하여 Custom Extension을 이용하여 나만의 마크다운 문법을 만들 수 있음
* npm으로 제공

### ```Showdown을 선택한 이유!```
* npm으로 제공되기 때문에 Nodejs 연동 용이
* Custom Extension으로 나만의 마크다운 문법 생성 가능

## Log 관리

### 각 서버에 filebeat 설치

- Logstash의 메모리 부담을 줄여줌
- Filebeat가 로그 데이터를 수집, 정제하고, Logstash가 Log&Crash로 전달하는 역할

### Redis로 메세징 큐

- 구성 및 이중화 후, logstash, Log&Crash와 정상적인 연동까지 확인
- 보안 침해로 인한 인스턴스 삭제 조치 -> 잘못된 경로의 다운로드가 원인인 것으로 추정

# 백앤드

## 사용한 모듈

```
    "body-parser": "^1.18.3",
    "cookie-parser": "~1.4.3",
    "debug": "~2.6.9",
    "ejs": "~2.5.7",
    "express": "~4.16.0",
    "express-mysql-session": "^2.1.0",
    "express-session": "^1.15.6",
    "http-errors": "~1.6.2",
    "morgan": "~1.9.0",
    "multer": "^1.4.1",
    "mysql": "^2.16.0",
    "request": "^2.88.0",
    "showdown": "^1.9.0",
    "showdown-prettify": "^1.3.0",
    "showdown-table": "^1.0.1"
```

### 기본 모듈

express - 웹 및 모바일 어플리케이션을 위한 웹 애플리케이션 프레임워크
body-parser - POST 처리를 위한 모듈
cookie-parser - http로 요청한 클라이언트 쿠키 정보에 접근하기 위한 모듈
ejs - html 대신 ejs를 사용하기 위한 모듈
multer - 파일 처리를 위한 모듈
morgan - http 리퀘스트에 대해 로깅하는 모듈
http-errors express에 에러를 생성하는 모듈
debug - express가 내부적으로 이 모듈을 사용하여 여러 정보를 로깅

### 세션 처리

express-session - 세션 처리를 위한 모듈
express-mysql-session - 세션 정보를 mysql db에 저장하기 위한 모듈

### 서버에서 POST 전송

request 모듈 - 비밀번호 찾기 서비스에서 Notification 사용을 위한 모듈

### 마크다운 HTML 변환

```showdown 모듈 - 마크다운으로 작성된 텍스트를 HTML 형식으로 변환```

```
var converter = new showdown.Converter({ tables: true }),       // 마크다운 표 적용 위한 옵션 값 추가
        text = contentText,
        html = converter.makeHtml(contentText);
```

## 설정 파일

외부에 함부로 노출되면 안되는 DB정보나 App Key 같은 정보는 conf 폴더에 따로 보관하여 Git에 추가하지 않음

### DB 설정

```
module.exports = {
    host     : ' DB IP 주소',
    user     : 'DB 사용자 계정',
    password : 'DB 비밀번호',
    port     : DB 사용 포트,
    database : 'DB 이름',
    multipleStatements : true       // 다수의 쿼리 허용
  };
```

### Notification App Key

```
module.exports = {
    app_key : "***********"     // Notification App Key
}
```

## 라우트

```
app.use('/', indexRouter);
app.use('/guide', guideRouter);
app.use('/admin', adminRouter);
```

### Index

* 로그인/로그아웃
* 비밀번호 찾기

### Admin

* Admin 페이지 출력
* 파트/서비스 추가
* 파트/서비스 수정
* 파트/서비스 삭제
* 콘텐츠 추가
* 콘텐츠 수정
* 콘텐츠 삭제

### Guide

* 메인 가이드 페이지 출력 및 데이터 가공

## Index 라우터

### 로그인 - 사용자 세션 처리

```
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var options = require('../config/db.js');       // DB 설정 require

router.use(session({                     // 세션 값 저장
  secret: '12sdfwerwersdfserwerwef',    // 랜덤값
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60      // 쿠키 유효기간 1시간
  }
}));

var sessionStore = new MySQLStore(options);     // 세션 저장소로 MySQL 지정
```

### 비밀번호 찾기 - 인증 코드 생성 및 메일 전송

### 템플릿 생성

![11.PNG](/files/2392715035274867679)

### 인증 코드 생성

```
router.post('/auth', formData.array('file'), function (req, res, next) {
  var email = req.body.username;

  function makeid() {       // 랜덤한 8글자 생성
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

  var code = makeid();      // 랜덤 코드 생성
  var params = [code, email]
  var sql = `UPDATE users SET code=? WHERE email=?`;        // 생성한 코드 해당 사용자의 DB에 저장
  conn.query(sql, params, function (err, results, fields) {
    if (err) {
      console.log(err);
    } else {
      res.render('auth', { 'email': email });
    }
  })
});
```
## Guide 라우터

### URL 구조

* ### 메인 주소(http://메인_주소)로 접속
    * http://메인_주소/guide/TOAST/TOAST/overview 로 Redirect
* ### 각 서비스 도메인
    * http://메인_주소/guide/:part/:service/:content
    * 동적으로 part, service, content가 추가되어야 하기때문에 위와 같은 방식으로 구현
    * 도메인의 part, service, content 내용을 참조하여 DB를 조회하고 파일을 읽음

```
// 가이드 페이지 목차 데이터 가공 및 전송
router.get('/:part/:service/:content', function (req, res, next) {
  var part = req.params.part;               // part 참조
  var service = req.params.service;         // service 참조
  var content = req.params.content;         // content 참조

  var file_path = "./views/guide/" + part + "/" + service + "/" +content +".ejs"    // 해당 파일 로드
  var html_data = fs.readFileSync(file_path, 'utf8');

  var sql = `SELECT *, name FROM parts;`;           // 왼쪽 메뉴 바 구성을 위한 데이터 가공
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
          if(results[2][j].service == temp_service["id"])
          temp_service["content"].push(results[2][j].name)
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
      console.log(data[0]);
      res.render('menu', { "data" : data, "html_data" : html_data})
    }
  })
});
```

## Admin 라우터

### Part/Service 추가/수정/삭제

### Content 추가

### 문제점

* 기본 showdown 모듈을 사용하게 되면 자동으로 코드를 변환하기 때문에 code를 언어별로 구성하기 힘들다.
* github 코드를 연동해서 불러오기 힘들다.
* 코드 복사 버튼을 추가하기 힘들다.

https://cloud.google.com/bigquery/create-simple-app-api?hl=ko&refresh=1#bigquery-simple-app-deps-python

### 해결방안

* showdown에서 사용자가 custom extension을 작성하면 사용자만의 마크다운 언어 생성 가능

```
# Custom 마크다운 문법

%github%{코드 이름}
{코드언어} {코드 github 주소}
%end%
```

* 코드 이름은 필수적으로 적어주어야함 - 다른 코드와 구분하기 위함
    * 코드 하이라이트 언어는 185개 언어 지원 - https://highlightjs.org
    * github 주소는 https://cdn.jsdelivr.net/gh/{GitUser}/{GitRepo}/{GitPath} - git file을 raw하게 가져오기 위함
* extension 적용 코드

```
var showdown = require('showdown')
    showdown.extension('codeButtonBar', function () {
        var matches = [];
        var result = '<button name="';
        return [
            {
                type: 'lang',
                regex: /%github%([^]+?)%end%/gi,        // Custom 마크다운
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
```

![dd.PNG](/files/2391864435074537346)

### Content 수정

### 문제점

![수정문제점.PNG](/files/2391866831538044768)

* 가이드 문서를 수정하고 싶을 때 가이드 문서 데이터는 파일로 구성
* 컨텐츠 양도 많고 모든 파일을 읽어서 데이터를 전송하기 힘들다.

### 해결방안

* HTML에서 조회 버튼을 눌렀을 때 한번 더 서버에 해당 컨텐츠에 대한 요청을 전송

```
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
```

### Content 삭제

## 보완해야할 점

### 각종 자잘한 버그 수정으로 인해 다음과 같은 기능 구현 실패......

* ### Object Storage 연동
    * 현재 동적으로 추가된 md파일과 ejs파일을 서버 내에 저장하는 구조
    * 서버 2개를 돌리게 되면 가이드 컨텐츠 추가를 작동한 서버 1개에만 저장
    * ### 해결 방안
        * Object Storage를 연동하여 서버 모두 Object Storage에 해당 파일을 저장
        * 두 서버 모두 컨텐츠를 참조할 때 Object Storage를 참조
* ### Part, Service 계층 수정
    * 현재 수정 기능은 단순 이름 변경에 불과
    * 서비스 이동이나 계층적으로 확인 불가
    * ### 해결 방안
        * DB에서 정의된 종속 개념을 이용하여 트리형식으로 변환하여 출력
        * 트리 형식으로 출력된 데이터를 참조하여 수정
* ### Nodejs 코드 모듈화
    * 현재 각 라우터마다 DB나 multer 등 각각 선언되어 있음
    * ### 해결 방안
        * module.export를 이용하여 더 모듈화하여 코드 단순화 필요

# 프론트앤드 (가이드 페이지)

## 1. Menu Print (menu.ejs)

- 동적으로 Multi-Level 구성 => DB Table에서 데이터를 긁어와서 뿌려주는 형식
![1.png](/files/2392726280678750605)
```
<div class="menu__wrap">
				<ul data-menu="main" class="menu__level">

					<% for (var i=0; i< data.length ; i++){ %>
					<li class="menu__item"><a class="menu__link" data-submenu="part-<%= data[i].name%>" href="#">       //상위 메뉴
							<%= data[i].name%></a></li>
					<% } %>
				</ul>

				<% for (var i=0; i< data.length ; i++){ %>
				<!-- Submenu 1 -->
				<ul data-menu="part-<%= data[i].name%>" class="menu__level">
					<% for (var j=0; j< data[i].service.length ; j++){ %>
					<li class="menu__item"><a class="menu__link" data-submenu="service-<%= data[i].service[j].id%>" href="#">   //중간 메뉴
							<%= data[i].service[j].name%></a></li>
					<% } %>
				</ul>
				<% } %>

				<% for (var i=0; i< data.length ; i++){ %>
				<% for (var j=0; j< data[i].service.length ; j++){ %>
				<!-- Submenu 1-1 -->
				<ul data-menu="service-<%= data[i].service[j].id%>" class="menu__level">
					<% for (var k=0; k< data[i].service[j].content.length ; k++){ %>
					<li class="menu__item"><a class="menu__link" href="/guide/<%= data[i].name%>/<%= data[i].service[j].name%>/<%= data[i].service[j].content[k]%>">   //하위 메뉴
							<%= data[i].service[j].content[k]%></a></li>
					<% } %>
				</ul>
				<% } %>
				<% } %>
			</div>
```

- 오픈소스 변경

### 상위 메뉴 (data) 
 
 - data의 length만큼 data.name 출력
 - 각 data name을 가지고 submenu

### 중간 메뉴 (service)

- 해당 name의 service의 lenght만큼 data.service.name 출력
- 각 service id를 가지고 submenu 남김

### 하위 메뉴 (content)

- 해당 service의 content의 length만큼 data.service.content 출력
- **href로 각 content 페이지의 url 지정**

### 최종 content 출력

```html
		<div class="content" style="z-index: 1; position: relative;">
			<%- html_data %>
		</div>
```

backend에 저장된 html-data(해당 url 참조) 출력


## 2. Code 출력

### getGithubCode

```php
		function getGithubCode(obj, codeName) {
			var xhr = new XMLHttpRequest();
			var url = obj.getAttribute("value");
			var lang = obj.getAttribute("name");
			xhr.open("GET", url);
			xhr.send(null);
			xhr.onload = function () {
				if (xhr.status === 200 || xhr.status === 201) {
					console.log(xhr.responseText);
					var copyName = "temp_" + codeName
					document.getElementById(copyName).textContent = xhr.responseText;  //copy 본
					document.getElementById(codeName).textContent = xhr.responseText;  //클라이언트에서 보여지는 것
					document.getElementById(codeName).setAttribute("class", lang)

					$(document).ready(function () {
						$('pre code').each(function (i, block) {
							hljs.highlightBlock(block);
						});
					});
				} else {
					console.error(xhr.responseText);
				}
			};
		}
```

- admin.js에서 호출
- GET 요청으로 Github에 올라가 있는 SampleCode 출력
- 코드 하이라이트 기능(android studio format)
```
	"<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.5.0/styles/androidstudio.min.css">"
	"<script src="//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.5.0/highlight.min.js"></script>"
	<script>hljs.initHighlightingOnLoad();</script>
```
- copyName은 copyToClipboard를 위함 (온전한 코드)
- codeName은 클라이언트에게 보여질 코드 -> set Attribute 과정 거치면서 변환

![3.png](/files/2392727737950702446)


### copyToClipboard

```php
		function copyToClipboard(element) {
			var $temp = $("<textarea>");
			var codeName = element.getAttribute("name");
			$("body").append($temp);
			console.log(document.getElementById("temp_" + codeName).textContent)
			$temp.val(document.getElementById("temp_" + codeName).textContent).select();
			document.execCommand("copy");
			$temp.remove();
			alert("복사되었습니다!");
		};
```

- admin.js에서 호출
- 임시 숨겨진 텍스트 필드 temp 생성 -> element의 내용을 텍스트 필드에 복사 -> 텍스트필드의 내용 선택 -> 복사 명령 -> 임시 필드 텍스트 제거 
- copyName = "temp_" + codeName 으로 얻어진 copyName의 데이터 복사


# Log & Crash

## NGINX

### logstash 설정 파일

```
input {
        beats{
        port => 5044
        }
}
filter {
        if [source] == "/usr/local/nginx/logs/access.log"{
                grok{
                        match => { "message" => "%{COMBINEDAPACHELOG}" }
                }

                mutate{
                        rename => {
                                                "message"=>"body"
                                }
                        add_field => {
                                                "projectName" => "5hS48AFbQVT0B8pz"
                                                "projectVersion" => "1.0.0"
                                                "logSource" => "http"
                                                "logVersion" => "v2"
                                                "logType" => "nginx-access"
                                }
                }
        }
        else if [source] =="/usr/local/nginx/logs/error.log"{

                grok{
                         match => { "message" => "%{YEAR}[./-]%{MONTHNUM}[./-]%{MONTHDAY}[- ]%{TIME} \[%{LOGLEVEL:severity}\] %{POSINT:pid}#%{NUMBER}: %{GREEDYDATA:errormessage}" }
                }
                mutate{
                        rename => {
                                                "message"=>"body"
                                }
                        add_field => {
                                                "projectName" => "5hS48AFbQVT0B8pz"
                                                "projectVersion" => "1.0.0"
                                                "logSource" => "http"
                                                "logVersion" => "v2"
                                                "logType" => "nginx-error"
                                }
                }
        }
}
output {
 stdout { codec => rubydebug }
  http {
    url => "http://api-logncrash.cloud.toast.com/v2/log"
    http_method => "post"
    format => "json"
    ssl_certificate_validation => false
  }
}

```
#### input
- 각 웹서버의 filebeat에서 전송된 데이터를 5044 포트로 받음


#### filter

- log의 source에 따라 access와 error 구분
- access 는 %{COMBINEDAPACHELOG}로 분류
- error 는 match로 포맷 맞춤
- add_field에 POST에 필요한 정보 입력(APPKey, projectVersion 등)

#### output

- http POST 방식으로 전송
- Log&Crash url 입력


### Log Format (nginx.conf)

- 기본적으로는 LBaaS의 IP만 나오므로 **Client IP**가 나오도록 설정
```
    set_real_ip_from 192.168.0.17;
    real_ip_header X-Forwarded-For;
```
- nginx 컴파일 설치 시에 ``--with-http_realip_module`` 같이 설치

### Log & Crash

#### 404 response(존재하지 않는 자료 요청)
![4.png](/files/2392728143595493419)

#### 관리자(103.243.200.44)에서 접근한 log 조회 
![5.png](/files/2392728205907980248)

#### error log 조회
![6.png](/files/2392728278701693942)

#### 필요시에 알람 설정
![7.png](/files/2392728386257362088)
![8.png](/files/2392728447186077667)

### 알람에 넣으면 좋을 요소 (Lucene query)

#### Admin (Access)

- 로그인
```
verb:"POST" AND referrer:"\"http\:\/\/133.186.150.56\/login\"" AND response:"302"
```
- 로그인 timeout (에러)
```
source:"\/usr\/local\/nginx\/logs\/error.log" AND body:"Connection" AND body:"timed" AND body:"out" AND body:"login"
```
- 로그아웃
```
verb:"POST" AND body:"logout" AND response:"302"
```

- 컨텐츠 추가
```
referrer:"\"http\:\/\/133.186.150.56\/admin\/addContent\"" AND verb:"POST" AND response:"302"
```
- 컨텐츠 삭제
```
referrer:"\"http\:\/\/133.186.150.56\/admin\/deleteContent\"" AND verb:"POST" AND response:"302"
```

- Emerg 에러 : 서비스 불가 수준 (보통 Syntax 에러)
```
source:"\/usr\/local\/nginx\/logs\/error.log" AND severity:"emerg"
```

#### Client

- 404 에러 (요청한 자료 없음)
```
verb:"GET" AND response:"404"
```
- 503 에러 (WAS 서버 문제)
```
verb:"GET" AND response:"503"
```

### 추가해야 할 부분

#### Log Format 및 Filter 변경

- $request_time : 해당 요청을 처리하는 데 걸린 응답시간
- $connection : nginx에 붙은 connection 갯수.

=> ```Log&Crash 알람 설정에 넣으면, 접속 지연 및 접속량 확인하기 좋을 것```

## NodeJS

### nodejs 로그 

/usr/local/nodejs/bin/TOASTGuidePage_TOAST_Nodejs/log/logs.log

=> **json 형태**

### logstash 설정 파일

- logstash-filter-json plugin 설치 및 활용

```
input {
        beats{
        port => 5044
        }
}
filter {

                json{
                        target => "data"
                        add_field => {
                                                "projectName" => "5I7w3dtIXvLdBB9E"
                                                "projectVersion" => "1.0.0"
                                                "logSource" => "nodejs"
                                                "logVersion" => "v2"
                                                "logType" => "nodejs-log"
                                }
                }
        }
output {
 stdout { codec => rubydebug }
  http {
    url => "http://api-logncrash.cloud.toast.com/v2/log"
    http_method => "post"
    format => "json"
    ssl_certificate_validation => false
  }
}
```

### 문제점

```
{  
   "message":"::ffff:192.168.0.13 - - [15/Jan/2019:10:33:23 +0000] \"GET /admin HTTP/1.0\" 200 4495 \"http://133.186.150.56/login\" \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36\"\n",
   "level":"info"
}
```

- log가 웹서버와 흡사
- 의미가 없다고 판단
- 구현 중지

# 프론트앤드 (관리자 페이지)

## 1. admin_main
  
### 관리자 로그인 후 실행되는 관리자 메인 페이지
### 파트 및 컨텐츠 추가, 수정, 삭제 페이지로 이동
  
## 2. add_pns
  
### 파트 및 서비스 추가 페이지
### Method - POST

## 3. modify_pns
  
### 파트 및 서비스의 이름을 변경하는 페이지
### Method - POST
### Function - itemChange(obj)
* 선택한 파트 별로 서비스 리스트가 바뀌도록 구현
* `obj.options[obj.options.selectedIndex].getAttribute("id")`로 선택된 selectbox의 값을 추출
```javascript
for (var i=0; i<serviceList.length; i++){
    if (selectItem == serviceList[i].part){
		var temp = {}
		temp["name"]= serviceList[i].name;
		temp["part"]= serviceList[i].part;
		temp["value"]= serviceList[i].value;
		changeItem.push(temp)
	}
}
```
* jQuery 활용
```javascript
$("#selectService").empty();
var option = $("<option value=''> 서비스 선택 </option>") // Set Default Value of Option
$('#selectService').append(option);
for (var i=0;i<changeItem.length;i++){
	var option = $("<option name=" + changeItem[i].part + " value=" + changeItem[i].value + ">"+changeItem[i].name+"</option>");
	$('#selectService').append(option);
}
```
## 4. delete_pns

### 파트 및 서비스를 삭제하는 페이지
### Method - POST
### Function - itemChange(obj)
* 선택한 파트 별로 서비스 리스트가 바뀌도록 구현
* `obj.options[obj.options.selectedIndex].getAttribute("id")`로 선택된 selectbox의 값을 추출
```javascript
for (var i=0; i<serviceList.length; i++){
	if (selectItem == serviceList[i].part){
		var temp = {}
		temp["name"]= serviceList[i].name;
		temp["part"]= serviceList[i].part;
		temp["value"]= serviceList[i].value;
		changeItem.push(temp)
	}
}
```
* jQuery 활용
```javascript
$("#selectService").empty();
var option = $("<option value=''> 서비스 선택 </option>") // Set Default Value of Option
$('#selectService').append(option);
for (var i=0;i<changeItem.length;i++){
	var option = $("<option name=" + changeItem[i].part + " value=" + changeItem[i].value + ">"+changeItem[i].name+"</option>");
	$('#selectService').append(option);
}
```

## 5. add_content
  
### 서비스의 콘텐츠(Overview, API Guide 등)를 추가하는 페이지
### Method - POST
### Markdown Editor를 textarea에 설정
```javascript
var simplemde = new SimpleMDE({
	tabSize:4,
	element: document.getElementById("contentText")
});
```
### Function - itemChange(obj)
* 선택한 파트 별로 서비스 리스트가 바뀌도록 구현
* `obj.options[obj.options.selectedIndex].getAttribute("id")`로 선택된 selectbox의 값을 추출
```javascript
for (var i=0; i<serviceList.length; i++){
	if (selectItem == serviceList[i].part){
    	var temp = {}
		temp["name"]= serviceList[i].name;
		temp["part"]= serviceList[i].part;
		temp["value"]= serviceList[i].value;
		changeItem.push(temp)
	}
}
```
* jQuery 활용
```javascript
$("#selectService").empty();
var option = $("<option value=''> 서비스 선택 </option>") // Set Default Value of Option
$('#selectService').append(option);
for (var i=0;i<changeItem.length;i++){
	var option = $("<option name=" + changeItem[i].part + " value=" + changeItem[i].value + ">"+changeItem[i].name+"</option>");
	$('#selectService').append(option);
}
```

## Javascript & jQuery Plugin Markdown Editor 비교

### 선정 기준


    1) 최소 Dependency로 활용할 수 있는 Editor
    2) 작성한 문서 미리보기를 제공하는 Editor


### 1. Editor

* **Dependencies**
```html
<link rel="stylesheet" href="http://lab.lepture.com/editor/editor.css" />
<script type="text/javascript" src="http://lab.lepture.com/editor/editor.js"></script>
<script type="text/javascript" src="http://lab.lepture.com/editor/marked.js"></script>
```
![Editor.JPG](/files/2388181836764704021)

* **미리보기 버튼**을 눌러야만 작성된 문서의 미리보기를 볼 수 있고, 편집 창을 반으로 나눠서 실시간으로 보는 기능을 제공하지 않음
* 폰트 크기가 작고, 대제목과 소제목 별로 구분되지 않음

### 2.simplemd-markdown-editor
* **Dependencies**
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/simplemde/latest/simplemde.min.css">
<script src="https://cdn.jsdelivr.net/simplemde/latest/simplemde.min.js"></script>
```
![simplemd-markdown-editor.JPG](/files/2388182619261138190)

### ```simplemd-markdown-editor를 선택한 이유!```
* 작성한 문서 미리보기를 제공, 편집 창을 반으로 나눠서 실시간으로 보는 기능을 제공
* Editor 보다 폰트 크기가 크고, 대제목과 소제목 별로 크기가 달라 구분이 용이
## 6. modify_content

### 서비스의 콘텐츠(Overview, API Guide 등)를 수정하는 페이지
### 기존에 생성한 콘텐츠를 불러와 수정
### Method - POST
### Function - partChange(obj)
* 선택한 파트 별로 서비스 리스트가 바뀌도록 구현
* `obj.options[obj.options.selectedIndex].getAttribute("id")`로 선택된 selectbox의 값을 추출
```javascript
for (var i=0; i<serviceList.length; i++){
	if (selectItem == serviceList[i].part){
		var temp = {}
		temp["name"]= serviceList[i].name;
		temp["part"]= serviceList[i].part;
		temp["value"]= serviceList[i].value;
		changeItem.push(temp)
	}
}
```
* jQuery 활용
```javascript
$("#selectService").empty();
var option = $("<option value=''> 서비스 선택 </option>") // Set Default Value of Option
$('#selectService').append(option);
for (var i=0;i<changeItem.length;i++){
	var option = $("<option name=" + changeItem[i].part + " value=" + changeItem[i].value + ">"+changeItem[i].name+"</option>");
	$('#selectService').append(option);
}
```
### Function - contentChange(obj)
* 선택한 파트 별로 서비스 리스트가 바뀌도록 구현
* `obj.options[obj.options.selectedIndex].getAttribute("value")`로 선택된 selectbox의 값을 추출
```javascript
for (var i=0; i<serviceList.length; i++){
	if (selectItem == serviceList[i].part){
		var temp = {}
		temp["name"]= serviceList[i].name;
		temp["part"]= serviceList[i].part;
		temp["value"]= serviceList[i].value;
		changeItem.push(temp)
	}
}
```
* jQuery 활용
```javascript
$("#selectContent").empty();
var option = $("<option value=''> 콘텐츠 선택 </option>") // Set Default Value of Option
$('#selectContent').append(option);
for (var i = 0; i < changeItem.length; i++) {
	var option = $("<option name=" + changeItem[i].service + ' value="' + changeItem[i].value + '">' + changeItem[i].name + "</option>");
	$('#selectContent').append(option);
}
```
### Function - goPost()
* 이미 만든 콘텐츠의 내용을 불러오는 함수
* XMLHttpRequest 활용
```
- 페이지 Reload 없이 특정 내용만 업데이트 가능
- 페이지가 로드된 후 데이터 요청 / 수신
```
```javascript
xhr.onload = function () {
    $('#contentText').val(xhr.responseText);
    $('#changeName').val(content);
	$codemirror.getDoc().setValue(xhr.responseText);
};
xhr.open("POST", "/admin/sendContent");
xhr.send(formData); // 데이터를 stringify해서 보냄
```
* FormData 활용
```
- form 필드와 그 값을 나타내는 일련의 key/value 쌍을 쉽게 생성
- XMLHttpRequest.send()를 사용하여 쉽게 전송
```
```javascript
formData.append('partName', part);
formData.append('serviceName', service);
formData.append('contentName', content);
```
## 7. delete_content
  
### 작성한 콘텐츠 삭제
### Method - POST
### Function - itemChange(obj)
* 선택한 파트 별로 서비스 리스트가 바뀌도록 구현
* `obj.options[obj.options.selectedIndex].getAttribute("id")`로 선택된 selectbox의 값을 추출
```javascript
for (var i=0; i<serviceList.length; i++){
	if (selectItem == serviceList[i].part){
		var temp = {}
		temp["name"]= serviceList[i].name;
		temp["part"]= serviceList[i].part;
		temp["value"]= serviceList[i].value;
		changeItem.push(temp)
	}
}
```
* jQuery 활용
```javascript
$("#selectService").empty();
var option = $("<option value=''> 서비스 선택 </option>") // Set Default Value of Option
$('#selectService').append(option);
for (var i=0;i<changeItem.length;i++){
	var option = $("<option name=" + changeItem[i].part + " value=" + changeItem[i].value + ">"+changeItem[i].name+"</option>");
	$('#selectService').append(option);
}
```
### Function - contentChange(obj)
* 선택한 서비스 별로 콘텐츠 리스트가 바뀌도록 구현
* `obj.options[obj.options.selectedIndex].getAttribute("value")`로 선택된 selectbox의 값을 추출
```javascript
for (var i=0; i<serviceList.length; i++){
	if (selectItem == serviceList[i].part){
		var temp = {}
		temp["name"]= serviceList[i].name;
		temp["part"]= serviceList[i].part;
		temp["value"]= serviceList[i].value;
		changeItem.push(temp)
	}
}
```
* jQuery 활용
```javascript
$("#selectContent").empty();
var option = $("<option value=''> 콘텐츠 선택 </option>") // Set Default Value of Option
$('#selectContent').append(option);
for (var i = 0; i < changeItem.length; i++) {
	var option = $("<option name=" + changeItem[i].service + ' value="' + changeItem[i].value + '">' + changeItem[i].name + "</option>");
	$('#selectContent').append(option);
}
```
##  관리자 페이지 보완점

### 1. 페이지 통합

* 파트 및 서비스 추가 및 수정, 삭제는 하나의 페이지에 구성해도 무방함
* 페이지 별 중복되는 jQuery Method의 모듈화

### 2. Alert 창을 Confirm 창으로 변경

* 파트 및 서비스, 콘텐츠 삭제 성공 시 팝업되는 Alert 창 → Confirm 창으로 변경하여 실수로 데이터 삭제하는 오류 방지

# 빌드 및 배포

### TOAST Deploy 활용


## Deploy 활용 시 발생한 이슈 및 해결

### 스크립트에서 npm start 호출 시 WAS Server에서 Log를 끊임없이 받아와 Deploy가 종료되지 않음

### npm forever 모듈을 설치 - npm start 호출을 Background에서도 수행

* **설치**
```
$sudo npm install forever -g //global 설치하여 새로운 배포가 이루어져도 모듈 재설치를 방지
```
* **Node.js Web Application 구동**
```
$forever start -c "npm start" ./ //현재 프로젝트 폴더에서 npm start 명령어 수행. -c 옵션 추가되지 않을 시 default value : node
```
* **Node.js Web Application 정지**

```
$forever stopall  //모든 구동중인 Node.js Web Application 중지
```

## 버전 관리

### Git Tag 활용 - Tag Version 별 빌드 및 배포, Rollback 수행

* **PUSH**
```
$git add .
$git commit -m "MSG"
$git tag TAG_NAME
$git push REPOSITORY_URL TAG_NAME
```

* **Rollback 수행**

```
$sudo git clone GIT_REPOSITORY_URL
$sudo git checkout TAG_NAME

```

## 시나리오 구성 - Build&Deploy

### #1 Build&Deploy

* **#1 WAS Server**
```
cd /usr/local/nodejs/bin/TOASTGuidePage_TOAST_Nodejs

#stop old application
forever stopall

#backup contents
sudo cp -r /usr/local/nodejs/bin/TOASTGuidePage_TOAST_Nodejs/views/guide /home/irteam

#delete old application
cd ..
sudo mv TOASTGuidePage_TOAST_Nodejs TOASTGuidePage_TOAST_Nodejs.old
sudo rm -rf TOASTGuidePage_TOAST_Nodejs.old

#clone new application
sudo git clone https://github.com/jh8579/TOASTGuidePage_TOAST_Nodejs.git
```

* **#1 WEB Server**
```
cd /usr/local/nginx

#stop Nginx server
sudo ./sbin/nginx -s stop
```
* **#1 WAS Server**
```
cd /usr/local/nodejs/bin/TOASTGuidePage_TOAST_Nodejs

#import db & email.js file & content file
sudo mkdir config
cd config
sudo cp /home/irteam/db.js ./
sudo cp /home/irteam/email.js ./

# remove previous guide page
cd ..
sudo rm -rf /usr/local/nodejs/bin/TOASTGuidePage_TOAST_Nodejs/views/guide/

#import backuped contents
sudo cp -r /home/irteam/guide /usr/local/nodejs/bin/TOASTGuidePage_TOAST_Nodejs/views

#change permissions to write contents
sudo chown -R irteam:irteam /usr/local/nodejs/bin/TOASTGuidePage_TOAST_Nodejs
sudo chown irteam:irteam /usr/local/nodejs/bin/TOASTGuidePage_TOAST_Nodejs/*
sudo chown -R irteam:irteam /usr/local/nodejs/bin/TOASTGuidePage_TOAST_Nodejs/views/guide/

#instal npm & forever module
sudo ../npm install

#start new application
forever start -c "npm start" ./
```
* **#1 WEB Server**
```
cd /usr/local/nginx

#start Nginx server
sudo ./sbin/nginx
```
### #2 Build&Deploy

* #1 Build&Deploy 과정과 동일

## 시나리오 구성 - Rollback

### #1 Rollback

* **#1 WAS Server**
```
cd /usr/local/nodejs/bin/TOASTGuidePage_TOAST_Nodejs

#stop old application
forever stopall

#backup contents
sudo cp -r /usr/local/nodejs/bin/TOASTGuidePage_TOAST_Nodejs/views/guide /home/irteam

#delete old application
cd ..
sudo mv TOASTGuidePage_TOAST_Nodejs TOASTGuidePage_TOAST_Nodejs.old
sudo rm -rf TOASTGuidePage_TOAST_Nodejs.old

#clone new application
sudo git clone https://github.com/jh8579/TOASTGuidePage_TOAST_Nodejs.git
```

* **#1 WEB Server**
```
cd /usr/local/nginx

#stop Nginx server
sudo ./sbin/nginx -s stop
```
* **#1 WAS Server**
```
cd /usr/local/nodejs/bin/TOASTGuidePage_TOAST_Nodejs
sudo git checkout v4.0

#import db & email.js file & content file
sudo mkdir config
cd config
sudo cp /home/irteam/db.js ./
sudo cp /home/irteam/email.js ./

# remove previous guide page
cd ..
sudo rm -rf /usr/local/nodejs/bin/TOASTGuidePage_TOAST_Nodejs/views/guide/

#import backuped contents
sudo cp -r /home/irteam/guide /usr/local/nodejs/bin/TOASTGuidePage_TOAST_Nodejs/views

#change permissions to write contents
sudo chown -R irteam:irteam /usr/local/nodejs/bin/TOASTGuidePage_TOAST_Nodejs
sudo chown irteam:irteam /usr/local/nodejs/bin/TOASTGuidePage_TOAST_Nodejs/*
sudo chown -R irteam:irteam /usr/local/nodejs/bin/TOASTGuidePage_TOAST_Nodejs/views/guide/

#instal npm & forever module
sudo ../npm install

#start new application
forever start -c "npm start" ./
```

* **#1 WEB Server**
```
cd /usr/local/nginx

#start Nginx server
sudo ./sbin/nginx
```
### #2 Rollback

* #1 Rollback 과정과 동일

# 시연
홈 - http://loaclhost:3000
가이드 - http://localhost:3000/admin


## 시연과정

1. 접속
2. 로그인
3. 파트 추가/서비스 추가
4. 가이드 확인
5. 파트/서비스 수정
6. 가이드 확인
7. 파트/서비스 삭제
8. 가이드 확인
9. 컨텐츠 추가
10. 가이드 확인
11. 컨텐츠 수정
12. 가이드 확인
13. 컨텐츠 삭제
14. 가이드 확인
15. 비밀번호 찾기
16. 이메일 확인
17. 바꾼 패스워드로 로그인


```
# 샘플코드 가이드

## 샘플코드 1
%github%samplecode1
java https://cdn.jsdelivr.net/gh/jh8579/SampleCode_TOAST-Image_Java/src/serviceSampleCode/UploadAPI.java
python https://cdn.jsdelivr.net/gh/jh8579/SampleCode_TOAST-Image_Python/upload_api.py
php https://cdn.jsdelivr.net/gh/jh8579/SampleCode_TOAST-Image_PHP/uploadAPI.php
%end%

## 샘플코드 2

%github%samplecode2
java https://cdn.jsdelivr.net/gh/jh8579/SampleCode_TOAST-Image_Java/src/serviceSampleCode/DeleteAPI.java
php https://cdn.jsdelivr.net/gh/jh8579/SampleCode_TOAST-Image_PHP/deleteAPI.php
%end%
```
