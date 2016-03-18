var http = require('http');
var cheerio = require('cheerio');
var base_url = "www.heavy-r.com";
var fs = require('fs');

http.get({
  hostname: base_url,
  port: 80,
  path: '/',
  agent: false  // create a new agent just for this one request
}, (response) => {
    // Continuously update stream with data
    var body = '';

    response.on('data', function(data) {
        body += data;
    });

    response.on('end', function() {
        var $ = cheerio.load(body);

        var recent_uploads = $(".col-xs-6.col-sm-3.col-md-6");
        var current_record = recent_uploads

        var buffer = '[';
        while (current_record.html() != null) {
            buffer += process_record (current_record);

            current_record = current_record.next();

            if (current_record.html() != null) {
                buffer += ',';
            }
        };
        buffer += "]";

        var new_json = JSON.parse(buffer)

        read_json ('database.json', function (json) {
            new_json.forEach (function (new_item) {
                var new_record_not_found = false;

                json.forEach (function (old_item) {
                    var titles_equal = old_item.title === new_item.title;
                    var items_equal = old_item.links === new_item.links;

                    if (titles_equal) {
                        new_record_not_found = true;
                    }
                });

                if (!new_record_not_found) {
                    json.push (new_item);
                    console.log ("item: " + new_item.title)
                }
            });

            write_json (json, function () {
                console.log ("JSON writen");
            }, function (error) {
                console.log (error);
            });
        }, function (error) {
            console.log (error);
        });
    });
})

function write_json (json, success_callback, error_callback) {
    fs.writeFile("database.json", JSON.stringify (json), function(err) {
        if(err) {
            return error_callback (err);
        }

        success_callback ();
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

/*
Take record and format it to json
{
    "title": "t1",
    "link": "http://link.com",
    "img": "img.jpg"
}
*/
function process_record (record) {
    var $ = cheerio.load (record.html());
    var buffer = "{";

    var title = $("span.title").html();
    var link = base_url + "/" + $("a.item").attr("href");
    var image = $("img").attr("src");

    // console.log (title);
    // console.log (link);
    // console.log (image);
    // console.log ();

    buffer += '"title":"' + title + '",';
    buffer += '"link":"http://' + link + '",';
    buffer += '"img":"' + image + '"';
    buffer += "}"

    return buffer;
}
