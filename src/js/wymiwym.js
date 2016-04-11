/**
 * What You Mark Is What You Mean
 * (c) 2015 Sébastien ALEXANDRE
 * @licence Mit
 * @version 0.1
**/
(function(CodeMirror) {

    /**
     * Instanciate editor
     * ---
    **/
    function Wymiwym(container, opts) {

        if (!(this instanceof Wymiwym))
			return new Wymiwym(container, opts);

        /**
         * Set options
         * ----
        **/
        this.options = {
            mode:  'gfm',
            theme: 'wymiwym'
        };

        if(opts) {
            for (var opt in opts) {
                if (this.options.hasOwnProperty(opt))
                    this.options[opt] = opts[opt];
            }
        }

        /**
         * Instanciate editor
         * ---
        **/
        this.editor = CodeMirror.fromTextArea(container, {
            value: container.value,
             mode: {
                name: this.options.mode,
                highlightFormatting:true
            },
            addModeClass: true,
            theme: this.options.theme,
            showCursorWhenSelecting: true,
            tabSize: 2,
            // showInvisibles: true,
            lineWrapping: true,
            lineNumbers: false,
            matchBrackets: true,
            autoCloseBrackets: true,
            // viewportMargin: Infinity,
        });

        /**
         * Set keyboard shortcuts
         * ---
        **/
        var isMac = (CodeMirror.keyMap["default"] == CodeMirror.keyMap.macDefault);
        var prefix = (isMac ? 'Cmd' : 'Ctrl');
        var shortcuts = {
            'Tab': this.indentLines.bind(this),
            'Shift-Tab': this.unindentLines.bind(this),
            'Enter': 'newlineAndIndentContinueMarkdownList',
            'Shift-Enter': this.indentNewLine.bind(this)
        };

        shortcuts[prefix+'-B'] = this.toggleBold.bind(this),
        shortcuts[prefix+'-I'] = this.toggleItalic.bind(this),
        shortcuts[prefix+'-D'] = this.toggleDelete.bind(this),

        shortcuts[prefix+'-K'] = this.addLink.bind(this),
        shortcuts[prefix+'-L'] =  this.toggleUnorderedList.bind(this),
        shortcuts['Shift-'+prefix+'-L'] =  this.toggleOrderedList.bind(this),
        shortcuts[prefix+'-E'] =  this.toggleQuote.bind(this),

        shortcuts['Shift-'+prefix+'-D'] =  this.duplicateLines.bind(this),

        this.editor.addKeyMap(shortcuts);

        /**
         * Save editor on change
         * ---
        **/
        this.editor.on('change', function() {
            container.value = this.editor.getValue();
        }.bind(this));

        return this;

    }

    /**
     * Extend the editor
     * ---
    **/
    Wymiwym.prototype = {

        /**
         * Toggle bold markup
         * ---
        **/
        toggleBold: function() {
            this.toggleAround('**', '**');
        },

        /**
         * Toggle italic markup
         * ---
        **/
        toggleItalic: function() {
            this.toggleAround('_', '_');
        },

        /**
         * Toggle delete markup
         * ---
        **/
        toggleDelete: function() {
            this.toggleAround('~~', '~~');
        },

        /**
         * Add link markup
         * ---
        **/
        addLink: function() {

            this.addAround('[',']()', +2);

        },

        /**
         * Toggle quote block
         * ---
        **/
        toggleQuote: function() {

            this.toggleBefore('> ');

        },

        /**
         * Tab press event
         * ---
        **/
        indentLines: function () {
            this.addBefore("  ");
        },

        unindentLines: function() {
            this.removeBefore("  ");
        },


        /**
         * Back to new line prefixed with previous line indent
         * ---
        **/
        indentNewLine: function() {

            var doc = this.editor.getDoc();


            // Insert new line
            doc.replaceSelections("\n", 'end');

            // Not empty previous line
            var cursor = doc.getCursor('from');
            var prevLine = doc.getLine(cursor.line-1);
            if(prevLine !== -1 && prevLine.trim()) {

                var regexp = /^(\s)?(\-|\+|\*|[0-9]+\.)?(\s)?/;

                if(match = regexp.exec(prevLine)) {
                    this.addBefore("".padStart(match[0].length, " "));
                }

            }

        },

        /**
         * Toggle unordered list
         * ---
         * @todo var ordered = false as parameter
        **/
        toggleUnorderedList: function() {

            var doc     = this.editor.getDoc();
            var start   = doc.getCursor('from');
            var end     = doc.getCursor('to');

            var count  = 0;
            var isList = null;
            var regexp = /^(\s{0,})((\+|\*|\-)\s?)/; // YOLOOOO
            for(var i=start.line; i<=end.line; i++) {

                var line = doc.getLine(i);

                // Is this an ordered list ?
                if(match = /^(\s?)(([0-9]+\.)\s+)/.exec(line)) {

                    doc.replaceRange('',
                        {line: i, ch: 0},
                        {line: i, ch: match[0].length}
                    );

                    line = line.substr(match[0].length);
                    isList = false;

                }

                // Check for list syntax
                if(isList === null)  // Is first item part of a list ?
                    isList = regexp.test(line);

                // Remove markup
                if(isList) {

                    if(match = regexp.exec(line)) {

                        doc.replaceRange('',
                            {line: i, ch: 0},
                            {line: i, ch: match[0].length}
                        );

                    }

                }

                // Add markup
                else {
                    doc.replaceRange('- '+line.trim(), {line: i, ch: 0}, {line: i, ch:line.length});
                }

                count++;

            }

        },

        /**
         * Toggle ordered list
         * --------
         * @param   integer     initial = 1       Starting list number
        **/
        toggleOrderedList: function(evt, initial) {

            var doc     = this.editor.getDoc();
            var start   = doc.getCursor('from');
            var end     = doc.getCursor('to');

            if(!initial)
                var initial = 1;

            var count  = 0;
            var isList = null;
            var regexp = /^(\s?)([0-9]+\.\s?)/; // YOLOOOOOO
            var maxKeyLength  = String(end.line - start.line + 1).length;
            for(var i=start.line; i<=end.line; i++) {

                var index = initial + count;
                var line = doc.getLine(i);

                // Is this an unordered list ?
                if(match = /^(\s?)((\+|\*|\-)\s?)/.exec(line)) {

                    doc.replaceRange('',
                        {line: i, ch: 0},
                        {line: i, ch: match[0].length}
                    );

                    line = line.substr(match[0].length);
                    isList = false;

                }

                // Check for list syntax
                if(isList === null) // Is first item part of a list ?
                    isList = regexp.test(line);

                // Remove markup
                if(isList) {

                    if(match = regexp.exec(line)) {

                        doc.replaceRange('',
                            {line: i, ch: 0},
                            {line: i, ch: match[0].length}
                        );

                    }

                }

                // Add markup
                else {
                    var key = String(index).padStart(maxKeyLength, " ");
                    doc.replaceRange(key+'. '+line.trim(), {line: i, ch: 0}, {line: i, ch:line.length});
                }

                count++;

            }


        },


        /**
         * Duplicate current line
         * ---
        **/
        duplicateLines: function() {

            var doc = this.editor.getDoc();
            var start = doc.getCursor('from');
            var end = doc.getCursor('to');

            var lines = new Array();
            for(var i=start.line; i<=end.line; i++) {
                lines.push(doc.getLine(i));
            }

            doc.replaceRange(lines.join("\n")+"\n", {line: start.line, ch: 0});

        },

        /**
         * Toggle custom markup for the current selection
         * ---
        **/
        toggleAround: function(before, after, position) {

            var doc = this.editor.getDoc();
            var cursor = doc.getCursor('to');
            var line = doc.getLine(cursor.line);

            var selection = (doc.somethingSelected() ? doc.getSelection() : '');

            var startPos  = cursor.ch - selection.length
            var prefixPos = startPos - before.length;
            var prefixValExt = line.substr(prefixPos, before.length);
            var prefixValInt = line.substr(prefixPos+before.length, before.length);

            var endPos = cursor.ch;
            var suffixPos = endPos;
            var suffixValExt = line.substr(suffixPos, after.length);
            var suffixValInt = line.substr(suffixPos-after.length, after.length);

            // Remove tags (external)
            if(prefixValExt == before && suffixValExt == after) {

                var rangeLength = before.length + selection.length + after.length;

                // Remove
                doc.replaceRange(selection,
                    {line: cursor.line, ch: prefixPos},
                    {line: cursor.line, ch: prefixPos + rangeLength}
                );

                // Reset selection
                if (selection) {
                    doc.setSelection(
                        { line: cursor.line, ch: cursor.ch - selection.length - before.length },
                        { line: cursor.line, ch: cursor.ch - after.length }
                    );
                }

            }

            // Remove tags (internal)
            else if(prefixValInt == before && suffixValInt == after) {

                var text = selection.substr(0, selection.length - after.length);
                    text = text.substr(before.length);

                var rangeLength = text.length;

                // Remove
                doc.replaceRange(text,
                    {line: cursor.line, ch: cursor.ch - selection.length},
                    {line: cursor.line, ch: cursor.ch}
                );

                // Reset selection
                if (selection) {

                    doc.setSelection(
                        { line: cursor.line, ch: prefixPos + before.length },
                        { line: cursor.line, ch: prefixPos + before.length + rangeLength }
                    );

                }

            }

            // At cursor position
            else {

                if (selection) {
                   doc.replaceSelection(before + selection + after);
                   doc.setSelection({ line: cursor.line, ch: cursor.ch - selection.length + before.length }, { line: cursor.line, ch: cursor.ch + before.length });
                }
                else {
                   // If no selection then insert start and end args and set cursor position between the two.
                   doc.replaceRange(before + after, { line: cursor.line, ch: cursor.ch });
                //    doc.setCursor({ line: cursor.line, ch: cursor.ch + before.length });
               }

            }


        },

        /**
         * Add custom markup to the current selection
         * ---
        **/
        addAround: function(before, after, position) {

            var doc = this.editor.getDoc();
            var cursor = doc.getCursor('to');

            var selection = (doc.somethingSelected() ? doc.getSelection() : '');

            if (selection) {
               doc.replaceSelection(before + selection + after);

            }
            else {
               // If no selection then insert start and end args and set cursor position between the two.
               doc.replaceRange(before + after, { line: cursor.line, ch: cursor.ch });
            }

            if(position) {
               doc.setCursor({ line: cursor.line, ch: cursor.ch + before.length + position });
            }
            else if(!selection) {
               doc.setCursor({ line: cursor.line, ch: cursor.ch + before.length });
            }
            else {
               doc.setSelection({ line: cursor.line, ch: cursor.ch - selection.length + before.length }, { line: cursor.line, ch: cursor.ch + before.length });
            }

        },

        /**
         * Add characters at the begging of selected lines
         * ---
         * @param   string      characters
        **/
        addBefore: function(characters) {

            var doc = this.editor.getDoc();
            var start = doc.getCursor('from');
            var end = doc.getCursor('to');

            for(var i=start.line; i<=end.line; i++) {

                doc.replaceRange(characters,
                    {line: i, ch: 0},
                    {line: i, ch: 0}
                );

            }

        },

        /**
         * Remove characters at the begging of selected lines
         * ---
         * @param   string      characters
        **/
        removeBefore: function(characters) {

            var doc = this.editor.getDoc();
            var start = doc.getCursor('from');
            var end = doc.getCursor('to');

            for(var i=start.line; i<=end.line; i++) {

                var line = doc.getLine(i);

                if(line.substr(0, characters.length) === characters) {
                    doc.replaceRange('',
                        {line: i, ch: 0},
                        {line: i, ch: characters.length}
                    );
                }

            }

        },

        /**
         * Toggle characters at the begging of selected lines
         * ---
         * @param   string      characters
        **/
        toggleBefore: function(characters) {

            var doc = this.editor.getDoc();
            var start = doc.getCursor('from');
            var end = doc.getCursor('to');

            for(var i=start.line; i<=end.line; i++) {

                var line = this.editor.getLine(i);

                if(line.substr(0, characters.length) == characters) {

                    doc.replaceRange('',
                        {line: i, ch: 0},
                        {line: i, ch: characters.length}
                    );

                }
                else {
                    doc.replaceRange(characters,
                        {line: i, ch: 0},
                        {line: i, ch: 0}
                    );
                }

            }

        },

    }

    window.Wymiwym = Wymiwym;

})(window.CodeMirror);
