assert = require("chai").assert

require "../src/backlog-markup"

describe 'Backlog', ->
    describe '#parse()', ->
        h = null
        parse = (str) -> h.parse str

        beforeEach ->
            h = new Backlog()

        it 'should parse normal markup', ->
            i = """
*はてな記法JavaScript
はてな記法ワープロは JavaScript ならではの利点を生かしたダイナミックなワープロです。

試しに色々入力してみてください。即座に出力画面が反映されます((Windows 版 IE6 および Firefox 1.0 でのみ確認しています))。
*変更履歴
|日付|内容|h
|2005/12/1|ソース機能追加 (HTMLソースを表示できます)|
|2005/11/21|はてな記法ワープロ完成|
|2005/11/13|text-backlog.js 移植開始|
"""
            # console.log(parse(i))
            assert.equal parse(i), """
# はてな記法JavaScript

はてな記法ワープロは JavaScript ならではの利点を生かしたダイナミックなワープロです。

試しに色々入力してみてください。即座に出力画面が反映されます((Windows 版 IE6 および Firefox 1.0 でのみ確認しています))。

# 変更履歴

| 日付 | 内容 |
|---|---|
| 2005/12/1 | ソース機能追加 (HTMLソースを表示できます) |
| 2005/11/21 | はてな記法ワープロ完成 |
| 2005/11/13 | text-backlog.js 移植開始 |
"""
