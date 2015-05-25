assert = require("chai").assert

require "../src/backlog-markup"

describe 'Backlog', ->
  describe 'Backlog_InLine.parsePart', ->
    parse = null

    beforeEach ->
      parse = Backlog_InLine.parsePart

    it "''", ->
      assert.equal parse("aaa''bb''ccc"), 'aaa **bb** ccc'

    it "'''", ->
      assert.equal parse("aaa'''bb'''ccc"), 'aaa *bb* ccc'

    it '%%', ->
      assert.equal parse("aaa%%bb%%ccc"), 'aaa ~~bb~~ ccc'

    it 'multiple', ->
      assert.equal parse("aaa''bbb''%%ccc%%ddd"), 'aaa **bbb** ~~ccc~~ ddd'

    it 'nested', ->
      assert.equal parse("a''a'''a%%bb%%c'''c''c"), 'a **a *a ~~bb~~ c* c** c'

    it 'same multiple', ->
      assert.equal parse("aaa''bbb'' ''ccc''ddd"), 'aaa **bbb** **ccc** ddd'

  describe '#parse()', ->
    h = null
    parse = (str) -> h.parse str

    beforeEach ->
      h = new Backlog()

    it '*', ->
      i = """
*Hello, '''World'''!
"""
      # console.log(parse(i))
      assert.equal parse(i), """
# Hello, *World* !
"""
#     it '*_2', ->
#       i = """
# *Hello, World!
# This is Text::Backlog.
# """
#       # console.log(parse(i))
#       assert.equal parse(i), """
# # Hello, World!
#
# This is Text::Backlog.
# """
#     it '*_3', ->
#       i = """ *Hello, World!
# This is Text::Backlog.
# """
#       # console.log(parse(i))
#       assert.equal parse(i), """
#  *Hello, World!
#
# This is Text::Backlog.
# """
#     it '*_4', ->
#       i = """
# *Good morning
#
# It's morning.
#
# *Good afternoon
#
# Beautiful day!
# """
#       # console.log(parse(i))
#       assert.equal parse(i), """
# # Good morning
#
# It's morning.
#
# # Good afternoon
#
# Beautiful day!
# """
    it '**', ->
      i = """
**Hello, Japan!

This is Text::Backlog.
"""
      # console.log(parse(i))
      assert.equal parse(i), """
## Hello, Japan!

This is Text::Backlog.
"""
    it '***', ->
      i = """
***Hello, Tokyo!

This is Text::Backlog.
"""
      # console.log(parse(i))
      assert.equal parse(i), """
### Hello, Tokyo!

This is Text::Backlog.
"""
    it '****', ->
      i = """
****Hello, Tokyo!

This is Text::Backlog.
"""
      # console.log(parse(i))
      assert.equal parse(i), """
#### Hello, Tokyo!

This is Text::Backlog.
"""
    it '*****', ->
      i = """
*****Hello, Tokyo!

This is Text::Backlog.
"""
      # console.log(parse(i))
      assert.equal parse(i), """
##### Hello, Tokyo!

This is Text::Backlog.
"""
    it '******', ->
      i = """
******Hello, Tokyo!

This is Text::Backlog.
"""
      # console.log(parse(i))
      assert.equal parse(i), """
###### Hello, Tokyo!

This is Text::Backlog.
"""
#     it '>', ->
#       i = """
# >Hi!
# """
#       # console.log(parse(i))
#       assert.equal parse(i), """
# > Hi!
# """
#     it '>_2', ->
#       i = """
# >Hi!
# >Hi-C
# """
#       # console.log(parse(i))
#       assert.equal parse(i), """
# > Hi!
# > Hi-C
# """
#     it '{quote}', ->
#       i = """
# {quote}
# quoted
# {/quote}
# """
#       # console.log(parse(i))
#       assert.equal parse(i), """
# > quoted
# """
#     it '{quote}_2', ->
#       i = """ {quote}\n unquoted\n {/quote}
# """
#       # console.log(parse(i))
#       assert.equal parse(i), """
#  {quote}
#  unquoted
#  {/quote}
# """
#     it '-', ->
#       i = """
# -komono
# -kyoto
# -shibuya
# """
#       # console.log(parse(i))
#       assert.equal parse(i), """
# * komono
# * kyoto
# * shibuya
# """
#     it '-_2', ->
#       i = """
# -komono
# --kyoto
# ---shibuya
# --hachiyama
# """
#       # console.log(parse(i))
#       assert.equal parse(i), """
# * komono
#   * kyoto
#     * shibuya
#   * hachiyama
# """
#     it '-_3', ->
#       i = """
# -list
# --ul
# --ol
# -pre
# """
#       # console.log(parse(i))
#       assert.equal parse(i), """
# * list
#     * ul
#     * ol
# * pre
# """
#     it '-_4', ->
#       i = " - wrong list\n - what's happen?"
#       # console.log(parse(i))
#       assert.equal parse(i), """
#  - wrong list
#
#  - what's happen?
# """
#     it '-_5', ->
#       i = """
# - right list
#  - wrong list
#  - what's happen?
# """
#       # console.log(parse(i))
#       assert.equal parse(i), """
# * right list
#
#  - wrong list
#
#  - what's happen?
# """
#     it '-_6', ->
#       i = """
# -Japan
# --Kyoto
# --Tokyo
# -USA
# --Mountain View
# """
#       # console.log(parse(i))
#       assert.equal parse(i), """
# * Japan
#     * Kyoto
#     * Tokyo
# * USA
#     * Mountain View
# """
#     it '-_7', ->
#       i = """
# -komono
# --kyoto
# ---shibuya
# --hachiyama
# """
#       # console.log(parse(i))
#       assert.equal parse(i), """
# * komono
#     * kyoto
#         * shibuya
#     * hachiyama
# """
#     it '+', ->
#       i = """
# +Register
# +Login
# +Write your blog
# """
#       # console.log(parse(i))
#       assert.equal parse(i), """
# 1. Register
# 1. Login
# 1. Write your blog
# """
#     it '+_2', ->
#       i = """
# -Steps
# ++Register
# ++Login
# ++Write your blog
# -Option
# --180pt
# """
#       # console.log(parse(i))
#       assert.equal parse(i), """
# * Steps
#     1. Register
#     1. Login
#     1. Write your blog
# * Option
#     * 180pt
# """
#     it '{code}', ->
#       i = """
# {code}
# #!/usr/bin/perl
#
# my $url = 'http://www.backlog.jp/';
# {/code}
# """
#       # console.log(parse(i))
#       assert.equal parse(i), """
# ```
# #!/usr/bin/perl
#
# my $url = 'http://www.backlog.jp/';
# ```
# """
#     it '{code}_2', ->
#       i = """
# {code:perl}
# #!/usr/bin/perl
#
# my $url = 'http://www.backlog.jp/';
# {/code}
# """
#       # console.log(parse(i))
#       assert.equal parse(i), """
# ```perl
# #!/usr/bin/perl
#
# my $url = 'http://www.backlog.jp/';
# ```
# """
#     it '{code}_3', ->
#       i = """
# {code}
# {quote}
# unquoted
# {/quote}
# - unlisted
# {/code}
# """
#       # console.log(parse(i))
#       assert.equal parse(i), """
# ```
# {quote}
# unquoted
# {/quote}
# - unlisted
# ```
# """
#     it '|', ->
#       i = """
# |Lang|Module|
# |Perl|Text::Backlog|
# """
#       # console.log(parse(i))
#       assert.equal parse(i), """
# | Lang | Module |
# |---|---|
# | Perl | Text::Backlog |
# """
#     it '|_2', ->
#       i = """
# |Lang|Module|h
# |Perl|Text::Backlog|
# """
#       # console.log(parse(i))
#       assert.equal parse(i), """
# | Lang | Module |
# |---|---|
# | Perl | Text::Backlog |
# """
#     it '|_3', ->
#       i = """
# |~No.1|aaa|bbb|
# |~No.2|ccc|ddd|
# """
#       # console.log(parse(i))
#       assert.equal parse(i), """
# | **No.1** | aaa | bbb |
# |---|---|
# | **No.2** | ccc | ddd |
# """
#     it '&br;', ->
#       i = """
# aaa&br;bbb
# """
#       # console.log(parse(i))
#       assert.equal parse(i), """
# aaa bbb
# """
#     it '#contents', ->
#       i = """
# #contents
# """
#       # console.log(parse(i))
#       assert.equal parse(i), """
# [toc]
# """
#     it '#rev()', ->
#       i = """
# #rev(11)
# """
#       # console.log(parse(i))
#       assert.equal parse(i), """
# #rev(11)
# """
#     it '#rev()_2', ->
#       i = """
# #rev(app:deadbeef)
# """
#       # console.log(parse(i))
#       assert.equal parse(i), """
# #rev(app:deadbeef)
# """
#     it '#thumbnail()', ->
#       i = """
# #thumbnail(11)
# """
#       # console.log(parse(i))
#       assert.equal parse(i), """
# ![][11]
# """
#     it '#image()', ->
#       i = """
# #image(11)
# """
#       # console.log(parse(i))
#       assert.equal parse(i), """
# ![][11]
# """
#     it '#image()_2', ->
#       i = """
# #image(https://www.backlog.jp/shared/img/logo_site.png)
# """
#       # console.log(parse(i))
#       assert.equal parse(i), """
# ![][https://www.backlog.jp/shared/img/logo_site.png]
# """
#     it '#attach(sample.zip:11)', ->
#       i = """
# #attach(sample.zip:11)
# """
#       # console.log(parse(i))
#       assert.equal parse(i), """
# [sample.zip][11]
# """
#     it '\\(¥¥)', ->
#       i = """
# \\%\\%Not Striked\\%\\%
# \\\\Home\hoge\hoge2
# """
#       # console.log(parse(i))
#       assert.equal parse(i), """
# %%Not Striked%%
# \\Home\hoge\hoge2
# """
#     it '\'\'', ->
#       i = """
# This is ''Bold''.
# """
#       # console.log(parse(i))
#       assert.equal parse(i), """
# This is **Bold**.
# """
#     it '\'\'\'', ->
#       i = """
# This is '''Italic'''.
# """
#       # console.log(parse(i))
#       assert.equal parse(i), """
# This is *Italic*.
# """
#     it '%%', ->
#       i = """
# This is %%Strike%%.
# """
#       # console.log(parse(i))
#       assert.equal parse(i), """
# This is ~~Strike~~.
# """
#     it '&color(red)', ->
#       i = """
# This is &color(red) { Red }.
# """
#       # console.log(parse(i))
#       assert.equal parse(i), """
# This is **Red**.
# """
#     it '&color(#ffffff, #8abe00)', ->
#       i = """
# This is &color(#ffffff, #8abe00) { Background }.
# """
#       # console.log(parse(i))
#       assert.equal parse(i), """
# This is **Background**.
# """
#     it '[[]]', ->
#       i = """
# [[Hoge]]
# """
#       # console.log(parse(i))
#       assert.equal parse(i), """
# [[Hoge]]
# """
#     it '[[]]_2', ->
#       i = """
# [[Backlog>http://www.backlog.jp/]] is the best.
# """
#       # console.log(parse(i))
#       assert.equal parse(i), """
# [Backlog](http://www.backlog.jp/) is the best.
# """
#     it '[[]]_3', ->
#       i = """
# [[Backlog:http://www.backlog.jp/]] is the best.
# """
#       # console.log(parse(i))
#       assert.equal parse(i), """
# [Backlog](http://www.backlog.jp/) is the best.
# """
