'use strict';

/*
 * requires js-epub, found at https://github.com/augustl/js-epub
 */

function update(file)
{
  var reader = new FileReader();
  reader.onload = function(event)
  {
    createBook(reader.result);
  };
  reader.readAsBinaryString(file.item(0));
}
var book;
function createBook(epub)
{
      book = new JSEpub(epub);

book.processInSteps(function(step, extras)
{
  var msg;
  if (step === 1) {
    msg = "unzipping ";
  } else if (step === 2) {
    msg = "uncompressing " + extras;
  } else if (step === 3) {
    msg = "Reading OPF";
  } else if (step === 4) {
    msg = "Post processing";
  } else if (step === 5) {
    msg = "Finishing";
   showPage(0);
  } else {
    msg = "An error occured: " + step + extras;
    }
  console.log(msg)
}); 
  

}

function showPage(page) {
  var spine = book.opf.spine[page];
  var href = book.opf.manifest[spine]['href'];
  var doc = book.files[href];
  var html = new XMLSerializer().serializeToString(doc);
  var bookBox = document.getElementById("pages");
  bookBox.innerHTML = html;
  bookBox.addEventListener('click', function() {showPage(page + 1);}, false);
  var ratio = window.innerHeight / window.innerWidth;
  var totalHeight = (window.innerHeight + window.scrollMaxY);
  var style = '#pages {-moz-column-width: '+(window.innerWidth - 50)+'px!important; width: '+totalHeight / ratio+'px!important;-moz-column-gap:20px;}';
  if(document.getElementById("pageStyle") === null)
  {
    var newStyle = document.createElement("style");
    newStyle.id = "pageStyle"
    newStyle.innerHTML = style;
    document.body.appendChild(newStyle);
  } else {
    document.getElementById("pageStyle").innerHTML = style;
  }
  var fileBox = document.getElementById("fileHolder");
  fileBox.style.display = 'none';
}


window.onload = function()
{
  var fileBox = document.getElementsByTagName('input')[0];
  fileBox.addEventListener('change', function() {update(fileBox.files);}, false);
}

