
var bloggerBacklogMarkup = function() {
  var insertBefore = function(base, inserting) {
    base.parentNode.insertBefore(inserting, base);
  };

  var createButton = function(eventCallback) {
    var b = document.createElement('button');
    b.classList.add('Btn-gray');
    var msg = document.createTextNode('Markdownに変換')
    b.appendChild(msg);
    b.style.padding = '5px 30px';
    b.style.margin = '0 30px';
    b.style.float = 'left';
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

  var domChecker = (function() {
    var selectors = [];
    var foundNodes = [];

    var observer = new MutationObserver(function() {
      selectors.forEach(function (s) {
        Array.prototype.forEach.call(s.target.querySelectorAll(s.selector), function (e) {
          if (foundNodes.indexOf(e) !== -1) {
            return;
          }
          foundNodes.push(e);
          s.callback(e);
        });
      });
    });

    return {
      add: function (selector, target, callback) {
        selectors.push({
          selector: selector,
          callback: callback,
          target: target
        });

        if (target) {
          observer.observe(target, {childList: true, subtree: true});
        }
      }
    };
  })();

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

  var issuePage = (function() {
    var el = document.getElementById('issue.description');
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
        insertBefore(document.getElementById('setParentIssue'), btn);
      },
    };
  })();

  var commentPage = (function() {
    domChecker.add('.Comment-editor', document.getElementById('comments'), function (el) {
      var te = el.querySelector('textarea');
      var btn = createButton(function() {
        te.value = new Backlog().parse(te.value);
      });
      insertBefore(el.querySelector('button'), btn);
    });
  })();

  var pages = [
    wikiPage,
    issuePage,
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
