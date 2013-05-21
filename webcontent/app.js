var express = require("express"),
   http = require("http"),
   https = require("https"),
   fs = require("fs"),
   querystring = require("querystring");

var app = express();

app.use(express.static(__dirname + '/public'));


// 4. Support SSL
// 5. Instructions
// 6. Caveats (no caching, no error checking, no performance optimization, not tested, no oauth, )
// 7. Documentation

/*** Usefull reference links ***
*
*  will use these to setup in-bound SSL to secure native vine api and remove require("http") 
*  http://silas.sewell.org/blog/2010/06/03/node-js-https-ssl-server-example/
*  http://stackoverflow.com/questions/11744975/enabling-https-on-express-js
*
*  Used in early research and need to be credited in final blog post
*  https://github.com/starlock/vino/wiki/API-Reference
*  https://github.com/starlock/vino/blob/master/vine.py
*  http://www.gironda.org/2013/02/25/digging-in-the-vineyard-part-1.html
*  http://blog.noodlewerk.com/general/tutorial-using-charles-proxy-to-debug-https-communication-between-server-and-ios-apps/
*
*  Two non api.vineapp.com api calls detected - maybe implement these later somehow?
*  https://vines.s3.amazonaws.com/static/status.json
*  https://vine.co/explore?v=1.1
*
*  Testing auth with curl
*  curl -d "username=troy.forster@gmail.com&password=$v1ne200" --header "Content-Type: application/x-www-form-urlencoded; charset=utf-8" --header "user-agent: com.vine.iphone/1.0.3 (unknown, iPhone OS 6.1.0, iPhone, Scale/2.000000)"  https://api.vineapp.com/users/authenticate
*/




var Api = {
   "creds": { "username": "troy.forster@gmail.com", "password": "$v1ne200" },
   "basepath": "api.vineapp.com",
   "vine-session-id": "",
   "vine-user-id": "",

   "GetIt": function (apiMethod, data, callback) {
      var options = {
         port: 443,
         hostname: Api.basepath,
         headers: {
            "user-agent": "com.vine.iphone/1.0.3 (unknown, iPhone OS 6.1.0, iPhone, Scale/2.000000)",
            "vine-session-id": Api["vine-session-id"]
         }
      }

      // If we're not authenticated then override incoming args to call login (cache originals and recall in new callback)   
      if (Api["vine-session-id"] === "" && data != Api.creds) {
         var args = [].slice.call(arguments);
         apiMethod = {
            method: "POST",
            path: "/users/authenticate"
         };
         data = Api.creds;
         callback = function (data) {
            Api["vine-session-id"] = data.data.key;
            Api["vine-user-id"] = data.data.userId;
            Api.GetIt(args[0], args[1], args[2]);
         }
         // Login is the only POST so we need to set content-type accordingly
         options.headers["content-type"] = "application/x-www-form-urlencoded";
      }

      options.path = apiMethod.path;
      options.method = apiMethod.method;

      var req = https.request(options, function (res) {
         console.log("\r\r\r", new Date(), "\r", options, "\rstatus: ", res.statusCode);
         res.setEncoding("utf8");
         var responseData = "";

         res.on("data", function (data) {
            responseData += data;
         });

         res.on("end", function () {
            responseData = JSON.parse(responseData);
            callback(responseData);
         });
      });

      req.on("error", function (e) {
         console.log("\rreq.on.error: " + e.message);
      });

      var postData = querystring.stringify(data);
      req.write(postData);
      req.end();
   }

}



app.get("/api/timelines/users/:id", function (req, res) {
   var apiMethod = {
      "method": "GET",
      "path": "/timelines/users/" + req.params.id
   }
   Api.GetIt(apiMethod, {}, function (data) {
      res.send(data);
   });
});

app.get("/api/timelines/promoted", function (req, res) {
   var apiMethod = {
      "method": "GET",
      "path": "/timelines/promoted"
   }
   Api.GetIt(apiMethod, {}, function (data) {
      res.send(data);
   });
});

app.get("/api/timelines/popular", function (req, res) {
   var apiMethod = {
      "method": "GET",
      "path": "/timelines/popular"
   }
   Api.GetIt(apiMethod, {}, function (data) {
      res.send(data);
   });
});

app.get("/api/timelines/tags/:tag", function (req, res) {
   var apiMethod = {
      "method": "GET",
      "path": "/timelines/tags/" + req.params.tag
   }
   Api.GetIt(apiMethod, {}, function (data) {
      res.send(data);
   });
});

app.get("/api/timelines/graph", function (req, res) {
   var apiMethod = {
      "method": "GET",
      "path": "/timelines/graph"
   }
   Api.GetIt(apiMethod, {}, function (data) {
      res.send(data);
   });
});

app.get("/api/users/profiles/:id", function (req, res) {
   var apiMethod = {
      "method": "GET",
      "path": "/users/profiles/" + req.params.id
   }
   Api.GetIt(apiMethod, {}, function (data) {
      res.send(data);
   });
});

app.get("/api/users/:id/pendingNotificationsCount", function (req, res) {
   var apiMethod = {
      "method": "GET",
      "path": "/users/" + req.params.id + "/pendingNotificationsCount"
   }
   Api.GetIt(apiMethod, {}, function (data) {
      res.send(data);
   });
});

app.get("/api/users/search/:username", function (req, res) {
   var apiMethod = {
      "method": "GET",
      "path": "/users/search/" + encodeURIComponent(req.params.username)
   }
   Api.GetIt(apiMethod, {}, function (data) {
      res.send(data);
   });
});

app.get("/api/users/me", function (req, res) {
   var apiMethod = {
      "method": "GET",
      "path": "/users/me"
   }
   Api.GetIt(apiMethod, {}, function (data) {
      res.send(data);
   });
});

app.get("/api/users/:id/followers", function (req, res) {
   var apiMethod = {
      "method": "GET",
      "path": "/users/" + req.params.id + "/followers"
   }
   Api.GetIt(apiMethod, {}, function (data) {
      res.send(data);
   });
});

app.get("/api/users/:id/following", function (req, res) {
   var apiMethod = {
      "method": "GET",
      "path": "/users/" + req.params.id + "/following"
   }
   Api.GetIt(apiMethod, {}, function (data) {
      res.send(data);
   });
});

app.get("/api/tags/search/:tag", function (req, res) {
   var apiMethod = {
      "method": "GET",
      "path": "/tags/search/" + req.params.tag
   }
   Api.GetIt(apiMethod, {}, function (data) {
      res.send(data);
   });
});

app.get("/api/posts/:id", function (req, res) {
   var apiMethod = {
      "method": "GET",
      "path": "/posts/" + req.params.id + "/comments"
   }
   Api.GetIt(apiMethod, {}, function (data) {
      res.send(data);
   });
});



//app.get("/api/:method", function (req, res) {
//   var method = req.params.method.toLowerCase();
//   for (itemProp in Api.methods) {
//      if (itemProp === method) {
//         Api.GetIt(Api.methods[method], {}, function (data) {
//            res.send(data);
//         });
//      }
//   }
//});


// Render a simple test page *** That I haven't modified since Thursday so its not really doing much use at the moment ***
//app.get("/", function (req, res) {
//   var index = fs.readFileSync("index.html");
//   res.writeHead(200, { "Content-Type": "text/html" });

//   res.write(index);
//   res.end(Api["vine-session-id"]);

//});

app.listen(3000);
console.log("Listening on port 3000");