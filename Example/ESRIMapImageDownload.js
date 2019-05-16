var downLoader = require('./../Downloader');

var ESRIMapsImageDownloaderUtil = require('./../ESRIMapsImageDownloaderUtil');

var esriMapsImageDownloaderUtil = new ESRIMapsImageDownloaderUtil({});

// var savePath =__dirname + "/../CesiumData/Image/ESRIMaps";
var savePath =__dirname + "/../CesiumData/Image/ESRIMapsChina";

var qq = parseInt(process.argv[2]);

console.log(qq);

var startLevel = 1; // parseInt(process.argv[2]);
var endLevel = 5;   // parseInt(process.argv[3]);

// var requestRect = require('./../RequestRect/WorldWebMercatorRect'); // require(process.argv[4]);
// var requestRect = require('./../RequestRect/ESRIWorld'); // require(process.argv[4]);
var requestRect = require('./../RequestRect/ChinaRect'); // require(process.argv[4]);
requestRect = requestRect.RequestRect();

console.log("startLevel = " + startLevel);
console.log("endLevel = " + endLevel);
console.log("requestRect = " + requestRect.name);

var downloadInfoList = esriMapsImageDownloaderUtil.prepareDownloadInfoList(savePath, startLevel, endLevel, requestRect.left, requestRect.bottom, requestRect.width, requestRect.height);

console.log("total download count = ", downloadInfoList.length);

var timeout = 3000; // 1s

downLoader.recursivelyDownload(downloadInfoList, downloadInfoList.length, timeout);

process.on('uncaughtException', function (err) {
    console.log(err);
});