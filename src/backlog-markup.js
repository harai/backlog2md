// from prototype.js
Object.extend = function(destination, source) {
  for (property in source) {
    destination[property] = source[property];
  }
  return destination;
};

String.times = function(str, time) {
  var s = "";
  for (var i = 0; i < time; i++) s += str;
  return s;
};

String._escapeHTML = function(s) {
  s = s.replace(/\&/g, "&amp;");
  s = s.replace(/</g, "&lt;");
  s = s.replace(/>/g, "&gt;");
  s = s.replace(/"/g, "&quot;");
  s = s.replace(/\'/g, "&#39;");
  s = s.replace(/\\/g, "&#92;");
  return s;
};

String._escapeInsidePre = function(s) {
  s = s.replace(/\&/g, "&amp;");
  s = s.replace(/</g, "&lt;");
  s = s.replace(/>/g, "&gt;");
  return s;
};

String._unescapeHTML = function(s) {
  s = s.replace(/&amp;/g, "&");
  s = s.replace(/&lt;/g, "<");
  s = s.replace(/&gt;/g, ">");
  s = s.replace(/&quot;/g, "\"");
  return s;
};


Backlog = function() {};
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


Backlog_Context = function(args) {
  this.self = {
    text: args["text"],
    resultLines: [],
    noparagraph: false,
    indent: 0,
    indentStr: "    ",
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
    this.self.lines = this.self.text.split('\n');
    this.self.index = -1;
  },

  getResult: function() {
    return this.self.resultLines.join("\n");
  },

  putLineWithIndent: function(line) {
    if (this.self.noparagraph) {
      this.self.resultLines.push(line);
      return;
    }
    var iStr = String.times(this.self.indentStr, this.self.indent);
    this.self.resultLines.push(iStr + line);
  },

  putLineWithoutIndent: function(line) {
    this.self.resultLines.push(line);
  },

  putLine: function(line) {
    this.self.resultLines.push(line);
  },

  getLastPut: function() {
    return this.self.resultLines[this.self.resultLines.length - 1];
  },

  isParagraphSuppressed: function() {
    return this.self.noparagraph;
  },

  suppressParagraph: function(b) {
    this.self.noparagraph = b;
  },

  indent: function(f, num) {
    var n = (num == null) ? 1 : num;
    this.self.indent += n;
    var res = f();
    this.self.indent -= n;
    return res;
  },
};


Backlog_Node = function() {};
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


Backlog_LinkNode = {
  replaceLinksInLine: function(text) {
    return text.replace(/\[(https?:\/\/[^\]\s]+?)(?::([^\]\n]*))?\]/g, function($0, url, str) {
      return '<a href="' + String._escapeHTML(url) + '">' + (str ? str : url) + '</a>';
    });
  },
};


Backlog_InLine = {
  parsePart: function(text) {
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

    var ts = lexInLine(text, []);
    return deLexToMd(ts, []);
  }
};


Backlog_BrNode = function() {};
Backlog_BrNode.prototype = Object.extend(new Backlog_Node(), {
  parse: function() {
    var c = this.self.context;
    var l = c.next();
    if (l.length != 0) {
      return;
    }
    var t = String.times(c.indentStr, c.indent);
    if (c.getLastPut() == t + "<br />" || c.getLastPut() == t) {
      c.putLine("<br />");
    } else {
      c.putLineWithoutIndent("", true);
    }
  }
});


Backlog_CDataNode = function() {};
Backlog_CDataNode.prototype = Object.extend(new Backlog_Node(), {
  parse: function() {
    var c = this.self.context;
    c.putLine(c.next());
  }
});


