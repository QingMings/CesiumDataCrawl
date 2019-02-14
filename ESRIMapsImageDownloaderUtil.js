var fs = require('fs');

var CesiumMath = require('./CesiumMath');
var Cartographic = require('./Cartographic');
var WebMercatorTilingScheme = require('./WebMercatorTilingScheme');




function ESRIMapsImageDownloaderUtil(options) {
    this._imageUrlTemplate = 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{level}/{y}/{x}';

    this._tilingScheme = new WebMercatorTilingScheme({
        ellipsoid : options.ellipsoid
    })
}


ESRIMapsImageDownloaderUtil.prototype.buildImageUrl = function (x, y, level)  {
    var imageurl = this._imageUrlTemplate;
    imageurl = imageurl.replace('{level}',level)
    imageurl = imageurl.replace('{y}',y)
    imageurl = imageurl.replace('{x}',x)

    return imageurl;
}

function  getImageFileName(path, x, y, level) {
    return path + "/" + level + "/" +  y + "/" + x+ ".jpg";
}

ESRIMapsImageDownloaderUtil.prototype.prepareDownloadInfoList = function(path, startLevel, endLevel, left, bottom, width, height) {
    width = CesiumMath.toRadians(width);
    height = CesiumMath.toRadians(height);
    left = CesiumMath.toRadians(left);
    bottom = CesiumMath.toRadians(bottom);

    var rightOrEast = left + width;
    var topOrNorth = bottom + height;

    var infoList = [];

    var leftTop = new Cartographic(left, topOrNorth);
    var rightBottom = new Cartographic(rightOrEast, bottom);

    var ret = {};

    for (var level = startLevel; level <= endLevel; level++){
        ret = this._tilingScheme.positionToTileXY(leftTop, level, ret);

        if (ret == null) {
            continue;
        }

        var startTileX = ret.x;
        var startTileY = ret.y;

        ret = this._tilingScheme.positionToTileXY(rightBottom, level, ret);

        var endTileX = ret.x;
        var endTileY = ret.y;

            for (var y = startTileY; y <= endTileY; y++) {
        for (var x = startTileX; x <= endTileX; x++) {
                var filename = getImageFileName(path, x, y, level);

                if (fs.existsSync(filename)) {
                    const stats = fs.statSync(filename);
                    const fileSizeInBytes = stats.size;

                    if (fileSizeInBytes == 0) {
                        fs.unlinkSync(filename);
                    }
                    else {
                        continue;
                    }
                }

                var url = this.buildImageUrl(x, y, level);
                var headers = [];

                infoList.push({
                    url: url,
                    filename: filename,
                    headers: headers
                });
            }
        }
    }

    return infoList;

};
module.exports = ESRIMapsImageDownloaderUtil;
















