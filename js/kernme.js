var canvas;
var background;
var polygon;
var imgRotation;
var imgInstance;
var moveIcons = [];

function init() {
    canvas = new fabric.Canvas('canvas');

    canvas.selection = false;

    fabric.Image.fromURL('images/background.png', function(img) {
        background = img.set({ originX: "center", originY: "center", selectable: false});
        canvas.centerObject(background);
        canvas.add(background);
        background.sendToBack();
    });

    var points = [{"x":116,"y":127},{"x":187,"y":45},{"x":300,"y":20},{"x":413,"y":45},{"x":484,"y":127},{"x":495,"y":250},{"x":468,"y":375},{"x":430,"y":500},{"x":560,"y":540},{"x":600,"y":610},{"x":0,"y":610},{"x":40,"y":540},{"x":170,"y":500},{"x":132,"y":375},{"x":105,"y":250}];
    var options = {selectable: false, objectCaching: false, fill: '#fff', stroke: '#fff', strokeWidth: 10, strokeLineJoin: 'round'};
    polygon = new fabric.Polygon(points, options);
    canvas.centerObject(polygon);
    canvas.add(polygon);

    points.forEach(function(point, index) {
        fabric.Image.fromURL('images/move_icon.png', function(img) {
            img.set({
                name: index,
                left: point.x,
                top: point.y,
                originX: "center",
                originY: "center",
                hasBorders: false,
                hasControls: false,
                padding: 20
            });
            moveIcons.push(img);
            canvas.add(img);
        });
    });

    document.getElementById('file').addEventListener("change", function (e) {
        $(this).fileExif(function(exifObject) {
            switch(exifObject.Orientation) {
                case 3:
                    imgRotation = 180;
                    break;
                case 6:
                    imgRotation = 90;
                    break;
                case 8:
                    imgRotation = -90;
                    break;
                default:
                    imgRotation = 0;
            }
            $.LoadingOverlay("show");
            var reader = new FileReader();
            reader.onload = function (event) {
                canvas.remove(imgInstance);

                var img = new Image();
                img.src = event.target.result;
                img.onload = function () {
                    polygon.fill = null;

                    imgInstance = new fabric.Image(img, {
                        originX: "center",
                        originY: "center",
                        selectable: false
                    });
                    imgInstance.setAngle(imgRotation);
                    var filterGrayscale = new fabric.Image.filters.Grayscale();
                    var filterContrast = new fabric.Image.filters.Contrast({
                        contrast: 255
                    });
                    var filterColorize = new fabric.Image.filters.Blend({
                        color: '#c51b36',
                        mode: 'add'
                    });
                    imgInstance.filters.push(filterGrayscale);
                    imgInstance.filters.push(filterContrast);
                    imgInstance.filters.push(filterColorize);
                    imgInstance.applyFilters(function () {
                        canvas.add(imgInstance);
                        canvas.centerObject(imgInstance);
                        imgInstance.sendToBack();
                        background.sendToBack();
                    });
                    imgInstance.clipTo = function(ctx) {
                        ctx.save();
                        ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
                        polygon.render(ctx);
                        ctx.restore();
                    };
                    document.getElementById('file').type = '';
                    document.getElementById('file').type = 'file';

                    setTimeout(function(){
                        $.LoadingOverlay("hide");
                        $('html, body').animate({
                            scrollTop: $("#canvas").offset().top - 20
                        }, 1000);
                        $('#formOptions, #download').slideDown();
                    }, 1000);
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        });
    });

    canvas.on('object:moving', function (options) {
        var objType = options.target.get('type');
        var p = options.target;
        polygon.points[p.name] = {x: p.getCenterPoint().x, y: p.getCenterPoint().y};
    });

    var imageSizeSlider = $('#imageSize').slider({
        formatter: function(value) {
            return value + '%';
        }
    });
    imageSizeSlider.on("change", function(event) {
        imgInstance.scaleX = event.value.newValue / 100;
        imgInstance.scaleY = event.value.newValue / 100;
        canvas.renderAll();
    });

    var imagePositionXSlider = $('#imagePositionX').slider({
        formatter: function(value) {
            return value + 'px';
        }
    });
    imagePositionXSlider.on("change", function(event) {
        imgInstance.left = event.value.newValue + 300;
        canvas.renderAll();
    });

    var imagePositionYSlider = $('#imagePositionY').slider({
        formatter: function(value) {
            return value + 'px';
        }
    });
    imagePositionYSlider.on("change", function(event) {
        imgInstance.top = event.value.newValue + 300;
        canvas.renderAll();
    });
}

function downloadCanvas() {
    for (var i = 0; i < moveIcons.length; i++) {
        moveIcons[i].scaleX = 0;
        moveIcons[i].scaleY = 0;
    }
    canvas.renderAll();
    var link = document.getElementById('download');
    link.href = document.getElementById('canvas').toDataURL();
    link.download = 'Kern-Me.png';
    for (var i = 0; i < moveIcons.length; i++) {
        moveIcons[i].scaleX = 1;
        moveIcons[i].scaleY = 1;
    }
    canvas.renderAll();
}