Backlog_QuoteNode = function() {};
Backlog_QuoteNode.prototype = Object.extend(new Backlog_Node(), {
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

Backlog_HnNode = function() {};
Backlog_HnNode.prototype = Object.extend(new Backlog_Node(), {
  pattern: /^(\*{1,6})\s*(.*)$/,

  parse: function(match) {
    var c = this.self.context;
    c.next();
    var depth = String.times('#', match[1].length);
    c.putLine(depth + ' ' + Backlog_InLine.parsePart(match[2], c));
  }
});


Backlog_ListNode = function() {};
Backlog_ListNode.prototype = Object.extend(new Backlog_Node(), {
  pattern: /^([\-\+]+)\s*(.*)$/,

  parse: function() {
    var c = this.self.context;

    var m;
    while (c.hasNext() && (m = this.canParse(c.peek()))) {
      c.next();
      var indent = String.times('    ', m[1].length - 1);
      var listType = m[1].substr(0, 1) == '-' ? '* ' : '1. ';
      c.putLine(indent + listType + Backlog_InLine.parsePart(m[2], c));
    }
  }
});


Backlog_PNode = function() {};
Backlog_PNode.prototype = Object.extend(new Backlog_Node(), {
  parse: function() {
    var c = this.self.context;
    c.putLine(Backlog_InLine.parsePart(c.next(), c));
  }
});


Backlog_Quote2Node = function() {};
Backlog_Quote2Node.prototype = Object.extend(new Backlog_Node(), {
  pattern: /^\{quote\}\s*$/,
  endPattern: /^\{\/quote\}\s*$/,

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


Backlog_CodeNode = function() {};
Backlog_CodeNode.prototype = Object.extend(new Backlog_Node(), {
  pattern: /^\{code(?:\:(\S*))?\}\s*$/,
  endPattern: /^\{\/code\}\s*$/,

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


Backlog_TableNode = function() {};
Backlog_TableNode.prototype = Object.extend(new Backlog_Node(), {
  pattern: /^\|(.*)\|h?\s*$/,

  parse: function() {
    var _this = this;
    var c = _this.self.context;

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
        c.putLine('|' + String.times('---|', cells.length));
        isFirst = false;
      }
    }
  }
});


Backlog_SectionNode = function() {};
Backlog_SectionNode.prototype = Object.extend(new Backlog_Node(), {
  childNodes: [
    'hn', 'quote', 'quote2', 'list', 'code', 'table'
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
    n.node.parse(n.match);
  },

  _findNode: function(l, nodes) {
    var c = this.self.context;

    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var m;
      if (m = node.canParse(l)) {
        return {
          node: node,
          match: m
        };
      }
    }

    var node2;
    if (l.length == 0) {
      node2 = new Backlog_BrNode();
    } else if (c.isParagraphSuppressed()) {
      node2 = new Backlog_CDataNode();
    } else {
      node2 = new Backlog_PNode();
    }
    node2._new({
      context: c
    });
    return {
      node: node2,
      match: null
    };
  }
});


Backlog_BlockquoteNode = function() {};
Backlog_BlockquoteNode.prototype = Object.extend(new Backlog_SectionNode(), {
  pattern: /^>(?:(https?:\/\/.*?)(:.*)?)?>$/,
  endPattern: /^<<$/,
  childNodes: ["h4", "h5", "h6", "blockquote", "dl", "list", "pre", "superpre", "table",
    "gimage", "tex"
  ],

  parse: function(match) {
    var _this = this;
    var c = _this.self.context;
    var cite = null;
    var beginTag = null;
    if (match[1]) {
      var url = match[1];
      var title = String._escapeHTML(match[2] ? match[2].substr(1) : url);
      beginTag = '<blockquote title="' + title + '" cite="' + url + '">';
      cite = '<cite><a href="' + url + '">' + title + '</a></cite>';
    } else {
      beginTag = "<blockquote>";
    }
    c.next();
    var nodes = _this._getChildNodes();
    c.putLine(beginTag);
    c.indent(function() {
      while (c.hasNext()) {
        if (c.peek().match(_this.endPattern)) {
          c.next();
          break;
        }
        _this._parseWithFoundNode(c.peek(), nodes);
      }
      if (cite) {
        c.putLine(cite);
      }
    });
    c.putLine("</blockquote>");
  }
});


Backlog_TagNode = function() {};
Backlog_TagNode.prototype = Object.extend(new Backlog_SectionNode(), {
  pattern: /^>(<.*)$/,
  endPattern: /^(.*>)<$/,
  childNodes: ["h4", "h5", "h6", "blockquote", "dl", "list", "pre", "superpre", "table",
    "gimage", "tex"
  ],

  parse: function(match) {
    var _this = this;
    var c = this.self.context;
    c.next();
    c.suppressParagraph(true);
    var nodes = _this._getChildNodes();
    c.putLine(Backlog_InLine.parsePart(match[1], c));
    while (c.hasNext()) {
      var m2;
      if (m2 = c.peek().match(_this.endPattern)) {
        c.next();
        c.putLine(Backlog_InLine.parsePart(m2[1], c));
        break;
      }
      c.indent(function() {
        _this._parseWithFoundNode(c.peek(), nodes);
      });
    }
    c.suppressParagraph(false);
  }
});


Backlog_TaglineNode = function() {};
Backlog_TaglineNode.prototype = Object.extend(new Backlog_SectionNode(), {
  pattern: /^>(<.*>)<$/,

  parse: function(match) {
    var c = this.self.context;
    c.next();
    c.putLine(Backlog_InLine.parsePart(match[1], c));
  }
});


Backlog_MoreNode = function() {};
Backlog_MoreNode.prototype = Object.extend(new Backlog_SectionNode(), {
  pattern: /^={3,}\s*$/,

  parse: function(match) {
    var c = this.self.context;
    c.next();
    c.putLineWithoutIndent("<!-- more -->");
    c.putLineWithoutIndent('<!--emPreview--><div class="previewOnly">&lt;!-- more --&gt;</div><!--/emPreview-->');
  }
});


Backlog_TexNode = function() {};
Backlog_TexNode.replaceTexInLine = function(text) {
  return text.replace(/\[tex:([^\]]+)\]/g, function(matchStr, tex) {
    return Backlog_TexNode.getTag(tex, true);
  });
};
Backlog_TexNode.getTag = function(tex, isInline) {
  // just for safety (though it won't happen)
  tex = tex.replace(/script/g, "scri pt");

  if (isInline) {
    return '<script type="math/tex">' + tex + '</script>';
  }
  return '<script type="math/tex; mode=display">' + tex + '</script>';
};
Backlog_TexNode.prototype = Object.extend(new Backlog_SectionNode(), {
  pattern: /^\[tex:([^\]]+)\]\s*$/,

  parse: function(match) {
    var _this = this;
    var c = _this.self.context;
    c.next();

    c.putLine(Backlog_TexNode.getTag(match[1], false));
  },
});
