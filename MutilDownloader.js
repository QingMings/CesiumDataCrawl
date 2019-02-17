var fs = require('fs');
var path = require('path');
//noinspection NpmUsedModulesInstalled
var request = require('request');
var defaultValue = require('./defaultValue');
var util = require('./Util');

var failedDownloadInfoList = [];


function mkDirPath(dirPath)
{
    if(!fs.existsSync(dirPath))
    {
        try
        {
            fs.mkdirSync(dirPath);
        }
        catch(e)
        {
            mkDirPath(path.dirname(dirPath));
            mkDirPath(dirPath);
        }
    }
}


function MutilDownloader (options) {
    // 最大同时下载的数量
    this.maxDownloadTask = defaultValue(options.maxDownloadTask,100);
    // 检测任务的时间
    this.checkDownloadTaskInterval = defaultValue(options.checkDownloadTaskInterval,100)
    // 同时下载的个数
    this.downloadingTasks = 0;
}

// 检测下载任务数量
MutilDownloader.prototype._checkDownloadTaskInterval = function () {
    var vm = this;
    while (this.downloadingTasks < this.maxDownloadTask && this.downloadInfoList.length>0) {

        // debug
        // console.info("put task")
        // console.info("downingTasking:"+ this.downloadingTasks)
        var getDownloadInfo = vm.downloadInfoList.shift();
        vm.tileDownload(getDownloadInfo);
        if (vm.downloadInfoList.length <= 0) {
            break;
        }
    }
}
MutilDownloader.prototype.startDownload = function (downloadInfoList, totalCount, timeout) {
    var vm = this;

    this.downloadInfoList = downloadInfoList;
    this.totalCount = totalCount;
    this.timeout = timeout;
    this.intervalID = setInterval(function () {
        vm._checkDownloadTaskInterval();
    },vm.checkDownloadTaskInterval)
}

MutilDownloader.prototype.tileDownload = function(downloadInfo) {
    var vm = this;
    if (vm.downloadInfoList.length <=0) {
        if (failedDownloadInfoList.length == 0) {
            console.info("all download complated")
        }
        else {
            console.log("Failed count = " + failedDownloadInfoList.length);
            console.log("retrying...\n");

            vm.downloadInfoList = failedDownloadInfoList;
            failedDownloadInfoList  = [];

        }
        return;
    }

    var options = {
        url: downloadInfo.url,
        headers: downloadInfo.headers,
        timeout: vm.timeout
    };

    var filename = downloadInfo.filename;
    var folderPath = path.dirname(filename);

    if(!fs.existsSync(folderPath)) {
        mkDirPath(folderPath);
    }

    var currentCount = vm.downloadInfoList.length;
    var remainingTimeString = util.secondsToString(vm.timeout * currentCount / 1000);
    remainingTimeString = " max remaining time: " + remainingTimeString;

    request
        .get(options)
        .on('response', function () {
            // debugger
            if (this.response.statusCode == 404) {
                console.log((vm.totalCount - currentCount) + "/" + vm.totalCount  + " 404 " + downloadInfo.url + " File or directory not found");

                if (fs.existsSync(filename)) {
                    fs.unlinkSync(filename);
                }

                // close file system.
                for (var i = 0; i < this.dests.length; i++ ) {
                    this.dests[i].close();
                }
            }
        })
        .on('error', function(err) {
            console.log((vm.totalCount - currentCount) + "/" + vm.totalCount + "$$ tasks:"+vm.downloadingTasks+" "+ " error occurs during downloading " + downloadInfo.url + " error code = " + err.code);

            if (fs.existsSync(filename)) {
                fs.unlinkSync(filename);
            }

            // close file system.
            for (var i = 0; i < this.dests.length; i++ ) {
                this.dests[i].close();
            }

            failedDownloadInfoList.push(downloadInfo);
            // vm.downloadingTasks--;
        })
        .pipe(fs.createWriteStream(filename))
        .on('close', function () {
            // debugger
            if(this.bytesWritten > 0) {
                console.log((vm.totalCount - currentCount) + "/" + vm.totalCount + "$$ tasks:"+vm.downloadingTasks+" "+  " download completed from " + options.url + " to " + filename + remainingTimeString);
            }

            // exports.recursivelyDownload(downloadInfoList, totalCount, timeout);
            vm.downloadingTasks--;
        })
        vm.downloadingTasks++;
}

module.exports = MutilDownloader;
// exports.recursivelyDownload = function(downloadInfoList, totalCount, timeout){
//     if (downloadInfoList.length <= 0) {
//         if(failedDownloadInfoList.length == 0) {
//             console.log("all download completed!");
//         }
//         else {
//             console.log("Failed count = " + failedDownloadInfoList.length);
//             console.log("retrying...\n");
//
//             downloadInfoList = failedDownloadInfoList;
//             failedDownloadInfoList = [];
//
//             exports.recursivelyDownload(downloadInfoList, totalCount, timeout);
//         }
//
//         return;
//     }
//
//     var downloadInfo = downloadInfoList.shift();
//
//     var options = {
//         url: downloadInfo.url,
//         headers: downloadInfo.headers,
//         timeout: timeout
//     };
//
//     var filename = downloadInfo.filename;
//     var folderPath = path.dirname(filename);
//
//     if(!fs.existsSync(folderPath)) {
//         mkDirPath(folderPath);
//     }
//
//     var currentCount = downloadInfoList.length;
//     var remainingTimeString = util.secondsToString(timeout * currentCount / 1000);
//     remainingTimeString = " max remaining time: " + remainingTimeString;
//
//     request
//         .get(options)
//         .on('response', function () {
//             // debugger
//             if (this.response.statusCode == 404) {
//                 console.log((totalCount - currentCount) + "/" + totalCount  + " 404 " + downloadInfo.url + " File or directory not found");
//
//                 if (fs.existsSync(filename)) {
//                     fs.unlinkSync(filename);
//                 }
//
//                 // close file system.
//                 for (var i = 0; i < this.dests.length; i++ ) {
//                     this.dests[i].close();
//                 }
//             }
//         })
//         .on('error', function(err) {
//             console.log((totalCount - currentCount) + "/" + totalCount + " error occurs during downloading " + downloadInfo.url + " error code = " + err.code);
//
//             if (fs.existsSync(filename)) {
//                 fs.unlinkSync(filename);
//             }
//
//             // close file system.
//             for (var i = 0; i < this.dests.length; i++ ) {
//                 this.dests[i].close();
//             }
//
//             failedDownloadInfoList.push(downloadInfo);
//         })
//         .pipe(fs.createWriteStream(filename))
//         .on('close', function () {
//             // debugger
//             if(this.bytesWritten > 0) {
//                 console.log((totalCount - currentCount) + "/" + totalCount +  " download completed from " + options.url + " to " + filename + remainingTimeString);
//             }
//
//             exports.recursivelyDownload(downloadInfoList, totalCount, timeout);
//         })
// };