(function(doc){
    var escapeHTML = function(str) {
        return str.replace(/[&'`"<>]/g, function(word) {
            return {
                '&': '&amp;',
                "'": '&#x27;',
                '`': '&#x60;',
                '"': '&quot;',
                '<': '&lt;',
                '>': '&gt;',
              }[word];
        });
    };
    window.MCLangViewer = {
        /**
         * ビューワー要素
         */
        load: function(filename, text) {
            var langlistview = doc.querySelector("#langlistview");
            var innerHTML = "";
    
            // 分割
            var lines = text.split(/\r\n|\r|\n/g);
    
            // 一行ごとの処理
            for (var i = 0, imax = lines.length; i < imax; i++) {
                var lineinfo = MCLangParser.parseline(lines[i], i);
                innerHTML += this.createLineElement(lineinfo, i);
            }

            // 適用
            langlistview.innerHTML = innerHTML;
        },
        loadEditting: function(filename, text) {
            var langlistview = doc.querySelector("#langlistview");
            var cur = langlistview.querySelector(".langdata");
    
            // 分割
            var lines = text.split(/\r\n|\r|\n/g);
    
            // 一行ごとの処理
            for (var i = 0, imax = lines.length; i < imax; i++) {
                var lineinfo = MCLangParser.parseline(lines[i], i);
                var has = false;

                if (lineinfo.type == "data") {
                    var elem = langlistview.querySelector("[data-name=\"" + lineinfo.dataname + "\"]");
                    if (elem) {
                        this.setEdit(elem.querySelector("dd"), lineinfo.plaintext);
                        cur = elem.parentElement.nextElementSibling;
                        has = true;
                    }
                    if (!has) {
                        var x = doc.createElement("div");
                        lineinfo.edittedtext = lineinfo.plaintext.substr(0);
                        lineinfo.plaintext = "";
                        x.innerHTML = this.createLineElement(lineinfo, i);
                        langlistview.insertBefore(x.firstElementChild, cur);
                    }
                }
            }
        },
        createLineElement: function(lineinfo, i) {
            var html = "<div class=\"langdata\" data-type=\"" + lineinfo.type + "\">";
            if (lineinfo.type == "empty") {
                html += "<br class=\"empty\"/>"
            }
            else if (lineinfo.type == "comment") {
                html += 
                "<div class=\"notranslate\">" +
                "<span class=\"commentmark notranslate\">" + lineinfo.commentmark + "</span>" + 
                "<span class=\"plaintext\" ondblclick=\"MCLangViewer.editLines(event)\">" + escapeHTML(lineinfo.plaintext) + "</span>" +
                "</div>" + 
                "<div class=\"translate\">" +
                "<span class=\"commentmark notranslate\">" + lineinfo.commentmark + "</span>" + 
                "<span class=\"plaintext\" ondblclick=\"MCLangViewer.editLines(event)\">" + escapeHTML(lineinfo.plaintext) + "</span>" +
                "</div>";
            }
            else if (lineinfo.type == "data") {
                html += "<dl data-name=\"" + lineinfo.dataname + "\">" +
                 "<dt class=\"notranslate\">" + lineinfo.dataname + "</dt>" + 
                 "<dd>" + 
                 "<div class=\"notranslate\">" +
                 "<div class=\"plaintext\" ondblclick=\"MCLangViewer.editLines(event)\">" + escapeHTML(lineinfo.plaintext) + "</div>" +
                 (lineinfo.removedtext ? "<div class=\"removedtext\" ondblclick=\"MCLangViewer.editLines(event)\">" + escapeHTML(lineinfo.removedtext) + "</div>" : "") +
                 "</div>" + 
                 "<div class=\"translate\">" +
                 "<div class=\"plaintext\" ondblclick=\"MCLangViewer.editLines(event)\">" + escapeHTML(lineinfo.plaintext) + "</div>" +
                 (lineinfo.removedtext ? "<div class=\"removedtext\" ondblclick=\"MCLangViewer.editLines(event)\">" + escapeHTML(lineinfo.removedtext) + "</div>" : "") +
                 "</div>" +
                 (lineinfo.edittedtext ? "<div class=\"edit\"><textarea class=\"edittable\">" + escapeHTML(lineinfo.edittedtext) + "</textarea></div>" : "") +
                 "</dd>";
            }
            else if (lineinfo.type == "unknown") {
                html += 
                "<div class=\"notranslate\">" +
                "<span class=\"unknownmark notranslate\">[?]</span>" + 
                "<span class=\"plaintext\" ondblclick=\"MCLangViewer.editLines(event)\">" + escapeHTML(lineinfo.plaintext) + "</span>" +
                "</div>" + 
                "<div class=\"translate\">" +
                "<span class=\"unknownmark notranslate\">[?]</span>" + 
                "<span class=\"plaintext\" ondblclick=\"MCLangViewer.editLines(event)\">" + escapeHTML(lineinfo.plaintext) + "</span>" +
                "</div>";
            }
            return html + "</div>";
        },
        editLines: function(e) {
            e.preventDefault();
            var parent = e.currentTarget.parentElement.parentElement;
            var text = e.currentTarget.textContent;
            this.setEdit(parent, text);
        },
        setEdit: function(parent, text) {
            var next = parent.querySelector("textarea.edittable");
            if (next == null) {
                var div = document.createElement("div");
                div.setAttribute("class", "edit");
                next = document.createElement("textarea");
                next.setAttribute("class", "edittable");
                div.insertBefore(next, null);
                parent.insertBefore(div, null);
            }
            next.value = text;
        },
        make: function(param) {
            var langlistview = doc.querySelector("#langlistview");
            var datas = langlistview.querySelectorAll(".langdata");
            var text = "";
            
            for (var i = 0, imax = datas.length; i < imax; i++) {
                var data = datas[i];
                var datatype = data.getAttribute("data-type");
                var tmp = "";
                if (datatype == "empty") {
                    text += "\n";
                    continue;
                }
                else if (datatype == "comment") {
                    tmp += data.querySelector(".commentmark").textContent;
                }
                else if (datatype == "data") {
                    tmp += data.querySelector("dt").textContent + "=";
                }
                var notranslate = data.querySelector(".notranslate ." + param.texttype);
                var translated = data.querySelector(".translate ." + param.texttype);
                var editted = data.querySelector(".edittable");
                if (editted != null) {
                    if (notranslate.textContent == editted.value) {
                        continue;
                    }
                    tmp += editted.value;
                }
                else {
                    if (notranslate.textContent == translated.textContent) {
                        continue;
                    }
                    tmp += translated.textContent;
                }
                text += tmp + "\n";
            }

            return text;
        },
        /**
         * 削除
         */
        resetAll: function() {
            var langlistview = doc.querySelector("#langlistview");
            langlistview.innerHTML = "";
        },
    };
})(document);