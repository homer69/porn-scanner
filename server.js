var http = require('http');
var cheerio = require('cheerio');
var dispatcher = require('httpdispatcher');
var base_url = "www.heavy-r.com";
var fs = require('fs');

const PORT = 8080;

var server = http.createServer(function (request, response){
    dispatcher.dispatch(request, response);
});

function read (filename, success_callback, error_callback) {
    fs.readFile(filename, 'utf8', function (err,data) {
        if (err) {
            return error_callback (err);
        }
        
        return success_callback (data);
    });
}

function read_json (filename, success_callback, error_callback) {
    fs.readFile(filename, 'utf8', function (err,data) {
        if (err) {
            return error_callback (err);
        }
        
        return success_callback (JSON.parse(data));
    });
}

function write_json (filename, json, success_callback, error_callback) {
    fs.writeFile(filename, JSON.stringify (json), function(err) {
        if(err) {
            return error_callback (err);
        }

        success_callback ();
    }); 
}

server.listen(PORT, '0.0.0.0', function(){
    console.log("Server listening on: http://localhost:%s", PORT);
});

dispatcher.onGet("/", function(request, response) {
    response.writeHead(200, {'Content-Type': 'text/javascript'});

    var buttons  = '<a target="_blank" class="delete button" onclick="delete_record(\'{{ link }}\');">X</a>';
        buttons += '<a target="_blank" class="favorite button" href="add_favorite?link={{ link }}&img={{ img }}&title={{ title }}">&hearts;</a>'

    read_json ('database.json', function (data) {
        require ('./index.js')(JSON.stringify (data), buttons, request, response);
    })
});

dispatcher.onGet("/delete", function(request, response) {
    var url = request.url.split('?')[1];

    read_json ('database.json', function (old_json) {
        var new_json = [];

        old_json.forEach (function (item) {
            if (item.link != url) {
                new_json.push (item)
            }
        })

        write_json ('database.json', new_json, function () {
            response.writeHead(200, {'Content-Type': 'text/html'});
            response.end('deleted <script>setTimeout(function () { window.close() }, 0);</script>');
        })
    })
});

dispatcher.onGet("/view", function(request, response) {
    var url = request.url.split('?')[1];

    response.writeHead(200, {'Content-Type': 'text/html'});
    response.end('<div class="banner"></div><iframe src="' + url + '"><a href="' + url + '">Click here</a></iframe>');
});

dispatcher.onGet("/favorites", function(request, response) {
    response.writeHead(200, {'Content-Type': 'text/javascript'});
    var buttons  = '<a target="_blank" class="delete button" href="delete_favorite?{{ link }}" onclick="$(this).parent().remove();">X</a>';
    read_json ('favorites.json', function (data) {
        require ('./index.js')(JSON.stringify (data), buttons, request, response);
    })
});

dispatcher.onGet("/add_favorite", function(request, response) {
    var url_params = request.url.split('?')[1];
    var url_key_values = url_params.split('&');

    var title = '';
    var img = '';
    var link = '';

    url_key_values.forEach (function (item) {
        var key_values_split = item.split ('=');
        var key = key_values_split[0];
        var value = key_values_split[1];

        if (key == 'title')
            title = value;
        else if (key == 'img')
            img = value;
        else if (key == 'link')
            link = value;
    });

    read_json ('favorites.json', function (json) {
        var is_found = false;

        json.forEach (function (item) {
            if (item.link == link) {
                is_found = true;
            }
        });

        if (!is_found) {
            json.push ({
                "title": replaceAll (title, '%20', ' '),
                "img": img,
                "link": link
            })

            write_json ('favorites.json', json, function () {
            }, function (error) {
                console.log (error);
            });
        }
    });

    response.writeHead(200, {'Content-Type': 'text/html'});
    response.end('deleted <script>setTimeout(function () { window.close() }, 0);</script>');
});

dispatcher.onGet("/delete_favorite", function(request, response) {
    var url = request.url.split('?')[1];

    read_json ('favorites.json', function (old_json) {
        var new_json = [];

        old_json.forEach (function (item) {
            if (item.link != url) {
                new_json.push (item)
            }
        })

        write_json ('favorites.json', new_json, function () {
            response.writeHead(200, {'Content-Type': 'text/html'});
            response.end('deleted <script>setTimeout(function () { window.close() }, 0);</script>');
        })
    })
});

dispatcher.onGet("/functionality.js", function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/javascript'});

    read ('functionality.js', function (data) {
        res.end(data);
    }, function (error) {
        console.log (error);
    })
})

dispatcher.onGet("/styles.css", function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/css'});

    read ('styles.css', function (data) {
        res.end(data);
    }, function (error) {
        console.log (error);
    })
})

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}
