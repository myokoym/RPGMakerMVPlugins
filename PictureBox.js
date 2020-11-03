/*=============================================================================
 PictureBox.js
----------------------------------------------------------------------------
 (C) 2020 Masafumi Yokoyama <myokoym@gmail.com>
 This software is released under the MIT License.
 http://opensource.org/licenses/mit-license.php
----------------------------------------------------------------------------
 Version
 0.4.0 2020/10/31 loadPicturesコマンド追加（addPicture時のタイムラグ回避のため）
 0.3.0 2020/10/28 showBox時に手前の画像が遅れて表示されるバグの修正
 0.2.1 2020/10/19 引数チェックを追加
 0.2.0 2020/10/19 x, y, scaleのデフォルト値をプラグインパラメータ化
 0.1.0 2020/10/18 試作版リリース
 ----------------------------------------------------------------------------
 Latest: https://github.com/myokoym/RPGMakerMVPlugins/blob/main/PictureBox.js
=============================================================================*/

/*:
 * @plugindesc PictureBox
 * @author myokoym
 *
 * @param defaultX
 * @text default x
 * @default 400
 * @type number
 *
 * @param defaultY
 * @text default y
 * @default 0
 * @type number
 *
 * @param defaultScale
 * @text default scale
 * @default 100
 * @type number
 *
 * @help PictureBox.js
 *
 * You can handle multiple pictures at once.
 *   * Overlay partial pictures.
 *   * Partial replacement.
 *   * Move multiple pictures with one command.
 *   * Remove multiple pictures with one command.
 *   etc.
 *
 * Basic Usage
 *   By Plugin Commands.
 *
 *   PictureBox createBox 1 400 100 80
 *   PictureBox addPicture 1 1 body1
 *   PictureBox addPicture 1 2 face1
 *   PictureBox addPicture 1 3 clothes1
 *   PictureBox showBox 1
 *   ...
 *   PictureBox addPicture 1 2 face2
 *   ...
 *   PictureBox destroyBoxAll
 *
 * Plugin Commands
 *   (<>: required, []: optional, ...: multiple, (): valid range)
 *   create box:      PictureBox createBox <boxId (1-5)> [x] [y] [scale]
 *   add picture:     PictureBox addPicture <boxId> <zOrder (1-20)> <pictureName>
 *   load pictures:   PictureBox loadPictures <pictureName>...
 *   show box:        PictureBox showBox <boxId>
 *   move box:        PictureBox moveBox <boxId> <x> <y> [scale] [duration]
 *   remove picture:  PictureBox removePicture <boxId> <zOrder>
 *   hide box:        PictureBox hideBox <boxId>
 *   destroy box:     PictureBox destroyBox <boxId>
 *   destroy all box: PictureBox destroyBoxAll
 *
 * This plugin is released under the MIT License.
 */
