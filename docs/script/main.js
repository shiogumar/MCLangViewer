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
        var viewerElem = doc.querySelector("#mclangviewer");

        var fileSelecter = doc.querySelector("#langfileselector");
        var fileNameLabel = doc.querySelector("#inputfilename");
        var fileOptions = doc.querySelector("#langfileoptions");

        var edittingFileSelector = doc.querySelector("#edittinglangfileselector");
        var edittingFileNameLabel = doc.querySelector("#inputedittingfilename");
        var edittingFileOptions = doc.querySelector("#edittinglangfileoptions");

        var saveLangFolderPath = doc.querySelector("#savelangfolderpath");
        var saveLangFileName = doc.querySelector("#savelangfilename");

        var fileSave = doc.querySelector("#langfilesave");
        var packSave = doc.querySelector("#langpacksave");

        var viewtype = doc.forms.mclangviewermenu.viewtype;

        var mclangviewerstyle = doc.querySelector("#mclangviewerstyle");

        // ファイルパスをフォルダとファイル名に分解して保存
        function setFilePath(filepath, loadtype) {
            var splits = filepath.split(/[\/\\]/);
            saveLangFileName.value = splits[splits.length-1];
            if (splits.length > 1) {
                saveLangFolderPath.value = filepath.slice(0, -saveLangFileName.value.length);
            }
        }
        
        // ファイル種別を判定して読み込み
        function loadFile(filename, file, type) {
            if (/\.jar$/.test(filename)) {
                loadModFile(filename, file, type);
            }
            else if (/\.zip$/.test(file.name)) {
                loadZipFile(filename, file, type);
            }
            else if (/\.lang$/.test(filename)) {
                setFilePath(filename, type, "file");
                loadLangFile(filename, file, type);
            }
            else {
                // 拡張子が対応外の場合
            }
        }

        fileSelecter.addEventListener("change", function(e){
            MCLangViewer.resetAll();
            var file = e.target.files[0];
            if (file) {
                fileNameLabel.innerText = file.name;
                loadFile(file.name, file, "base");
            }
        },false);

        fileOptions.addEventListener("change", function(e) {
            if (onchangeFileSelect) {
                setFilePath(fileOptions.value, "base", "file");
                onchangeFileSelect(e);
            }
        });

        fileSave.addEventListener("click", function(e) {
            saveLangFile(saveLangFileName.value, e.currentTarget);
        });

        packSave.addEventListener("click", function(e) {
            saveLangPack("LangPack.zip", saveLangFolderPath.value, saveLangFileName.value, e.currentTarget);
        });

        edittingFileSelector.addEventListener("change", function(e){
            var file = e.target.files[0];
            if (file) {
                edittingFileNameLabel.innerText = file.name;
                loadFile(file.name, file, "edit");
            }
        },false);

        edittingFileOptions.addEventListener("change", function(e) {
            if (onchangeEdittingFileSelect) {
                setFilePath(edittingFileOptions.value, "edit", "file");
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

    function saveLangFile(filename, target) {
        var viewtype = doc.forms.mclangviewermenu.viewtype.value;
        var selecttype = doc.forms.mclangviewermenu.saveopt1.value;
        var param = {"texttype": viewtype, "selecttype": selecttype };
        var content = MCLangViewer.make(param);
        var blob = new Blob([content], {"type":"text/plain"});
        window.URL = window.URL || window.webkitURL;
        target.setAttribute("href", window.URL.createObjectURL(blob));
        target.setAttribute("download", filename);
    };

    function saveLangPack(filename, langfilepath, langfilename, target) {
        var viewtype = doc.forms.mclangviewermenu.viewtype.value;
        var selecttype = doc.forms.mclangviewermenu.saveopt1.value;
        // 言語ファイル名に大文字が含まれているものは pack_format=2, そうでなければ 3 とする。
        var packFormat = /[A-Z]/.test(langfilename) ? 2 : 3;
        var param = {"texttype": viewtype, "selecttype": selecttype };
        var content = MCLangViewer.make(param);
        var mcmeta = "{\n  \"pack\": {\n    \"pack_format\": " + packFormat + ",\n    \"description\": \"Language Pack is made with MCLangViewer.\"\n  }\n}";
        var thumbnail = "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAIAAABMXPacAAAKQElEQVR42u2b+28U1xXHz3/UX/JDJRTJUn6w+oP7m/sTUn+If6hELLVK5CjEVLgPIO0GcIONNvESHiHAGhon2FUwjwRKwMGBJH4b/DaQpm3Io0367vbsnJ2Tk/uYmZ2dXeamF320mnvv955z7jlz74zXBj6uVDwPEfAp8AXwBfD4AvgCeHwBfAE8vgC+AB5fAF8Az0MtwMihXYjef3qwl/vPv36o1LtVAQWsHDvR3+zQ0QuGoQffAtfNLUDhh99FlBqc3PcU9VNz7+OPUlOBLfT/6LFmh44uMAzZ8/uLZ9B1saeT7xLscbUASgb1FCuLV8QtKMAre7ahI7kJcE9gD29EvMZ96WoB5Cbg2z/hPd6aAuBRg44wNu4Z/Mn3OUK3dwCdMJxE3hONFABPBuW84sMa71PZj955KGIWOTrwxPdsTbSDu8TogreO1OANx9dUXdLY5ir9WRYA00fWcTvTBd5oDRaATBGUVj4f2COBTbyX5d0gh+SpIm95ShlnUDmCKEdkhGbR/pYavOCwcVRqbHO5X/rNpgD0QJPlbbAAukZmR6YV58rNJ4eUJh36lA79kaDX2JjcJAWI7c/4CCK7tDx+rDW+Ayiz9PaSSQHkaw/aVN4L9B0gvde7A4xzm1sA2td85jZYAH0ZjReAX0aVF9DoAiD4qKDnc70FUOY2vQDKUhssgC2VjRSATh56PCg/u9iOIJsmyRGU+cue8wWgZ6/xPcQXQO3kI4JOjIQFsM1SDjf5AlpXAdg+XvBTRD7eH0IB9MUg2Jn8qwj95V3v5BMjogC6I6n86L9V6NXwxL6nqMlg51DvVrp+IQheMjzQy3NtjL3aHzEXL3BIcVovoHehdXKsMD5yiBzTNa5NwTZ6bM+2yxfPKJ3SBU7EUW6OlHbxKE7E6TxL5hS5H0Ca+2GTIbOswQrJALDH2M+8VtoVPVfaTw00OL/FUAG4ee8/zgM5j28oeDAyWIBju7fx6F33gZzHhw9GWQA8suXo5r+dB5yOft19wOno1/7lPOB09KvuA05Hv+I+4HT0y/90HnA6+jvuA05Hf/sfzgNOR7/oPuB09At/dx5wOvp59wGno591H3A6+pm/OQ84Hf20+4DT0U995TzgdPQfug84Hf37XzoPOB39LfeBWMVSqefej7+ztqczh9Hf/KvzQKxitbAVC7DxbFsOo3/PfSBWwQXIYfST7gOxCi5ADqO/8RfngVjF6q9rBbAJZi+WF4/1KeiyheGCFGBT1+h20LjiSzYnAqYvlifCa2ouoP1vIgWErlHsIPPDBSnApm6nQSBWsRIWwDg6d7aIo0Y4XFzY3Scf0QXYGatBOH1LB7uxudzfxd6vf1GZfaMawPpP2/Gam0bmygXSTF+I8hWtwU4cIk0mQKyCC2AcxWg2n95iXMzazztIgymzJYUTxxp0xCgaigQ/2fu1L6o3MsmuBc2pyHhIsxTpizTkywhOJ00mQKyCC5DcKK2Hp5CF1d2dUqMkzuhF6eQCsOCdzyvzoR28tsHxUHM5NCs1SqdRQ3ZwKMJXvUCswhhKNMYFK3EriUueFGnnqrBzNWga4XioyWalRuk0argAEb7qBWIVxlAkmALUSOj0VBajxK0kLnlSpJ0rn1fmQjtXgib1GONZf7aNBGSHm8ZOauJE3Q5eyIkNArEKY7hytdbz/ZuLUeJWEpc8KdLO5c8qc0drdvBaNo3xkIbNUtPYuWx/BqALObFBIFZhDFcZNd4pymLwU05UEpc8KdLO259VZkM7bwfNpUCz+eQjeMFshvFIDTeNnUthAaQdZP6lHjmrcSBWYQw3enQ9OCuVxeCn1BgTlyQp0s5bn35tB6+R2pTtbdQksCk7jRql06hpBhCriA4l+YLxU2qSJM6YFGnn0qeVmdDOpaDJU6hJcDwRGqXTqGkGEKuIDiX5gvFTapIkzpgUaefCg8rMkZodvEbu/Ko2hZoExxOhUTqNmmYAsQoKZePpLRGjxgWv7WiXGvyUmiSJW97dqScFO1lw/kFlOrRzPmiyHWoSHE+Ehn1FaJoBxCooFCO4eB7FWBnqub2/S1rAT2lWSRyKrW8vYRYiNKs72scfVMZFtHo8i/u7SLMY6Ys0C4Pduh0CIydNJkCs4tZIcdP2zclgt20UA50cL8vF8PrZrFwwim1eYjXY+cHJwrlPKkhEPDfGy6S5EemLNMjKzzqMGlwIaxoHEuqmjvQp8Jr1UTlE6D2ULE4Ky6QdvK+VpBgjefOTioIej66x+ZKamyPFJO4aAbI1ly18ENsEv/tzZtwOfK1tb8vQZhKgxf7qgu7KiKSMZQf7GsvUbCzQYn82Pjxi/QphYX+Xbdbon9LwwWG7r31d6WymBlrsz8atEwVjRu7s6oyYdTYVN+2+zqa1mRpovcsMeeOPzgNORz/iPuB09K+5Dzgd/W8/dh5wOvoz7gNOR3/6D84DTkc/7D7gdPSnPnIecDr6k+4DTkd/wn3A6ehfvV/lrbHyes8W29c7yMTxAikz4erp4vKO9slDfZlYgwwjaz3HA2b2dkVkv/pbzB3tx0Nx48w9F/yl5fa2TKxBhpG1nmP3qsztCX5t0LOFmpKFX3ZSsvSh1JC7rGxChpG1nqMBnJGjYc/RBEOpydYmZBhZ6zlytwpnhJoSfejCaPndUp+CPvGdVwqK5spwMdodWtbtxAIp5uSHwwGzYUYOhz2HLUOXh63/fQMzThrMo+1X9lgGm7ul3uov1Kb3dukxRAP1TsgVL29WoYxg1iZKfQqUl5Vn2kh5frS8Znlfut3XQZqp582PdLSP9WN3bJN7qn/nGgjqAuqdkCtKAbx+G5jcUijWwVRSQqU1buoogvHRchIvNiDFnPwwFDATFgDvbsyLAm6Cc6PloVCswwWQ1ripowgw7+Q92osNSDEnP7y0UYUzQs1orpf6UC/ZCE58nh5rjeuNF/PBay5dJ/GuA+mm5YQXAzhlL4Y9Nq6VrH8PwdNjrc2YTrxL5WKsdyOQblpOKK5X4ZRRMwJS4i1v3AEJrckdMPeL2g649ZvuWO9GIN20nHAwYDpM2cGwx4ZRyc+AhNYUweLODipqrHcjkG5aThhcqzK9u5YRakZgVHIBElpTBBdO1X62eHegJzYAHUgxJz8MBHBGBsIeG0YlFyChNV2gWKgLSDEnPxwI4IwcCHtsGJWUvju97Qmt6YKJgZ7af7kd6ouNQQHqnZArXlitMhVkZPmZNmpGQEoSM9TzfqGLNO/1d+saYvxU0eaOnuQLOztiY1CAeifkiv6A68ENiLdwf9hj49yp4obpex7M5tnXyyxb2Gn+rxmT/d04OhlUCDXS8vVwE8TGoAD1TsgV+1ecB5yOfp/7gNPR7112HnA6+ufdB5yOvuA+8C1Ygy+AxxfAF8DjC+AL4PEF+PYU4NEfXPVkRcoCVPy/LP6lL4BHhxKa/LqhHeDJqga+AA+5Br4Afgf4Z4B/C/JvQf7nAP+TsP8qwuML4Avg8QXwBfD4AvgCeHwBfAH+7/kfsTFG7uqhrhgAAAAASUVORK5CYII=";

        var zip = new Zlib.Zip();
        zip.addFile(utf16ToUtf8ByteArray(content), {
            filename: utf16ToUtf8ByteArray(langfilepath + langfilename)
        });
        zip.addFile(utf16ToUtf8ByteArray(mcmeta), {
            filename: utf16ToUtf8ByteArray("pack.mcmeta")
        });
        zip.addFile(base64ToBinaryByteArray(thumbnail), {
            filename: utf16ToUtf8ByteArray('pack.png')
        });
        var compressed = zip.compress();
        
        var blob = new Blob([compressed], {"type":"application/zip"});
        window.URL = window.URL || window.webkitURL;
        target.setAttribute("href", window.URL.createObjectURL(blob));
        target.setAttribute("download", filename);

    };
    
    function utf16ToUtf8ByteArray(utf16) {
        var length = 0;
        for (var i = 0, il = utf16.length; i < il; ++i) {
            var code = utf16.charCodeAt(i);
            length += code <= 0x7F ? 1 : code <= 0x7FF ? 2 : 3;
            if (code >= 0xD800 && code <= 0xDFFF) {
                ++i;
                ++length;
            }
        }
        var array = new Uint8Array(length);
        for (var i = 0, j = 0, il = utf16.length; i < il; ++i) {
            var code = utf16.charCodeAt(i);
            if (code <= 0x7F) {
                array[j++] = code;
            }
            else if (code <= 0x7FF) {
                array[j++] = (code >> 6) | 0xC0;
                array[j++] = (code & 0x3F) | 0x80;
            }
            else if (code < 0xD800 || code > 0xDFFF) {
                array[j++] = (code >> 12) | 0xE0;
                array[j++] = ((code >> 6) & 0x3F) | 0x80;
                array[j++] = (code & 0x3F) | 0x80;
            }
            else {
                var code2 = utf16.charCodeAt(++i);
                var longcode = (((code & 0x03FF) + 0x0040) << 10) & (code2 & 0x03FF);
                array[j++] = (longcode >> 18) | 0xF0;
                array[j++] = ((longcode >> 12) & 0x3F) | 0x80;
                array[j++] = ((longcode >> 6) & 0x3F) | 0x80;
                array[j++] = (longcode & 0x3F) | 0x80;
            }
        }
        return array;
    };

    var base64ToBinaryByteArray = (function() {
        var table = (function(list) {
            var t = [{"=": 0}, {"=": 0}, {"=": 0}, {"=": 0}];
            for (var i = 0, imax = list.length; i < imax; i++) {
                t[0][list[i]] = i << 18;
                t[1][list[i]] = i << 12;
                t[2][list[i]] = i << 6;
                t[3][list[i]] = i;
            }
            return t;
        })("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/");
        return function(str) {
            // イコールを抜いた長さを調べる
            var strlen = ((str.indexOf("=") + 1) || (str.length + 1)) - 1;
            var length = Math.ceil(strlen * 3 / 4);
            var array = new Uint8Array(length);
            var t0 = table[0], t1 = table[1], t2 = table[2], t3 = table[3];
            for(var i = 0, j = 0, val = 0, x = 16; i < length; ++i, x = x ? x-8 : 16 ) {
                if (x == 16) {
                    val = t0[str[j++]] + t1[str[j++]] + t2[str[j++]] + t3[str[j++]];
                }
                array[i] = (val >> x) & 0xFF;
            }
            
            return array;
        };
    }());
})(document);