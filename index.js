module.exports = function(data, buttons, request, response) {
	var buffer = '';

	buffer += '<link rel="stylesheet" type="text/css" href="styles.css" >';
	buffer += '<header>';
	buffer += '	<ul>';
	buffer += '		<li><a href="/"><span class="icon">&#x2302;</span> Home</a></li>';
	buffer += '		<li><a href="/favorites"><span class="icon">&hearts;</span> Favorites</a></li>';
	buffer += '		<li><div>results: <span class="results">' + JSON.parse(data).length + '</span></div></li>';
	buffer += '	</ul>';
	buffer += '</header>';
	buffer += '<div class="column">';

	var records_buffer = ''
	JSON.parse(data).forEach (function (item) {
		var record_buffer = ''

		record_buffer += "<div class='item'>";
		record_buffer += replaceAll (replaceAll (replaceAll (buttons, '{{ link }}', item.link), '{{ title }}', item.title), '{{ img }}', item.img);
		record_buffer += "<a target='_blank' href='" + item.link + "'><h2>" + item.title + "</h2></a>";
		record_buffer += "<a target='_blank' href='" + item.link + "'><img src='" + item.img + "'></a>";
		record_buffer += "</div>";

		records_buffer = record_buffer + records_buffer;
	})

	buffer += records_buffer;
	buffer += '</div>';
	buffer += '<script src="http://code.jquery.com/jquery-1.12.1.min.js"></script>';
	buffer += '<script src="functionality.js"></script>';

	response.writeHead(200, {'Content-Type': 'text/html'});
	response.end(buffer);
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}
