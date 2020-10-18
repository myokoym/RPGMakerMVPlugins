/*=============================================================================
 PictureBox.js
----------------------------------------------------------------------------
 (C) 2020 Masafumi Yokoyama <myokoym@gmail.com>
 This software is released under the MIT License.
 http://opensource.org/licenses/mit-license.php
----------------------------------------------------------------------------
 Version
 0.1.0 2020/10/18 試作版リリース
 ----------------------------------------------------------------------------
 Support: https://twitter.com/myokoym
 Latest: https://github.com/myokoym/RPGMakerMVPlugins/blob/main/PictureBox.js
=============================================================================*/

/*:
 * @plugindesc PictureBox
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
 * 複数の画像をまとめて扱えるプラグインです。画像を合成せずに保持するのが特徴で、
 * 差分を重ねての表示、部分的な差し替え、一括移動、一括消去などが主な機能です。
 *
 * プラグインコマンド一覧
 *   引数について: <>は必須、[]は任意、()は有効な値の範囲
 *
 *   Box生成コマンド
 *     PictureBox_createBox <boxId (1-5)> [x] [y] [scale]
 *     例: PictureBox_createBox 1 400 0 80
 *     説明: Boxの枠を生成します。
 *           Boxに設定したx、y、scaleがすべての画像に適用されます。
 *           Boxは5つまで生成でき、それぞれ20個の画像番号を使用します。
 *
 *   Picture追加コマンド
 *     PictureBox_addPicture <boxId> <zOrder (1-20)> <pictureName>
 *     例: PictureBox_addPicture 1 1 body1
 *     説明: 追加された画像はzOrderが小さい画像から順に重ねて表示されます。
 *           手前に表示したい画像はzOrderを大きくしてください。
 *           追加された画像はPictureBox_showBoxコマンドを呼ぶまでは非表示です。
 *
 *   Box表示コマンド
 *     PictureBox_showBox <boxId>
 *     例: PictureBox_showBox 1
 *     説明: 指定したBoxを表示します。
 *           このコマンドを呼ぶまではBoxは非表示になっています。
 *           差分を追加し終わったらこのコマンドで表示させてください。
 *           一度呼ばれると、それ以降に追加した画像はすぐに表示されるようになります。
 *
 *   Box移動コマンド
 *     PictureBox_moveBox <boxId> <x> <y> [scale] [duration]
 *     例: PictureBox_moveBox 1 300 100 150
 *     説明: 指定したBoxを移動、拡大、縮小します。
 *
 *   Picture削除コマンド
 *     PictureBox_removePicture <boxId> <zOrder>
 *     例: PictureBox_removePicture 1 1
 *     説明: 指定した画像をBoxと画面上から消去します。
 *
 *   [未実装] Box非表示コマンド
 *     PictureBox_hideBox <boxId>
 *     例: PictureBox_hideBox 1
 *     説明: 指定したBoxを一時的に非表示にします。
 *           PictureBox_showBoxコマンドで再度表示できます。
 *
 *   Box破棄コマンド
 *     PictureBox_destroyBox <boxId>
 *     例: PictureBox_destroyBox 1
 *     説明: 指定したBoxを削除して画面上からも消去します。
 *
 *   全Box破棄コマンド
 *     PictureBox_destroyBoxAll
 *     例: PictureBox_destroyBox
 *     説明: すべてのBoxを削除して画面上からも消去します。
 *
 * ライセンス
 *   MITライセンス
 */

