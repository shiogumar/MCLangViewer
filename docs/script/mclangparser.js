(function(doc){
    window.MCLangParser = {
        parseline: function(line) {
            var trimmed = line.trim();
            if (trimmed.length == 0) {
                // 空白を除去した結果、一文字も無ければ空行
                return {
                    "type": "empty",
                    "line": line,
                    "plaintext": trimmed
                };
            }
            else if (trimmed[0] == "#") {
                // 空白の後コメント記号で始まっている場合はコメント行
                return {
                    "type": "comment",
                    "line": line,
                    "commentmark": "#",
                    "plaintext": trimmed.substr(1).trim()
                };
            }
            else if (trimmed.indexOf("//") == 0) {
                // 空白の後コメント記号で始まっている場合はコメント行
                return {
                    "type": "comment",
                    "line": line,
                    "commentmark": "//",
                    "plaintext": trimmed.substr(2).trim()
                };
            }
            else if (/[a-zA-Z0-9_]/.test(trimmed[0]) && trimmed.indexOf("=") != -1) {
                // キー名の先頭文字で始まり、「=」がある場合はデータ行
                var equal = trimmed.indexOf("=");
                var plaintext = trimmed.substr(equal+1).trim();
                var parsed = this.parseDecorations(plaintext);
                return {
                    "type": "data",
                    "line": line,
                    "dataname": trimmed.substr(0,equal).trim(),
                    "plaintext": plaintext,
                    "removedtext": parsed.removedtext
                };
            }
            else {
                // 何れにも該当しない場合は判定不可能な行
                return {
                    "type": "unknown",
                    "line": line,
                    "plaintext": trimmed
                };
            }
        },
        /**
         * @argument text {string}
         */
        parseDecorations: function(text) {
            var codes = text.match(/([\&§][0-9a-fklmnor]|\\n|<br>)/g);
            if (codes == null) {
                return {"removedtext": text};
            }
            var tmp = text;
            var deleted = "";
            for (var i = 0, imax = codes.length; i < imax; i++) {
                var code = codes[i];
                var pos = tmp.indexOf(code);
                deleted += tmp.substring(0, pos);
                tmp = tmp.substr(pos+code.length);
            }
            deleted += tmp;
            return {"removedtext": deleted};
        }
    };
})(document);