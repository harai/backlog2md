
var extendObject = function(destination, source) {
  for (property in source) {
    destination[property] = source[property];
  }
  return destination;
};

var strUtil = {};
strUtil.times = function(str, time) {
  var s = "";
  for (var i = 0; i < time; i++) s += str;
  return s;
};

strUtil._escapeHTML = function(s) {
  s = s.replace(/\&/g, "&amp;");
  s = s.replace(/</g, "&lt;");
  s = s.replace(/>/g, "&gt;");
  s = s.replace(/"/g, "&quot;");
  s = s.replace(/\'/g, "&#39;");
  s = s.replace(/\\/g, "&#92;");
  return s;
};

strUtil._escapeInsidePre = function(s) {
  s = s.replace(/\&/g, "&amp;");
  s = s.replace(/</g, "&lt;");
  s = s.replace(/>/g, "&gt;");
  return s;
};

strUtil._unescapeHTML = function(s) {
  s = s.replace(/&amp;/g, "&");
  s = s.replace(/&lt;/g, "<");
  s = s.replace(/&gt;/g, ">");
  s = s.replace(/&quot;/g, "\"");
  return s;
};

var decomposite = function(regexp, str) {
  var r;
  if (!(r = regexp.exec(str))) {
    return {
      before: str,
      after: '',
      match: [],
    };
  }
  return {
    before: str.substr(0, r.index),
    after: str.substr(r.index + r[0].length),
    match: r,
  };
};

var Backlog = function() {};
Backlog.prototype = {
  parse: function(text) {
    var c = new Backlog_Context({
      text: text,
    });

    var node = new Backlog_SectionNode();
    node._new({
      context: c
    });
    node.parse();

    return c.getResult();
  }
};


var Backlog_Context = function(args) {
  this.self = {
    text: args["text"],
    resultLines: [],
    prevIsParagraph: null,
    blanklineCount: 0,
  };
  this.init();
};
Backlog_Context.prototype = {
  init: function() {
    this.setInputText(this.self.text);
  },

  hasNext: function() {
    return (this.self.lines != null && this.self.lines.length - 1 > this.self.index);
  },

  peek: function() {
    return this.self.lines[this.self.index + 1];
  },

  next: function() {
    return this.self.lines[++this.self.index];
  },

  setInputText: function(text) {
    this.self.text = text.replace(/\r/g, "");
    this.self.lines = this.self.text.split('\n').map(function(l) {
      return decomposite(/\s*$/, l).before;
    });
    this.self.index = -1;
  },

  getResult: function() {
    return this.self.resultLines.join("\n");
  },

  getLastPut: function() {
    if (this.self.resultLines.length == 0) {
      return null;
    }
    return this.self.resultLines[this.self.resultLines.length - 1];
  },

  putLine: function(line) {
    this.self.resultLines.push(line);
  },

  stackBlankline: function() {
    this.self.blanklineCount++;
  },

  processBlanklines: function(nextIsParagraph) {
    try {
      if (this.self.prevIsParagraph === null) {
        return;
      }
      if (this.self.prevIsParagraph &&
        nextIsParagraph && 0 == this.self.blanklineCount) {
        return;
      }
      this.putLine('');
    } finally {
      this.self.prevIsParagraph = nextIsParagraph;
      this.self.blanklineCount = 0;
    }
  },
};


var Backlog_Node = function() {};
Backlog_Node.prototype = {
  pattern: "",

  _new: function(args) {
    if (args == null) {
      args = [];
    }
    this.self = {
      context: args["context"]
    };
  },

  parse: function() {
    alert('die');
  },

  canParse: function(line) {
    return line.match(this.pattern);
  }
};


var Backlog_LinkNode = {
  replaceLinksInLine: function(text) {
    return text.replace(/\[(https?:\/\/[^\]\s]+?)(?::([^\]\n]*))?\]/g, function($0, url, str) {
      return '<a href="' + strUtil._escapeHTML(url) + '">' + (str ? str : url) + '</a>';
    });
  },
};