(function() {
  'use strict';

  var PictureBoxCommand = (function() {
    function PictureBoxCommand() {
    }
    PictureBoxCommand.createBox = function(args) {
      console.log(args);
      var boxId = args[0]; //1-5
      var x = args[1] || 470;
      var y = args[2] || 0;
      var scale = args[3] || 100;
      var pictureIdBase = (boxId - 1) * 20 + 1;
      PictureBoxManager.createBox(boxId, pictureIdBase, x, y, scale);
    };
    PictureBoxCommand.addPicture = function(args) {
      console.log(args);
      var boxId = args[0]; //1-5
      var zOrder = args[1]; //1-20
      var pictureName = args[2];
      PictureBoxManager.addPicture(boxId, zOrder, pictureName);
    };
    PictureBoxCommand.showBox = function(args) {
      console.log(args);
      var boxId = args[0];
      PictureBoxManager.showBox(boxId);
    };
    PictureBoxCommand.moveBox = function(args) {
      console.log(args);
      var boxId = args[0];
      var x = args[1];
      var y = args[2];
      var scale = args[3];
      var duration = args[4];
      PictureBoxManager.moveBox(boxId, x, y, scale, duration);
    };
    PictureBoxCommand.removePicture = function(args) {
      console.log(args);
      var boxId = args[0]; //1-5
      var zOrder = args[1]; //1-20
      PictureBoxManager.removePicture(boxId, zOrder);
    };
    PictureBoxCommand.destroyBox = function(args) {
      var boxId = args[0];
      PictureBoxManager.destroyBox(boxId);
    };
    PictureBoxCommand.destroyBoxAll = function(args) {
      PictureBoxManager.destroyBoxAll();
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
    PictureBoxManager.addPicture = function(boxId, zOrder, name) {
      var box = this.boxes[boxId];
      zOrder = Number(zOrder);
      box.parts[zOrder] = {
        zOrder: zOrder,
        name: name
      };
      var opacity = 255;
      if (box.hide) {
        opacity = 0;
      }
      console.log(box.pictureIdBase);
      console.log(zOrder);
      console.log("pictureId: ");
      console.log(box.pictureIdBase + zOrder);
      $gameScreen.showPicture(box.pictureIdBase + zOrder,
                              name,
                              0,
                              box.x, box.y,
                              box.scale, box.scale,
                              opacity,
                              0);
    };
    PictureBoxManager.showBox = function(boxId) {
      var box = this.boxes[boxId];
      box.hide = false;
      for (var part of box.parts) {
        if (!part) {
          continue;
        }
        var pictureId = box.pictureIdBase + part.zOrder;
        $gameScreen.picture(pictureId)._opacity = 255;
      }
    };
    PictureBoxManager.moveBox = function(boxId, x, y, scale, duration) {
      var box = this.boxes[boxId];
      box.x = x;
      box.y = y;
      if (scale) {
        console.log(scale);
        box.scale = scale;
      }
      if (!duration) {
        duration = 1;
      }
      setTimeout(function() { // PutPartsとmoveを続けて呼ぶと一部画像が消えることがあるバグの暫定対策
        for (var part of box.parts) {
          if (!part) {
            continue;
          }
          var pictureId = box.pictureIdBase + part.zOrder;
          console.log(pictureId);
          $gameScreen.movePicture(pictureId,
                                  0,
                                  box.x, box.y,
                                  box.scale, box.scale,
                                  255,
                                  0,
                                  duration);
        }
      });
    };
    PictureBoxManager.removePicture = function(boxId, zOrder) {
      var box = this.boxes[boxId];
      zOrder = Number(zOrder);
      $gameScreen.erasePicture(box.pictureIdBase + zOrder);
      delete box.parts[zOrder];
    };
    PictureBoxManager.destroyBox = function(boxId) {
      var box = this.boxes[boxId];
      box.parts.forEach(function(p) {
        console.log(p);
        if (!p) {
          return;
        }
        $gameScreen.erasePicture(box.pictureIdBase + p.zOrder);
      });
      delete this.boxes[boxId];
    };
    PictureBoxManager.destroyBoxAll = function() {
      for (var boxId of Object.keys(this.boxes)) {
        this.destroyBox(boxId);
      }
      this._boxes = {};
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
    switch (command.toUpperCase()) {
      case 'PICTUREBOX_CREATEBOX':
        PictureBoxCommand.createBox(args);
        break;
      case 'PICTUREBOX_ADDPICTURE':
        PictureBoxCommand.addPicture(args);
        break;
      case 'PICTUREBOX_SHOWBOX':
        PictureBoxCommand.showBox(args);
        break;
      case 'PICTUREBOX_MOVEBOX':
        PictureBoxCommand.moveBox(args);
        break;
      case 'PICTUREBOX_REMOVEPICTURE':
        PictureBoxCommand.removePicture(args);
        break;
      case 'PICTUREBOX_DESTROYBOX':
        PictureBoxCommand.destroyBox(args);
        break;
      case 'PICTUREBOX_DESTROYBOXALL':
        PictureBoxCommand.destroyBoxAll(args);
        break;
    }
  };
})();
