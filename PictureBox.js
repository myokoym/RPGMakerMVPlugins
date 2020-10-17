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
      var pictureIdBase = (boxId - 1) * 20 + 1;
      var x = args[1] || 400;
      var y = args[2] || 0;
      var scale = args[3] || 100;
      PictureBoxManager.createBox(boxId, pictureIdBase, x, y, scale);
    };
    PictureBoxCommand.putParts = function(args) {
      console.log(args);
      var boxId = args[0]; //1-5
      var zOrder = args[1]; //1-20
      var pictureName = args[2];
      PictureBoxManager.putParts(boxId, zOrder, pictureName);
    };
    PictureBoxCommand.show = function(args) {
      console.log(args);
      var boxId = args[0];
      PictureBoxManager.showBox(boxId);
    };
    PictureBoxCommand.erase = function(args) {
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
    PictureBoxManager.createBox = function(boxId, pictureIdBase, x, y, scale) {
      this.boxes[boxId] = {
        pictureIdBase: pictureIdBase,
        x: x,
        y: y,
        scale: scale,
        hide: true,
        parts: []
      };
      console.log(PictureBoxManager.boxes);
    };
    PictureBoxManager.putParts = function(boxId, zOrder, name) {
      var box = this.boxes[boxId];
      box.parts[zOrder] = {
        zOrder: zOrder,
        name: name
      };
      var opacity = 255;
      if (box.hide) {
        opacity = 0;
      }
      $gameScreen.showPicture(box.pictureIdBase + zOrder,
                              name,
                              0,
                              box.x, box.y,
                              box.scale, box.scale,
                              opacity,
                              0);
    };
    PictureBoxManager.eraseBox = function(boxId) {
      // TODO: destroy parts
      var box = this.boxes[boxId];
      box.parts.forEach(function(p) {
        console.log(p);
        if (!p) {
          return;
        }
        $gameScreen.erasePicture(box.pictureIdBase + p.zOrder);
      });
    };
    PictureBoxManager.eraseBoxAll = function() {
      for (var boxId of Object.keys(this.boxes)) {
        this.eraseBox(boxId);
      }
    };
    PictureBoxManager.showBox = function(boxId) {
      this.boxes[boxId].hide = false;
      $gameScreen._pictures.forEach(function(picture) {
        if (picture) {
          picture._opacity = 255;
        }
      });
      //var box = this.boxes[boxId];
      //console.log(box);
      //box.hide = false;
      //box.parts.forEach(function(p, index) {
      //  if (!p) {
      //    return;
      //  }
      //  console.log(box.pictureIdBase + index);
      //  $gameScreen.movePicture(box.pictureIdBase + index, 0,
      //                          box.x, box.y,
      //                          box.scale, box.scale,
      //                          255, 0, 0);
      //});
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
      case 'PictureBoxPutParts':
        PictureBoxCommand.putParts(args);
        break;
      case 'PictureBoxShow':
        PictureBoxCommand.show(args);
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
