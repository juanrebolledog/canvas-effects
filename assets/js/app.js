(function($) {
    var original_canvas = document.getElementById('original');
    var original_ctx = original_canvas.getContext('2d');
    var red_canvas = document.getElementById('red');
    var red_ctx = red_canvas.getContext('2d');
    var green_canvas = document.getElementById('green');
    var green_ctx = green_canvas.getContext('2d');
    var blue_canvas = document.getElementById('blue');
    var blue_ctx = blue_canvas.getContext('2d');
    var combined_canvas = document.getElementById('combined');
    var combined_ctx = combined_canvas.getContext('2d');

    function setWaitScreen (ev) {
        red_ctx.drawImage(wait_img, 0, 0);
        green_ctx.drawImage(wait_img, 0, 0);
        blue_ctx.drawImage(wait_img, 0, 0);
        combined_ctx.drawImage(wait_img, 0, 0);
        original_ctx.drawImage(wait_img, 0, 0);
    }
    var wait_img = new Image();
    wait_img.src = 'assets/img/wait.png';
    wait_img.onload = setWaitScreen;

    var video = document.getElementById('video-player');
    var streaming = false;
    var snapshot_btn = document.getElementsByClassName('take-snapshot');

    video.addEventListener('canplay', function(ev){
        if (!streaming) {
            width = 390;
            height = video.videoHeight / (video.videoWidth/width);
            video.setAttribute('width', width);
            video.setAttribute('height', height);
            streaming = true;
        }
        video.play();
    }, false);
    console.log(snapshot_btn);
    for (var i=0; i<snapshot_btn.length; i++) {
        snapshot_btn[i].addEventListener('click', function(ev) {
            ImagePaint(video);
            ev.preventDefault();
        }, false);
    }



    function ImageProcess(c) {
        this.context = c;
        this.combinedCanvas = document.getElementById('combined');
        this.imageHeight = this.context.canvas.height;
        this.imageWidth = this.context.canvas.width;
        this.source = {
            image: c.getImageData(0, 0, width, height),
            channels: {
                blue: {
                    image: c.getImageData(0, 0, width, height),
                },
                green: {
                    image: c.getImageData(0, 0, width, height),
                },
                red: {
                    image: c.getImageData(0, 0, width, height),
                }
            }
        };
        this.comb_ctx = this.combinedCanvas.getContext('2d');

        this.separateChannels = function() {
            for (y = 0; y < height; y++) {
                var inpos = 0;
                for (x = 0; x < width; x++) {
                    inpos = (y * width + x) * 4;
                    red = inpos++;
                    green = inpos++;
                    blue = inpos++;
                    alpha = inpos++;
                    var hlf = 0.2;
                    var dbl = 1;

                    r = this.source.image.data[red];
                    g = this.source.image.data[green];
                    b = this.source.image.data[blue];
                    a = this.source.image.data[alpha];

                    this.source.channels.red.image.data[red] = r * dbl;
                    this.source.channels.red.image.data[green] = g * hlf;
                    this.source.channels.red.image.data[blue] = b * hlf;
                    this.source.channels.red.image.data[alpha] = a;

                    this.source.channels.green.image.data[red] = r * hlf;
                    this.source.channels.green.image.data[green] = g * dbl;
                    this.source.channels.green.image.data[blue] = b * hlf;
                    this.source.channels.green.image.data[alpha] = a;

                    this.source.channels.blue.image.data[red] = r * hlf;
                    this.source.channels.blue.image.data[green] = g * hlf;
                    this.source.channels.blue.image.data[blue] = b * dbl;
                    this.source.channels.blue.image.data[alpha] = a;
                }
            };

            this.source.channels.combined = {
                image: this.source.channels.red.image
            };

            var red_dl_btn = document.getElementById('red-canvas-download');
            red_ctx.putImageData(this.source.channels.red.image, 0, 0);
            red_dl_btn.download = 'red.png'
            red_dl_btn.href = red_canvas.toDataURL('image/png');

            var green_dl_btn = document.getElementById('green-canvas-download');
            green_ctx.putImageData(this.source.channels.green.image, 0, 0);
            green_dl_btn.download = 'green.png'
            green_dl_btn.href = green_canvas.toDataURL('image/png');

            var blue_dl_btn = document.getElementById('blue-canvas-download');
            blue_ctx.putImageData(this.source.channels.blue.image, 0, 0);
            blue_dl_btn.download = 'blue.png'
            blue_dl_btn.href = blue_canvas.toDataURL('image/png');

            return this;
        };
        
        this.combineChannels = function() {

            var pixels = 4 * height * width;
            var offset = 4 * 7;
            var brightness = 0.9;
            
            // merge green into red
            while (pixels--) {
                this.source.channels.combined.image.data[pixels] = this.source.channels.combined.image.data[pixels] * brightness + this.source.channels.green.image.data[pixels+offset] * brightness;
            }

            var pixels = 4 * height * width;
            
            // merge blue into red-green
            while (pixels--) {
                this.source.channels.combined.image.data[pixels] = this.source.channels.combined.image.data[pixels] * brightness + this.source.channels.blue.image.data[pixels-offset] * brightness;
            }

            combined_ctx.putImageData(this.source.channels.combined.image, 0, 0);

            var orig_dl_btn = document.getElementById('original-canvas-download');
            var comb_dl_btn = document.getElementById('combined-canvas-download');

            orig_dl_btn.download = 'original.png';
            orig_dl_btn.href = original_canvas.toDataURL();

            comb_dl_btn.download = 'displaced.png';
            comb_dl_btn.href = this.combinedCanvas.toDataURL();

            return this;
        };
    }

    var ImagePaint = function(element) {
        original_ctx.drawImage(element, 0, 0, 390, 292);
        var imgProc = new ImageProcess(original_ctx);
        imgProc.separateChannels().combineChannels();
    }

    navigator.getMedia = (
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia
    );

    navigator.getMedia(
        {
            video: true,
            audio: false
        },
        function (stream) {
            var vendorURL = window.URL || window.webkitURL;
            video.src = vendorURL.createObjectURL(stream);
        },
        function (err) {
            console.log('An error occured! ', err);
        }
    );

})(jQuery);