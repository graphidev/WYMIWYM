What You Mark Is What You Mean
==============================

But please call me **WYMIWYM**.

**Dislaimer**:
This project is a prototype still in development.

Dependencies
------------

WYMIWYM is based on [CodeMirror](https://github.com/codemirror/CodeMirror/) provided by [Marijn Haverbeke](http://marijnhaverbeke.nl/) (a big thanks to him) !


Features
--------

This editor is a markdown specific extension of CodeMirror. It provides :

- keyboards shortcuts (Mac compatible, replace `CTRL` by `CMD`):
    - `CTRL+I` : Toggle italic markup
    - `CTRL+B` : Toggle bold markup
    - `CTRL+D` : Toggle strikethrough markup
    - `CTRL+K` : Set link markup
    - `CTRL+L` : Toggle unordered list markup
    - `CTRL+E` : Toggle quote markup
    - `CTRL+SHIFT+L` : Toggle ordered list markup
    - `CTRL+SHIFT+D` : Duplicate selected lines
    - `TAB` : Indent selected lines
    - `SHIFT+TAB` : Unindent selected lines
    - `ENTER` : Indent lists continuity
    - `SHIFT+ENTER` : Indent lists continuity

- default behavior overrinding
- Optimised syntax coloration
- Extensibility as of methods may be called outsite of the object


Usage
-----

This is as simple as this :

``` javascript
var editor = new Wymiwym(
    document.querySelector('textarea[name="content"]')
);
```

Then you can implement interactions with these methods :

- `toggleBold()`
- `toggleItalic()`
- `toggleDelete()`
- `toggleOrderedList()`
- `toggleUnorderedList()`
- `indentLines()`
- `unindentLines()`

Check the source code for more.


A word on markup methods
------------------------

### Inline

Inline toggling markup methods (such as `toggleBold`, `toggleItalic`, `toggleDelete`) match the markup arround and inside before adding or removing markup.

Here is a sample :
Note: brackets match cursor selection. eg: `here is [selection]`

``` markdown
This text contains **[bold]**, [_italic_] and something that should be [deleted].
```

When toggling markup, this will be rederend :

``` markdown
This text contains [bold], [italic] and something that should be ~~[deleted]~~.
```

### Block

Block toggling methods markup try to match first lines charaters markup. If it doesn't, markup is added at the beggining of the line.


Know issues
-----------

As of CodeMirror does not provide an API for multiple cursors position (other than `start`, `end` and `main`), some trouble may appear by using the multiple selection.

Prefer selecting multiple lines within one only selection.


license
-------

WYMIWYM is under [MIT License](https://opensource.org/licenses/MIT).

```
Copyright (c) 2016 Sébastien ALEXANDRE

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```
