console.log('hoge');

var bloggerBacklogMarkup = function() {
  var insertBefore = function(base, inserting) {
    base.parentNode.insertBefore(inserting, base);
  };

  var createButton = function(eventCallback) {
    var b = document.createElement('button');
    b.classList.add('Btn-gray');
    var msg = document.createTextNode('Markdownに変換')
    b.appendChild(msg);
    b.id = 'backlog2md';
    b.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      eventCallback(event);
      b.disabled = true;
      b.replaceChild(document.createTextNode('Markdownに変換しました'), msg);
    });
    return b;
  };

  var wikiPage = (function() {
    var el = document.getElementById('page.content');
    return {
      isShown: function() {
        return !!el;
      },

      getValue: function() {
        return el.value;
      },

      setValue: function(v) {
        el.value = v;
      },

      insertButton: function(btn) {
        insertBefore(document.getElementById('formButtons3'), btn);
      },
    };
  })();

  var pages = [
    wikiPage,
  ];

  var page = pages.filter(function(p) {
    return p.isShown();
  })[0];

  if (!page) {
    return;
  }

  var btn = createButton(function() {
    var blText = page.getValue();
    var mdText = new Backlog().parse(blText);
    page.setValue(mdText);
  });

  page.insertButton(btn);
};

bloggerBacklogMarkup();
