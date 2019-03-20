# MCLangViewer

MCLangViewer is a web application for displaying Minecraft's MOD language file.

MCLangViewerは、MinecraftのMODの言語ファイルを表示するためのWebアプリケーションです。

https://shiogumar.github.io/MCLangViewer/

## Description / 説明
The wonderful MODs in the world can not play comfortably with the language barrier. I do not want such a thing!
I want to make more people enjoy MOD. For that, I thought about making tools to help understand MOD.

When the text is very long in game manual etc., it takes time to read it.
Sometimes it is written in a language you are not good at.
In such a case, this web application should be useful.
By dragging and dropping a MOD file (.jar) to MCLangViewer, the internal language data is displayed in a manner that is easy to read.
For MOD that supports multiple languages, you need to select the language.
If the browser is chrome, you can also translate the text using google translation.
I can not guarantee the accuracy of translation, but I think that it will surely help you understand.

世の中の素晴らしいMOD達が、言語の壁により快適に遊べない。そんなのは嫌だ！
より多くの人がMODを楽しめるようにしたい。そのために、MODへの理解を助けるツールを作ろうと思いました。

ゲーム内マニュアルなどでテキストがとても長い時、それを読むには時間がかかります。
あなたが得意ではない言語で書かれていることもあるでしょう。
そんな時、このウェブアプリケーションが役に立つはずです。
MCLangViewer に MOD ファイル（.jar）をドラッグアンドドロップすると、内部にある言語データを読みやすく表示します。
複数の言語に対応している MOD の場合、言語を選択する必要があります。
ブラウザがchromeの場合、google 翻訳を使用してテキストを翻訳することもできるでしょう。
翻訳の精度については保証できませんが、それはきっと貴方の理解の一助となると思います。

## Caution / 注意
* Please do not confuse machine translation.The translation function of the web page is not originally done for lang format data.
  If a symbol with a special meaning is broken by machine translation, applying the translation result to the game does not work properly.  
  機械翻訳を過信しないでください。ウェブページの翻訳機能は、本来は lang 形式のデータに対して行うものではありません。
  特殊な意味を持つ記号が機械翻訳によって壊された場合、翻訳結果をゲームに適用しても正しく動作しません。
* Please do not use translated data for purposes other than personal use. It is not possible to make it public without permission of the author of MOD.  
  翻訳したデータを個人利用以外の目的に使わないで下さい。MODの作者の許可なく、公開することは出来ません。

## My TODO / 今後の予定
* Publish to some extent after completion. I am working now.  
  ある程度完成したら公開する。今作業中。
* Support for MOD that using unique data format. If I feel like it.  
  独特なデータフォーマットを持つMODのサポート。気が向いたら。
* Add feature for embed MCLangViewer to your web site. Viewer customize, Auto loading from GitHub, etc.. If I feel like it.  
  ウェブサイトにMCLangViewerを埋め込むための機能を追加。ビューアカスタマイズ、GitHubからの自動読み込みなど。気が向いたら。
* Add feature for save the translated language data to lang(language file) or zip(resource pack). If I feel like it.  
  翻訳した言語データをlang（言語ファイル）かzip（リソースパック）にして保存する機能を追加。気が向いたら。
* Add feature for edit the loaded/translated language data. If I feel like it.  
  読み込んだ/翻訳した言語データの編集機能を追加。気が向いたら。

## Other / その他
It is my first GitHub project.
