// set the max height on all boxes
var max_height = 0;

$("div.item").each (function () {
	var current_height = $(this).height();

	if (current_height > max_height) {
		max_height = current_height;
	}
}).each (function () {
	$(this).height(max_height);
})
// --- end set max height

// thumbnail slideshow
var image_index = 1
function goto_image (index) {
	// find the first image in the video thumnail set
	$("div.item img").each (function () {
		var src = $(this).attr("src");
		var src_split = src.split("_");
		var src_leader = src_split[0];
		var src_count = index;
		var src_trailer = src_split[1];
		var src_trailer_split = src_trailer.split('.');
		var src_extention = '.' + src_trailer_split[1];
		var new_src = src_leader + '_' + src_count + src_extention;

		$(this).attr('src', new_src);
	})
}
function run_images () {
	if (image_index > 8) {
		image_index = 1
	}

	goto_image (image_index)

	setTimeout(function () {
	  run_images (image_index++)
	}, 500);
}
run_images ();
// -- end show thumbnail slideshow

// start delete record
function delete_record (link) {
	$.ajax({
		url: "/delete?" + link,
		context: document.body
	}).done(function() {
		$($('a[href="' + link + '"]')[0]).parent().remove();
		$("header span.results").html($("header span.results").html()-1)
	});
	
}
// --- end delete record

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}