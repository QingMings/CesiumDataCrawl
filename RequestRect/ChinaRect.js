var chinaLeft = 70;
var chinaRight = 130;
var chinaWidth = chinaRight - chinaLeft;

var chinaBottom = 50;
var chinaTop = 10;
var chinaHeight = chinaTop - chinaBottom;

exports.RequestRect = function(){
    return {
        name: "china",
        left:   chinaLeft,
        bottom: chinaBottom,
        width:  chinaWidth,
        height: chinaHeight
    };
};

