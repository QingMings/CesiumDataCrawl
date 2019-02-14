var worldLeft = -180;
var worldRight = 180;
var worldWidth = worldRight - worldLeft;

var worldBottom = -85;
var worldTop = 85;
var worldHeight = worldTop - worldBottom;

exports.RequestRect = function(){
    return {
        name: "world",
        left:   worldLeft,
        bottom: worldBottom,
        width:  worldWidth,
        height: worldHeight
    };
};



