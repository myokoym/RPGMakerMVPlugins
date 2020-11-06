/*=============================================================================
 MessageWindowHidden_showWindowByOk.js
----------------------------------------------------------------------------
 CC0 1.0 Universal (Public Domain)
 https://creativecommons.org/publicdomain/zero/1.0/deed.ja
----------------------------------------------------------------------------
 Version
 0.1.0 2020/11/07 試作版リリース
 ----------------------------------------------------------------------------
 Latest: https://github.com/myokoym/RPGMakerMVPlugins/blob/main/MessageWindowHidden_showWindowByOk.js
=============================================================================*/

/*:
 * @plugindesc Show message window by input "ok" for MessageWindowHidden.js
 * @author myokoym
 */
/*:ja
 * @plugindesc ウィンドウ消去中にokで再表示するプラグイン
 * @author myokoym
 *
 * @help
 *
 * メッセージウィンドウ一時消去プラグイン（MessageWindowHidden.js）を拡張し、
 * 以下の操作でもウィンドウを再表示するように変更するプラグインです。
 *
 * ・okキー（enter、space、Z）が押されたとき
 * ・クリック（左クリック）されたとき
 *
 * 一般的なノベルゲームエンジンは上のような操作でもウィンドウを再表示するため、
 * その挙動に近づけることができます。
 *
 * ※プラグイン管理画面ではMessageWindowHidden.jsより下に配置してください。
 */

(function() {
'use strict';

var _Window_Message_updateInput      = Window_Message.prototype.updateInput;
Window_Message.prototype.updateInput = function() {
    if (this.isHidden()) {
        if (Input._currentState['ok']) {
            this.__currentStateOk = true;
        } else if (this.__currentStateOk) {
            this.__currentStateOk = false;
            this.showAllWindow();
        } else if (TouchInput.isReleased()) {
            this.showAllWindow();
        }
        return true;
    }
    return _Window_Message_updateInput.apply(this, arguments);
};

})();
