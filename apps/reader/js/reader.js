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
    if(step === 5) { 
      var style = document.createElement("style");
      style.id="pageStyle";
      document.body.appendChild(style);

      var fileBox = document.getElementById("fileHolder");
      fileBox.style.display = 'none';
      showPage();
    }
  }); 
}

var page = 0;
function showPage() {
  document.getElementById('pageStyle').innerHTML = "";
  var spine = book.opf.spine[page];
  var href = book.opf.manifest[spine]['href'];
  var doc = book.files[href];
  var html = new XMLSerializer().serializeToString(doc);
  var bookBox = document.getElementById("pages");
  bookBox.innerHTML = html;
  var ratio = window.innerHeight / window.innerWidth;
  var totalHeight = window.innerHeight + window.scrollMaxY;
  var style = '#pages {-moz-column-width: '+(window.innerWidth - (window.innerWidth * 0.2))+'px!important; width: '+((totalHeight / ratio) + window.innerHeight / ratio)+'px!important;-moz-column-gap: 100px;padding-right: 100px;}';
    document.getElementById("pageStyle").innerHTML = style;
  page += 1;
  document.getElementById('pages').addEventListener('click', showPage, false);
}


window.onload = function()
{
  var fileBox = document.getElementsByTagName('input')[0];
  fileBox.addEventListener('change', function() {update(fileBox.files);}, false);
}

