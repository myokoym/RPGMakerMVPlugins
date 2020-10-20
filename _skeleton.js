/*=============================================================================
 PLUGIN_NAME.js
----------------------------------------------------------------------------
 (C) 2020 Masafumi Yokoyama <myokoym@gmail.com>
 This software is released under the MIT License.
 http://opensource.org/licenses/mit-license.php
----------------------------------------------------------------------------
 Version
 0.1.0 2020/MM/DD 試作版リリース
 ----------------------------------------------------------------------------
 Support: https://twitter.com/myokoym
 Latest: https://github.com/myokoym/RPGMakerMVPlugins/blob/main/PLUGIN_NAME.js
=============================================================================*/

/*:
 * @plugindesc PLUGIN_NAME
 * @author myokoym
 *
 * @param defaultX
 * @text defaultX
 * @default 100
 * @type number
 *
 * @help PLUGIN_NAME.js
 *
 * TODO: plugin summary
 *
 * Basic Usage
 *   By Plugin Commands.
 *
 *   PLUGIN_NAME SUB_COMMAND 1 200
 *
 * Plugin Commands
 *   (<>: required, []: optional, (): valid range)
 *   sub command:     PLUGIN_NAME SUB_COMMAND <id (1-5)> [x]
 *
 * This plugin is released under the MIT License.
 */
/*:ja
 * @plugindesc プラグイン名
 * @author myokoym
 *
 * @param defaultX
 * @text デフォルトx座標
 * @desc デフォルトのx座標を設定します。
 * @default 100
 * @type number
 *
 * @help PLUGIN_NAME.js
 *
 * TODO: plugin summary
 *
 * 基本的な使用例
 *   プラグインコマンドに以下よって操作します。
 *
 *   PLUGIN_NAME SUB_COMMAND 1 200
 *
 * プラグインコマンド一覧（詳細は後述）
 *   XXXコマンド:     PLUGIN_NAME SUB_COMMAND <id (1-5)> [x]
 *
 * プラグインコマンド詳細
 *   引数について: <>は必須、[]は任意、()は有効な値の範囲
 *
 *   XXXコマンド
 *     PLUGIN_NAME SUB_COMMAND <id (1-5)> [x]
 *     例: PLUGIN_NAME SUB_COMMAND 1 200
 *     説明: XXXします。
 *
 * ライセンス
 *   MITライセンス
 */

(function() {
'use strict';

var PLUGIN_NAMECommand = (function() {
    function PLUGIN_NAMECommand() {
    }
    PLUGIN_NAMECommand.getPluginParameter = function(name) {
        if (typeof this._pluginParametersCache[name] !== "undefined") {
            return this._pluginParametersCache[name];
        }
        var param = PluginManager.parameters("PLUGIN_NAME")[name];
        if (param === "true" || param === "false") {
            param = Boolean(param);
        } else if (!isNaN(param)) {
            param = Number(param);
        }
        this._pluginParametersCache[name] = param;
        return param;
    };
    PLUGIN_NAMECommand.getDefault = function() {
      return Number(PluginManager.parameters("PLUGIN_NAME")["default"]);
    };
    PLUGIN_NAMECommand.SUB_COMMAND = function(args) {
        var id = args[0];
        var x = args[1] || this.getDefault();
        PLUGIN_NAMEManager.SUB_COMMAND(id, x);
    };
    return PLUGIN_NAMECommand;
}());

var PLUGIN_NAMEManager = (function() {
    function PLUGIN_NAMEManager() {
    }
    Object.defineProperty(PLUGIN_NAMEManager, "boxes", {
        get: function() {
            return this._boxes;
        },
        enumerable: true,
        configurable: true
    });
    PLUGIN_NAMEManager.SUB_COMMAND = function(id, x) {
    };
    PLUGIN_NAMEManager._boxes = {};
    return PLUGIN_NAMEManager;
}());

var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.apply(this, arguments);
    this.pluginCommandPLUGIN_NAME(command, args);
};

Game_Interpreter.prototype.pluginCommandPLUGIN_NAME = function(command, args) {
    if (command.toUpperCase() !== "PLUGIN_NAME") {
        return;
    }
    var subCommand = args.shift();
    switch (subCommand.toUpperCase()) {
        case 'SUB_COMMAND':
            PLUGIN_NAMECommand.SUB_COMMAND(args);
            break;
    }
};

})();
