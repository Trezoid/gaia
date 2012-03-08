'use strict';

/*
 * requires js-epub, found at https://github.com/augustl/js-epub
 */
var mover = null;
function update(file)
{
  document.getElementById('menu').style.display = 'none';
  var reader = new FileReader();
  reader.readAsBinaryString(file.item(0));

  reader.onload = function(event)
  {
    createBook(reader.result);
  };

  /* swiping event listeners */
  document.addEventListener('mousedown',
      function(evt) {mover = new moving(evt);},
      false);

  document.addEventListener('mousemove',
      function(evt) {mover.mouseMove(evt);},
      false);

  document.addEventListener('mouseup',
      function(evt) {mover.mouseEnd(evt);},
      false);

  /* menu event listeners */
  var back = document.getElementById('back');
  var toggle = document.getElementById('toggle');
  
  back.addEventListener('click',
      function() {resetBook();},
      false);

  toggle.addEventListener('click',
      function() {toggleStyle();},
      false);

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

function resetBook() {
    book = null;
    document.getElementsByTagName('input')[0].value = '';
    document.getElementById('fileHolder').style.display = 'block';
    document.getElementById('pages').innerHTML = '';
    chapter = 0;
    page = 0;
    document.getElementById('menu').style.display = 'none';
}

var page = 0;
var chapter = 0;
function showChapter(dir) {
  document.getElementById('pageStyle').innerHTML = '';
  if (!book.opf.spine[chapter])
  {
    resetBook();
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
    var pageRatio = totalHeight / window.innerHeight;
    contentWidth = (window.innerWidth > window.innerHeight) ?
       (pageRatio * window.innerWidth) + (window.innerWidth) :
      (pageRatio * window.innerHeight) + window.innerHeight;

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
}

function nextPage(dir) {
  var pages = document.getElementById('pages');
  if (((page + dir) * (window.innerWidth + 2)) >=
      (window.innerWidth + window.scrollMaxX) ||
      (pages + dir < 0))
  {
    showChapter(dir);
    page = 0;
    pages.setAttribute('style', '-moz-transform: translate(0, 0);');
    return;
  }
  pages.setAttribute('style', '-moz-transform: translate(-' +
        ((page + dir) * (window.innerWidth + 1)) + 'px, 0);');

  page += dir;
}

function toggleMenu() {
  var menu = document.getElementById('menu');
  if (menu.style.display === 'none')
  {
    menu.style.display = 'block'; 
    menu.style.opacity = '1';
    return;
  }
  menu.style.opacity = '0';
  menu.style.display = 'none';
  /*
   * TODO: Make menus for useful functions
   * Primarily back to menu, page jump, bookmark(?)
   */
}

function toggleStyle() {
  var style = document.getElementById('style');
  if (style.getAttribute('href') === 'style/dark.css')
  {
    style.setAttribute('href', 'style/light.css');
    return;
  }
  style.setAttribute('href', 'style/dark.css');
}

var moving = function(evt) {
  this.pageStyle = document.getElementById('pages').style;
  this.startTime = evt.timeStamp;
  this.startX = evt.screenX;
  this.active = true;
};

moving.prototype = {
  mouseMove: function(callingEvt) {
    if (this.active === true)
    {
        var offset = callingEvt.screenX - this.startX;
        this.pageStyle.MozTransform = 'translateX(-' +
            ((page * (window.innerWidth + 1)) + (-1 * offset)) + 'px)';
    }
  },

  mouseEnd: function(callingEvt) {
      this.active = false;
      var offset = callingEvt.screenX - this.startX;
      if ((callingEvt.timeStamp - this.startTime) < 250) {
        toggleMenu();
        this.pageStyle.MozTransform = 'translateX(-' +
            (page * (window.innerWidth + 1)) + 'px)';

    } else if ((-1 * offset > (window.innerWidth / 4)) ||
        offset > (window.innerWidth / 4)) {

        var dir = offset > 0 ? -1 : 1;
        nextPage(dir);
        mover = null;

    } else {
        this.pageStyle.MozTransform = 'translateX(-' +
            (page * (window.innerWidth + 1)) + 'px)';
    }
  }
};

window.onload = function()
{
  var fileBox = document.getElementsByTagName('input')[0];
  fileBox.addEventListener('change',
      function() {update(fileBox.files);},
      false);
};