/*:ja
 * @plugindesc 画像ボックス
 * @author myokoym
 *
 * @param defaultX
 * @text デフォルトx座標
 * @desc Boxのデフォルトx座標です。createBox呼び出し時にxが省略された場合はこの値が使われます。
 * @default 400
 * @type number
 *
 * @param defaultY
 * @text デフォルトy座標
 * @desc Boxのデフォルトy座標です。createBox呼び出し時にyが省略された場合はこの値が使われます。
 * @default 0
 * @type number
 *
 * @param defaultScale
 * @text デフォルト拡大率
 * @desc Boxのデフォルト拡大率です。createBox呼び出し時にscaleが省略された場合はこの値が使われます。
 * @default 100
 * @type number
 *
 * @help PictureBox.js
 *
 * 複数の画像をまとめて扱えるプラグインです。画像を合成せずに保持するのが特徴で、
 * 差分を重ねての表示、部分的な差し替え、一括移動、一括消去などが主な機能です。
 *
 * 基本的な使用例
 *   プラグインコマンドに以下よって操作します。
 *
 *   PictureBox createBox 1 400 100 80
 *   PictureBox addPicture 1 1 体1
 *   PictureBox addPicture 1 2 表情1
 *   PictureBox addPicture 1 3 服1
 *   PictureBox showBox 1
 *   ...
 *   PictureBox addPicture 1 2 表情2
 *   ...
 *   PictureBox destroyBoxAll
 *
 * プラグインコマンド一覧（詳細は後述）
 *   Box生成コマンド:     PictureBox createBox <boxId (1-5)> [x] [y] [scale]
 *   Picture追加コマンド: PictureBox addPicture <boxId> <zOrder (1-20)> <pictureName>
 *   Picture読込コマンド: PictureBox loadPictures <pictureName>...
 *   Box表示コマンド:     PictureBox showBox <boxId>
 *   Box移動コマンド:     PictureBox moveBox <boxId> <x> <y> [scale] [duration]
 *   Picture削除コマンド: PictureBox removePicture <boxId> <zOrder>
 *   Box非表示コマンド:   PictureBox hideBox <boxId>
 *   Box破棄コマンド:     PictureBox destroyBox <boxId>
 *   全Box破棄コマンド:   PictureBox destroyBoxAll
 *
 * プラグインコマンド詳細
 *   引数について: <>は必須、[]は任意、...は複数指定可、()は有効な値の範囲
 *
 *   Box生成コマンド
 *     PictureBox createBox <boxId (1-5)> [x] [y] [scale]
 *     例: PictureBox createBox 1 400 0 80
 *     説明: Boxの枠を生成します。
 *           Boxに設定したx、y、scaleがすべての画像に適用されます。
 *           Boxは5つまで生成でき、それぞれ20個の画像番号を使用します。
 *
 *   Picture追加コマンド
 *     PictureBox addPicture <boxId> <zOrder (1-20)> <pictureName>
 *     例: PictureBox addPicture 1 1 body1
 *     説明: pictureNameはimg/picturesフォルダ内のファイル名（拡張子除く）を指定します。
 *           追加された画像はzOrderが小さい画像から順に重ねて表示されます。
 *           手前に表示したい画像はzOrderを大きくしてください。
 *           追加された画像はPictureBox showBoxコマンドを呼ぶまでは非表示です。
 *
 *   Picture読込コマンド
 *     PictureBox loadPictures <pictureName>...
 *     例: PictureBox loadPictures body2 body3
 *     説明: pictureNameはimg/picturesフォルダ内のファイル名（拡張子除く）を指定します。
 *           指定された画像はバックグラウンドで読み込まれ、
 *           addPicture時に表示までのタイムラグが少なくなります。
 *           主に、初回showBox後に初めてaddPictureする画像のタイムラグ回避に使用します。
 *           （初回showBoxより前にaddPictureされた画像は自動的にバックグラウンドで
 *             読み込まれるため、loadPicturesに指定する必要はありません。）
 *           （初回showBox時に画像の読み込み待ちをするため、
 *             初回showBoxより前にloadPicturesを呼ぶと確実にタイムラグを減らせます。
 *
 *   Box表示コマンド
 *     PictureBox showBox <boxId>
 *     例: PictureBox showBox 1
 *     説明: 指定したBoxを表示します。
 *           このコマンドを呼ぶまではBoxは非表示になっています。
 *           差分を追加し終わったらこのコマンドで表示させてください。
 *           一度呼ばれると、それ以降に追加した画像はすぐに表示されるようになります。
 *
 *   Box移動コマンド
 *     PictureBox moveBox <boxId> <x> <y> [scale] [duration]
 *     例: PictureBox moveBox 1 300 100 150
 *     説明: 指定したBoxを移動、拡大、縮小します。
 *
 *   Picture削除コマンド
 *     PictureBox removePicture <boxId> <zOrder>
 *     例: PictureBox removePicture 1 1
 *     説明: 指定した画像をBoxと画面上から消去します。
 *
 *   Box非表示コマンド
 *     PictureBox hideBox <boxId>
 *     例: PictureBox hideBox 1
 *     説明: 指定したBoxを一時的に非表示にします。
 *           PictureBox showBoxコマンドで再度表示できます。
 *
 *   Box破棄コマンド
 *     PictureBox destroyBox <boxId>
 *     例: PictureBox destroyBox 1
 *     説明: 指定したBoxを削除して画面上からも消去します。
 *
 *   全Box破棄コマンド
 *     PictureBox destroyBoxAll
 *     例: PictureBox destroyBox
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
    PictureBoxCommand._pluginParametersCache = {};
    PictureBoxCommand.getPluginParameter = function(name) {
        if (typeof this._pluginParametersCache[name] !== "undefined") {
            return this._pluginParametersCache[name];
        }
        var param = PluginManager.parameters("PictureBox")[name];
        if (!isNaN(param)) {
            param = Number(param);
        }
        this._pluginParametersCache[name] = param;
        return param;
    };
    PictureBoxCommand.createBox = function(args) {
        var boxId = args[0]; //1-5
        if (boxId < 1 || boxId > 5) {
          throw new RangeError("引数boxIdの範囲が不正です。プラグインコマンドを確認してください: PictureBox " + args.join(" "));
        }
        var x = args[1] || this.getPluginParameter("defaultX");
        var y = args[2] || this.getPluginParameter("defaultY");
        var scale = args[3] || this.getPluginParameter("defaultScale");
        var pictureIdBase = (boxId - 1) * 20;
        PictureBoxManager.createBox(boxId, pictureIdBase, x, y, scale);
    };
    PictureBoxCommand.addPicture = function(args) {
        var boxId = args[0]; //1-5
        if (!PictureBoxManager.boxes[boxId]) {
          throw new Error("引数boxIdのBoxが存在しません。先にcreateBoxコマンドを呼んでください: PictureBox " + args.join(" "));
        }
        var zOrder = args[1]; //1-20
        if (zOrder < 1 || zOrder > 20) {
          throw new RangeError("引数zOrderの範囲が不正です。プラグインコマンドを確認してください: PictureBox " + args.join(" "));
        }
        var pictureName = args[2];
        PictureBoxManager.addPicture(boxId, zOrder, pictureName);
    };
    PictureBoxCommand.loadPictures = function(args) {
        PictureBoxManager.loadPictures(args);
    },
    PictureBoxCommand.showBox = function(args) {
        var boxId = args[0];
        PictureBoxManager.showBox(boxId);
    };
    PictureBoxCommand.moveBox = function(args) {
        var boxId = args[0];
        var x = args[1];
        var y = args[2];
        var scale = args[3];
        var duration = args[4];
        PictureBoxManager.moveBox(boxId, x, y, scale, duration);
    };
    PictureBoxCommand.removePicture = function(args) {
        var boxId = args[0]; //1-5
        var zOrder = args[1]; //1-20
        PictureBoxManager.removePicture(boxId, zOrder);
    };
    PictureBoxCommand.hideBox = function(args) {
        var boxId = args[0];
        PictureBoxManager.hideBox(boxId);
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
    var runAfterImagesLoaded = function(func) {
        var imagesLoadingInterval = setInterval(function() {
            if (!ImageManager.isReady()) {
                return;
            }
            func();
            clearInterval(imagesLoadingInterval);
        }, 50);
    };
    PictureBoxManager.createBox = function(boxId, pictureIdBase, x, y, scale) {
        this.boxes[boxId] = {
            pictureIdBase: pictureIdBase,
            x: x,
            y: y,
            scale: scale,
            hidden: true,
            shownEvenOnce: false,
            pictures: []
        };
    };
    PictureBoxManager.addPicture = function(boxId, zOrder, name) {
        var box = this.boxes[boxId];
        zOrder = Number(zOrder);
        box.pictures[zOrder] = {
            zOrder: zOrder,
            name: name
        };
        var opacity = 255;
        if (box.hidden) {
            opacity = 0;
        }
        if (box.shownEvenOnce) {
            $gameScreen.showPicture(box.pictureIdBase + zOrder,
                                    name,
                                    0,
                                    box.x, box.y,
                                    box.scale, box.scale,
                                    opacity,
                                    0);
        } else {
            ImageManager.loadPicture(name);
        }
    };
    PictureBoxManager.loadPictures = function(names) {
        for (var i = 0; i < names.length; i++) {
            ImageManager.loadPicture(names[i]);
        }
    };
    PictureBoxManager.showBox = function(boxId) {
        runAfterImagesLoaded(function() {
            var box = PictureBoxManager.boxes[boxId];
            for (var picture of box.pictures) {
                if (!picture) {
                    continue;
                }
                var pictureId = box.pictureIdBase + picture.zOrder;
                if (box.shownEvenOnce) {
                    $gameScreen.picture(pictureId)._opacity = 255;
                } else {
                    $gameScreen.showPicture(pictureId,
                                            picture.name,
                                            0,
                                            box.x, box.y,
                                            box.scale, box.scale,
                                            255,
                                            0);
                }
            }
            box.hidden = false;
            box.shownEvenOnce = true;
        });
    };
    PictureBoxManager.moveBox = function(boxId, x, y, scale, duration) {
        var box = this.boxes[boxId];
        box.x = x;
        box.y = y;
        if (scale) {
            box.scale = scale;
        }
        if (!duration) {
            duration = 1;
        }
        setTimeout(function() { // addPictureとmoveを続けて呼ぶと一部画像が消えることがあるバグの暫定対策
            for (var picture of box.pictures) {
                if (!picture) {
                    continue;
                }
                var pictureId = box.pictureIdBase + picture.zOrder;
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
        delete box.pictures[zOrder];
    };
    PictureBoxManager.hideBox = function(boxId) {
        var box = this.boxes[boxId];
        box.hidden = true;
        for (var picture of box.pictures) {
            if (!picture) {
                continue;
            }
            var pictureId = box.pictureIdBase + picture.zOrder;
            $gameScreen.picture(pictureId)._opacity = 0;
        }
    };
    PictureBoxManager.destroyBox = function(boxId) {
        var box = this.boxes[boxId];
        box.pictures.forEach(function(picture) {
            if (!picture) {
                return;
            }
            $gameScreen.erasePicture(box.pictureIdBase + picture.zOrder);
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
    _Game_Interpreter_pluginCommand.call(this, command, args);
    if (command.toUpperCase() !== "PICTUREBOX") {
        return;
    }
    var subCommand = args.shift();
    switch (subCommand.toUpperCase()) {
        case 'CREATEBOX':
            PictureBoxCommand.createBox(args);
            break;
        case 'ADDPICTURE':
            PictureBoxCommand.addPicture(args);
            break;
        case 'LOADPICTURES':
            PictureBoxCommand.loadPictures(args);
            break;
        case 'SHOWBOX':
            PictureBoxCommand.showBox(args);
            break;
        case 'MOVEBOX':
            PictureBoxCommand.moveBox(args);
            break;
        case 'REMOVEPICTURE':
            PictureBoxCommand.removePicture(args);
            break;
        case 'HIDEBOX':
            PictureBoxCommand.hideBox(args);
            break;
        case 'DESTROYBOX':
            PictureBoxCommand.destroyBox(args);
            break;
        case 'DESTROYBOXALL':
            PictureBoxCommand.destroyBoxAll(args);
            break;
    }
};

})();
