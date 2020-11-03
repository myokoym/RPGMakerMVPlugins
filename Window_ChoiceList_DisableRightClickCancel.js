/*=============================================================================
 Window_ChoiceList_DisableRightClickCancel.js
----------------------------------------------------------------------------
 (C) 2020 Masafumi Yokoyama <myokoym@gmail.com>
 This software is released under the MIT License.
 http://opensource.org/licenses/mit-license.php
----------------------------------------------------------------------------
 Version
 0.1.0 2020/11/03 試作版リリース
 ----------------------------------------------------------------------------
 Latest: https://github.com/myokoym/RPGMakerMVPlugins/blob/main/Window_ChoiceList_DisableRightClickCancel.js
=============================================================================*/

/*:
 * @plugindesc Disable right click cancel in Window_ChoiceList
 * @author myokoym
 */
/*:ja
 * @plugindesc 選択肢で右クリックによるキャンセルを無効
 * @author myokoym
 *
 * @help
 *
 * 選択肢で右クリックによるキャンセルを無効化します。
 *
 * Escキーによるキャンセルを残しつつ、
 * 右クリックによるキャンセルは無効化したい場合に有用です。
 */

(function() {
'use strict';

var _Window_ChoiceList_processCancel = Window_ChoiceList.prototype.processCancel;
Window_ChoiceList.prototype.processCancel = function() {
    if (TouchInput.isCancelled()) {
        return;
    }
    _Window_ChoiceList_processCancel.call(this);
};

})();
