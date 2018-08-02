(function(doc){

    if (doc.readyState == "DONE") {
        init(doc, document.currentScript);
    }
    else {
        var currentScript = document.currentScript;
        doc.addEventListener("DOMContentLoaded", function() {
            init(doc, currentScript);
        });
    }

    /**
     * ファイルリストを変更したときに実行する関数
     */
    var onchangeFileSelect = null;

    var onchangeEdittingFileSelect = null;

    /**
     * ビューワースクリプト起動
     * @param {HTMLDocument} doc 
     * @param {HTMLScriptElement} currentScript 
     */
    function init(doc, currentScript) {
        /**
         * @type {HTMLDivElement}
         */
        var viewerElem = doc.querySelector("#mclangviewer");
        /**
         * @type {HTMLInputElement}
         */
        var fileSelecter = doc.querySelector("#langfileselector");
        var fileNameLabel = doc.querySelector("#inputfilename");
        var edittingFileNameLabel = doc.querySelector("#inputedittingfilename");
        /**
         * @type {HTMLOptionsCollection}
         */
        var fileOptions = doc.querySelector("#langfileoptions");

        var fileSave = doc.querySelector("#langfilesave");

        var edittingFileSelector = doc.querySelector("#edittinglangfileselector");

        var edittingFileOptions = doc.querySelector("#edittinglangfileoptions");

        var viewtype = doc.forms.mclangviewermenu.viewtype;

        var mclangviewerstyle = doc.querySelector("#mclangviewerstyle");

        fileSelecter.addEventListener("change", function(e){
            MCLangViewer.resetAll();
            var file = e.target.files[0];
            if (file) {
                fileNameLabel.innerText = file.name;
                if (/\.jar$/.test(file.name)) {
                    loadModFile(file.name, file, "base");
                }
                else if (/\.zip$/.test(file.name)) {
                    loadZipFile(file.name, file, "base");
                }
                else if (/\.lang$/.test(file.name)) {
                    loadLangFile(file.name, file, "base");
                }
                else {
                    // 拡張子が対応外の場合
                }
            }
        },false);

        fileOptions.addEventListener("change", function(e) {
            if (onchangeFileSelect) {
                onchangeFileSelect(e);
            }
        });

        fileSave.addEventListener("click", function(e) {
            saveLangFile(e.currentTarget);
        });

        edittingFileSelector.addEventListener("change", function(e){
            var file = e.target.files[0];
            if (file) {
                edittingFileNameLabel.innerText = file.name;
                if (/\.jar$/.test(file.name)) {
                    loadModFile(file.name, file, "edit");
                }
                else if (/\.zip$/.test(file.name)) {
                    loadZipFile(file.name, file, "edit");
                }
                else if (/\.lang$/.test(file.name)) {
                    edittingFileOptions.innerHTML = "";
                    loadLangFile(file.name, file, "edit");
                }
                else {
                    // 拡張子が対応外の場合
                }
            }
        },false);

        edittingFileOptions.addEventListener("change", function(e) {
            if (onchangeEdittingFileSelect) {
                onchangeEdittingFileSelect(e);
            }
        });

        var onchangeviewtype = function(e) {
            if (viewtype.value == "plaintext") {
                mclangviewerstyle.innerHTML = "#mclangviewer .langdata[data-type=\"data\"] dd .removedtext { display: none; }";
            }
            else if (viewtype.value == "removedtext") {
                mclangviewerstyle.innerHTML = "#mclangviewer .langdata[data-type=\"data\"] dd .plaintext { display: none; }";
            }
        };
        viewtype[0].addEventListener("change", onchangeviewtype);
        viewtype[1].addEventListener("change", onchangeviewtype);
    };

    function loadModFile(filename, file, loadmode) {
        var reader = new FileReader();
        reader.onload = function(e) {
            updateFilelist(filename, e.target.result, loadmode);
        };
        reader.readAsArrayBuffer(file);
    };

    function loadZipFile(filename, file, loadmode) {
        var reader = new FileReader();
        reader.onload = function(e) {
            updateFilelist(filename, e.target.result, loadmode);
        };
        reader.readAsArrayBuffer(file);
    };

    function updateFilelist(filename, data, loadmode) {
        /**
         * @type {HTMLSelectElement}
         */
        var fileOptionsA = null;
        var fileOptionsB = null;
        if (loadmode == "base") {
            fileOptionsA = doc.querySelector("#langfileoptions");
            onchangeFileSelect = null;
            fileOptionsA.innerHTML = "";
            var edittingFileNameLabel = doc.querySelector("#inputedittingfilename");
            edittingFileNameLabel.innerText = filename;
        }
        fileOptionsB = doc.querySelector("#edittinglangfileoptions");
        onchangeEdittingFileSelect = null;
        fileOptionsB.innerHTML = "";

        unzipper = new Zlib.Unzip(new Uint8Array(data));
        filenames = unzipper.getFilenames();

        var pathlist = [];
        var fns = this.filenames;
        var exp = /assets\/.*\.lang$/;
        for (var i = 0, imax = fns.length; i<imax; i++) {
            if (exp.test(fns[i])) {
                pathlist.push(fns[i]);
            }
        }

        var innerHTML = "<option>表示する言語データを選択してください</option>";
        for (var i = 0, imax = pathlist.length; i < imax; i++) {
            innerHTML += "<option class=\"notranslate\">" + pathlist[i] + "</option>";
        }

        if (loadmode == "base") {
            fileOptionsA.innerHTML = innerHTML;
            onchangeFileSelect = function(e) {
                var filename = pathlist[fileOptionsA.selectedIndex-1];
                var buffer = unzipper.decompress(filename);
                var blob = new Blob([new Uint8Array(buffer)]);
                loadLangFile(filename, blob, loadmode);
            };
        }
        fileOptionsB.innerHTML = innerHTML;
        onchangeEdittingFileSelect = function(e) {
            var filename = pathlist[fileOptionsB.selectedIndex-1];
            var buffer = unzipper.decompress(filename);
            var blob = new Blob([new Uint8Array(buffer)]);
            loadLangFile(filename, blob, "edit");
        };
    };

    function loadLangFile(filename, file, loadmode) {
        var reader = new FileReader();
        if (loadmode == "base") {
            reader.onload = function(e) {
                MCLangViewer.load(file.name, e.target.result);
            };
        } else if (loadmode == "edit") {
            reader.onload = function(e) {
                MCLangViewer.loadEditting(file.name, e.target.result);
            };
        }
        reader.readAsText(file);
    };

    function saveLangFile(target) {
        var viewtype = doc.forms.mclangviewermenu.viewtype.value;
        var param = {"texttype": viewtype };
        var content = MCLangViewer.make(param);
        var blob = new Blob([content], {"type":"text/plain"});
        window.URL = window.URL || window.webkitURL;
        target.setAttribute("href", window.URL.createObjectURL(blob));
        target.setAttribute("download", "new.lang");
    };
})(document);