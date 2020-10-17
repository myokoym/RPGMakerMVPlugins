/*=============================================================================
 PictureBox.js
----------------------------------------------------------------------------
 (C) 2020 Masafumi Yokoyama <myokoym@gmail.com>
 This software is released under the MIT License.
 http://opensource.org/licenses/mit-license.php
----------------------------------------------------------------------------
 Version
 0.1.0 2020/10/18 初版
=============================================================================*/

/*:
 * @plugindesc PictureBoxPlugin
 * @author myokoym
 *
 * @help PictureBox.js
 *
 * This plugin is released under the MIT License.
 */
/*:ja
 * @plugindesc 画像ボックス
 * @author myokoym
 *
 * @help PictureBox.js
 *
 * プラグインコマンド詳細
 *  イベントコマンド「プラグインコマンド」から実行。
 *  （パラメータの間は半角スペースで区切る）
 *
 * PictureBox HOGE
 *
 * 利用規約：
 *  作者に無断で改変、再配布が可能で、利用形態（商用、18禁利用等）
 *  についても制限はありません。
 *  このプラグインはもうあなたのものです。
 */

(function() {
  'use strict';

  var PictureBoxCommand = (function() {
    function PictureBoxCommand() {
    }
    PictureBoxCommand.create = function(args) {
      console.log(args);
      var boxId = args[0]; //1-5
      var basePictureId = (boxId - 1) * 20 + 1;
      var basePictureName = args[1];
      var x = args[2] || 400;
      var y = args[3] || 0;
      var scale = args[4] || 100;
      PictureBoxManager.createBox(boxId, basePictureId, basePictureName, x, y, scale);
      PictureBoxManager.showBox(boxId);
    };
    PictureBoxCommand.erase = function(args) {
      console.log(args);
      var boxId = args[0];
      PictureBoxManager.eraseBox(boxId);
    };
    PictureBoxCommand.eraseAll = function(args) {
      PictureBoxManager.eraseBoxAll();
    };
    return PictureBoxCommand;
  }());

  var PictureBoxManager = (function() {
    function PictureBoxManager() {
    }
    Object.defineProperty(PictureBoxManager, "boxes", {
      get: function() {
        return this._boxes;
      },
      enumerable: true,
      configurable: true
    });
    PictureBoxManager.createBox = function(boxId, basePictureId, basePictureName, x, y, scale) {
      this.boxes[boxId] = {
        x: x,
        y: y,
        scale: scale,
        basePicture: {
          id: basePictureId,
          name: basePictureName,
        },
        partPictures: []
      };
      console.log(PictureBoxManager.boxes);
    };
    PictureBoxManager.eraseBox = function(boxId) {
      // TODO: destroy parts
      $gameScreen.erasePicture(this.boxes[boxId].basePicture.id);
    };
    PictureBoxManager.eraseBoxAll = function() {
      for (var boxId of Object.keys(this.boxes)) {
        this.eraseBox(boxId);
      }
    };
    PictureBoxManager.showBox = function(id) {
      var box = this.boxes[id];
      console.log(box);
      $gameScreen.showPicture(box.basePicture.id,
                              box.basePicture.name,
                              0,
                              box.x, box.y,
                              box.scale, box.scale,
                              255,
                              0);
    };
    PictureBoxManager._boxes = {};
    return PictureBoxManager;
  }());

  var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.apply(this, arguments);
    this.pluginCommandPictureBox(command, args);
  };

  Game_Interpreter.prototype.pluginCommandPictureBox = function(command, args) {
    console.log(command);
    switch (command) {
      case 'PictureBoxCreate':
        PictureBoxCommand.create(args);
        break;
      case 'PictureBoxErase':
        PictureBoxCommand.erase(args);
        break;
      case 'PictureBoxEraseAll':
        PictureBoxCommand.eraseAll(args);
        break;
    }
  };
})();
