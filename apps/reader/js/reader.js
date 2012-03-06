'use strict';

/*
 * requires js-epub, found at https://github.com/augustl/js-epub
 */

function update(file)
{
  var reader = new FileReader();
  reader.readAsBinaryString(file.item(0));

  reader.onload = function(event)
  {
    createBook(reader.result);
  };
}

var book;
function createBook(epub)
{
  book = new JSEpub(epub);
  book.processInSteps(function(step, extras)
  {
    if (step === 5) {
      var style = document.createElement('style');
      style.id = 'pageStyle';
      document.body.appendChild(style);

      var fileBox = document.getElementById('fileHolder');
      fileBox.style.display = 'none';
      showChapter();
    }
  });
}

var page = 0;
var chapter = 0;
function showChapter() {
  document.getElementById('pageStyle').innerHTML = '';
  if (!book.opf.spine[chapter])
  {
    book = null;
    document.getElementsByTagName('input')[0].value = '';
    document.getElementById('fileHolder').style.display = 'block';
    document.getElementById('pages').innerHTML = '';
    chapter = 0;
    page = 0;
    return;
  }
  var spine = book.opf.spine[chapter];
  var href = book.opf.manifest[spine]['href'];
  var doc = book.files[href];
  var html = new XMLSerializer().serializeToString(doc);
  var bookBox = document.getElementById('pages');
  bookBox.innerHTML = html;

  var totalHeight = (window.innerHeight + window.scrollMaxY);
  var contentWidth = window.innerWidth;

  if (totalHeight - 40 > window.innerHeight)
  {
    contentWidth = (window.innerWidth > window.innerHeight) ?
      ((totalHeight / window.innerHeight) * window.innerWidth) + (window.innerWidth) :
      ((totalHeight / window.innerHeight) * window.innerHeight) + window.innerHeight;
    var numCols = Math.ceil(contentWidth / (window.innerWidth - 80));
    contentWidth = numCols * window.innerWidth;
  }
  var style = '#pages{' +
    ' -moz-column-width: ' + (window.innerWidth - 80) + 'px!important;' +
    ' width: ' + contentWidth + 'px!important;' +
    '-moz-column-gap: 80px;' +
    'margin-left: 40px;}';

    document.getElementById('pageStyle').innerHTML = style;
  chapter += 1;
  document.addEventListener('click', nextPage, false);
}

function nextPage() {
  var pages = document.getElementById('pages');
  if (((page + 1) * (window.innerWidth + 2)) >= (window.innerWidth + window.scrollMaxX))
  {
    showChapter();
    page = 0;
    pages.setAttribute('style', '-moz-transform: translate(0, 0);');
    return;
  }
  //var direction = forward ? 1 : -1;
  pages.setAttribute('style', '-moz-transform: translate(-' +
        ((page + 1) * (window.innerWidth + 1)) + 'px, 0);');

  page += 1;
}


window.onload = function()
{
  var fileBox = document.getElementsByTagName('input')[0];
  fileBox.addEventListener('change',
      function() {update(fileBox.files);},
      false);
};