var Backlog_InLine = {
  parsePart: function(text) {
    var PADDING = -1
    var ITALIC = 0;
    var BOLD = 1;
    var STRIKE = 2;

    var signs = [{
      backlog: "'''",
      md: '*',
    }, {
      backlog: "''",
      md: '**',
    }, {
      backlog: '%%',
      md: '~~',
    }];

    var lexInLine = function(text, tokens) {
      if (text === '') {
        return tokens;
      }

      var next;
      var m = decomposite(/\\|'''|''|%%/, text);
      switch (m.match[0]) {
      case '\\':
        if (m.after.length == 0) {
          next = '';
          tokens.push(m.before + '\\');
        } else {
          var p = m.after.substr(0, 1);
          switch (p) {
          case '\\':
          case "'":
          case '%':
            next = m.after.substr(1);
            tokens.push(m.before + p);
            break;
          default:
            next = m.after;
            tokens.push(m.before + '\\');
            break;
          }
        }
        break;
      case signs[ITALIC].backlog:
        next = m.after;
        tokens.push(m.before);
        tokens.push(ITALIC);
        break;
      case signs[BOLD].backlog:
        next = m.after;
        tokens.push(m.before);
        tokens.push(BOLD);
        break;
      case signs[STRIKE].backlog:
        next = m.after;
        tokens.push(m.before);
        tokens.push(STRIKE);
        break;
      default:
        next = m.after;
        tokens.push(m.before);
        break;
      }
      return lexInLine(next, tokens);
    };

    var deLexToBacklog = function(tokens) {
      var ts = tokens.filter(function(t) {
        return t !== '';
      });

      var res = '';

      for (var i = 0; i < ts.length; i++) {
        if (typeof ts[i] !== 'number') {
          res += ts[i];
          continue;
        }
        if (ts[i] !== PADDING) {
          res += signs[ts[i]].backlog;
          continue;
        }
        if (res.match(/\s$/)) {
          continue;
        }
        if (typeof ts[i + 1] === 'string' && ts[i + 1].match(/^\s/)) {
          continue;
        }
        res += ' ';
      }
      return res;
    };

    var deLexAndSquashToMd = function(tokens, start) {
      var middle = deLexToBacklog(tokens.slice(start + 1, -1));
      var end = signs[tokens[tokens.length - 1]].md;
      var begin = signs[tokens[start]].md;
      return tokens.slice(0, start).concat(
        [PADDING, begin + middle + end, PADDING]);
    };

    var deLexToMd = function(tokens, mdStack) {
      if (tokens.length === 0) {
        return deLexToBacklog(mdStack).trim();
      }
      var t = tokens.shift();
      if (typeof t === 'string') {
        mdStack.push(t);
        return deLexToMd(tokens, mdStack);
      }
      mdStack.push(t);
      for (var i = mdStack.length - 1 - 1; -1 < i; i--) {
        if (mdStack[i] === t) {
          mdStack = deLexAndSquashToMd(mdStack, i);
          break;
        }
      }
      return deLexToMd(tokens, mdStack);
    };

    text = Backlog_LinkNode.replaceInLine(text);
    text = Backlog_AttachNode.replaceInLine(text);
    var ts = lexInLine(text, []);
    return deLexToMd(ts, []);
  }
};


var Backlog_QuoteNode = function() {};
Backlog_QuoteNode.prototype = extendObject(new Backlog_Node(), {
  pattern: /^>\s*(.*)$/,

  parse: function() {
    var c = this.self.context;

    var m;
    while (c.hasNext() && (m = this.canParse(c.peek()))) {
      c.next();
      c.putLine('> ' + Backlog_InLine.parsePart(m[1], c));
    }
  }
});

var Backlog_HnNode = function() {};
Backlog_HnNode.prototype = extendObject(new Backlog_Node(), {
  pattern: /^(\*{1,6})\s*(.*)$/,

  parse: function(match) {
    var c = this.self.context;
    c.next();
    var depth = strUtil.times('#', match[1].length);
    c.putLine(depth + ' ' + Backlog_InLine.parsePart(match[2], c));
  }
});


var Backlog_ListNode = function() {};
Backlog_ListNode.prototype = extendObject(new Backlog_Node(), {
  pattern: /^([\-\+]+)\s*(.*)$/,

  parse: function() {
    var c = this.self.context;

    var m;
    while (c.hasNext() && (m = this.canParse(c.peek()))) {
      c.next();
      var indent = strUtil.times('    ', m[1].length - 1);
      var listType = m[1].substr(0, 1) == '-' ? '* ' : '1. ';
      c.putLine(indent + listType + Backlog_InLine.parsePart(m[2], c));
    }
  }
});


var Backlog_Quote2Node = function() {};
Backlog_Quote2Node.prototype = extendObject(new Backlog_Node(), {
  pattern: /^\{quote\}$/,
  endPattern: /^\{\/quote\}$/,

  parse: function() {
    var c = this.self.context;
    c.next();
    while (c.hasNext()) {
      if (c.peek().match(this.endPattern)) {
        c.next();
        break;
      }
      c.putLine('> ' + Backlog_InLine.parsePart(c.next(), c));
    }
  }
});


var Backlog_CodeNode = function() {};
Backlog_CodeNode.prototype = extendObject(new Backlog_Node(), {
  pattern: /^\{code(?:\:(\S*))?\}$/,
  endPattern: /^\{\/code\}$/,

  parse: function(match) {
    var c = this.self.context;
    c.next();
    c.putLine('```' + (match[1] || ''));
    while (c.hasNext()) {
      if (c.peek().match(this.endPattern)) {
        c.next();
        break;
      }
      c.putLine(c.next());
    }
    c.putLine('```');
  }
});


var Backlog_TableNode = function() {};
Backlog_TableNode.prototype = extendObject(new Backlog_Node(), {
  pattern: /^\|(.*)\|h?$/,

  parse: function() {
    var c = this.self.context;

    var m;
    var isFirst = true;
    while (c.hasNext() && (m = this.canParse(c.peek()))) {
      c.next();
      var cells = m[1].split("|");
      var row = cells.map(function(c) {
        return ' ' + Backlog_InLine.parsePart(c.trim(), c) + ' ';
      }).join('|');
      c.putLine('|' + row + '|');
      if (isFirst) {
        c.putLine('|' + strUtil.times('---|', cells.length));
        isFirst = false;
      }
    }
  }
});


var Backlog_ContentsNode = function() {};
Backlog_ContentsNode.prototype = extendObject(new Backlog_Node(), {
  pattern: /^#contents$/,

  parse: function() {
    var c = this.self.context;
    c.next();
    c.putLine('[toc]');
  }
});


var Backlog_ImageNode = function() {};
Backlog_ImageNode.prototype = extendObject(new Backlog_Node(), {
  pattern: /^#(?:image|thumbnail)\(([^)]+)\)$/,

  parse: function(match) {
    var c = this.self.context;
    c.next();
    c.putLine('![][' + match[1] + ']');
  }
});


var Backlog_AttachNode = {
  replaceInLine: function(text) {
    return text.replace(/#attach\(([^)]+):(\d+)\)/g, function(_, name, id) {
      return '[' + name + '][' + id + ']';
    });
  },
};


var Backlog_LinkNode = {
  replaceInLine: function(text) {
    return text.replace(/\[\[((?:[^\]]|\][^\]])+)\]\]/g, function(_, name) {
      var m = decomposite(/[>:]([^:]+:[^:]+)$/, name);
      if (!m.match[0]) {
        return '[[' + name + ']]';
      }
      return '[' + m.before + '](' + m.match[1] + ')';
    });
  },
};

var Backlog_PNode = function() {};
Backlog_PNode.prototype = extendObject(new Backlog_Node(), {
  parse: function() {
    var c = this.self.context;
    c.putLine(Backlog_InLine.parsePart(c.next(), c));
  }
});


var Backlog_SectionNode = function() {};
Backlog_SectionNode.prototype = extendObject(new Backlog_Node(), {
  childNodes: [
    'hn', 'quote', 'quote2', 'list', 'code', 'table', 'contents', 'image'
  ],

  parse: function() {
    var _this = this;
    var c = _this.self.context;
    var nodes = _this._getChildNodes();
    while (c.hasNext()) {
      _this._parseWithFoundNode(c.peek(), nodes);
    }
  },

  _getChildNodes: function(names) {
    var c = this.self.context;
    var childNames = names || this.childNodes;
    return childNames.map(function(nodeStr) {
      var mod = 'Backlog_' + nodeStr.charAt(0).toUpperCase() + nodeStr.substr(1).toLowerCase() + 'Node';
      var n = eval("new " + mod + "()");
      n._new({
        context: c
      });
      return n;
    });
  },

  _parseWithFoundNode: function(l, nodes) {
    var n = this._findNode(l, nodes);
    if (n === null) {
      return;
    }
    n.node.parse(n.match);
  },

  _findNode: function(l, nodes) {
    var c = this.self.context;

    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var m;
      if (m = node.canParse(l)) {
        c.processBlanklines(false);
        return {
          node: node,
          match: m
        };
      }
    }

    if (l.length === 0) {
      c.stackBlankline();
      c.next();
      return null;
    }

    c.processBlanklines(true);
    var pnode = new Backlog_PNode();
    pnode._new({context: c});
    return {
      node: pnode,
      match: null
    };
  }
});

if (global) {
  global.Backlog = Backlog;
  global.Backlog_InLine = Backlog_InLine;
}
