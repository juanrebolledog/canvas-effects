(function (document, $) {
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

  var wait_img = new Image();
  var error_img = new Image();
  wait_img.src = 'assets/img/wait.png';
  error_img.src = 'assets/img/error.png';

  function setWaitScreen(ev) {
    red_ctx.drawImage(wait_img, 0, 0);
    green_ctx.drawImage(wait_img, 0, 0);
    blue_ctx.drawImage(wait_img, 0, 0);
    combined_ctx.drawImage(wait_img, 0, 0);
    original_ctx.drawImage(wait_img, 0, 0);
  }

  function setErrorScreen(ev) {
    red_ctx.drawImage(error_img, 0, 0);
    green_ctx.drawImage(error_img, 0, 0);
    blue_ctx.drawImage(error_img, 0, 0);
    combined_ctx.drawImage(error_img, 0, 0);
    original_ctx.drawImage(error_img, 0, 0);
  }

  wait_img.onload = setWaitScreen;

  var video = document.getElementById('video-player');
  var streaming = false;
  var snapshot_btn = document.getElementsByClassName('take-snapshot');

  video.addEventListener('canplay', function (ev) {
    if (!streaming) {
      streaming = true;
    }
    video.play();
    setWaitScreen();
  }, false);
  var i = 0;
  for (i = 0;  i < snapshot_btn.length; i++) {
    snapshot_btn[i].addEventListener('click', function (ev) {
      ImagePaint(video);
      ev.preventDefault();
    }, false);
  }



  function ImageProcess(c) {
    this.context = c;
    this.imageHeight = this.context.canvas.height;
    this.imageWidth = this.context.canvas.width;
    this.source = {
      image: c.getImageData(0, 0, this.imageWidth, this.imageHeight),
      channels: {
        blue: {
          image: c.getImageData(0, 0, this.imageWidth, this.imageHeight),
        },
        green: {
            image: c.getImageData(0, 0, this.imageWidth, this.imageHeight),
        },
        red: {
            image: c.getImageData(0, 0, this.imageWidth, this.imageHeight),
        }
      }
    };

    this.separateChannels = function() {

        for (y = 0; y < this.imageHeight; y++) {
          for (x = 0; x < this.imageWidth; x++) {
            pos = (y * this.imageWidth + x) * 4;
            var hlf = 0.2;
            var dbl = 2.0;

            var red = pos++;
            var green = pos++;
            var blue = pos++;
            var alpha = pos++;

            var r = this.source.image.data[red];
            var g = this.source.image.data[green];
            var b = this.source.image.data[blue];
            var a = this.source.image.data[alpha];

            // red
            this.source.channels.red.image.data[red] = this.source.channels.red.image.data[red] * dbl;
            this.source.channels.red.image.data[green] = this.source.channels.red.image.data[green] * hlf;
            this.source.channels.red.image.data[blue] = this.source.channels.red.image.data[blue] * hlf;

            // green
            this.source.channels.green.image.data[red] = this.source.channels.green.image.data[red] * hlf;
            this.source.channels.green.image.data[green] = this.source.channels.green.image.data[green] * dbl;
            this.source.channels.green.image.data[blue] = this.source.channels.green.image.data[blue] * hlf;

            // blue
            this.source.channels.blue.image.data[red] = this.source.channels.blue.image.data[red] * hlf;
            this.source.channels.blue.image.data[green] = this.source.channels.blue.image.data[green] * hlf;
            this.source.channels.blue.image.data[blue] = this.source.channels.blue.image.data[blue] * dbl;
          }
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

      var pixels = 4 * this.imageHeight * this.imageWidth;
      var offset = 4 * 7;
      var brightness = 0.9;

      var empty_canvas = document.createElement('canvas');
      var empty_ctx = empty_canvas.getContext('2d');
      this.source.channels.combined = {
        image: empty_ctx.getImageData(0, 0, this.imageWidth, this.imageHeight)
      };

      for (y = 0; y < this.imageHeight; y++) {
        for (x = 0; x < this.imageWidth; x++) {
          pos = (y * this.imageWidth + x) * 4;
          var hlf = 0.2;
          var dbl = 2.0;

          var red = pos++;
          var green = pos++;
          var blue = pos++;
          var alpha = pos++;

          var r = this.source.image.data[red];
          var g = this.source.image.data[green];
          var b = this.source.image.data[blue];
          var a = this.source.image.data[alpha];

          this.source.channels.combined.image.data[red] = this.source.channels.red.image.data[red-offset] * brightness;
          this.source.channels.combined.image.data[green] = this.source.channels.red.image.data[green-offset] * brightness;
          this.source.channels.combined.image.data[blue] = this.source.channels.red.image.data[blue-offset] * brightness;
          this.source.channels.combined.image.data[alpha] = 255;

          this.source.channels.combined.image.data[red] = this.source.channels.combined.image.data[red] * brightness + this.source.channels.green.image.data[red+offset] * brightness;
          this.source.channels.combined.image.data[green] = this.source.channels.combined.image.data[green] * brightness + this.source.channels.green.image.data[green+offset] * brightness;
          this.source.channels.combined.image.data[blue] = this.source.channels.combined.image.data[blue] * brightness + this.source.channels.green.image.data[blue+offset] * brightness;

          this.source.channels.combined.image.data[red] = this.source.channels.combined.image.data[red] * brightness + this.source.channels.blue.image.data[red+offset*2] * brightness;
          this.source.channels.combined.image.data[green] = this.source.channels.combined.image.data[green] * brightness + this.source.channels.blue.image.data[green+offset*2] * brightness;
          this.source.channels.combined.image.data[blue] = this.source.channels.combined.image.data[blue] * brightness + this.source.channels.blue.image.data[blue+offset*2] * brightness;
        }
      }

      combined_ctx.putImageData(this.source.channels.combined.image, 0, 0);

      var orig_dl_btn = document.getElementById('original-canvas-download');
      var comb_dl_btn = document.getElementById('combined-canvas-download');

      orig_dl_btn.download = 'original.png';
      orig_dl_btn.href = original_canvas.toDataURL();

      comb_dl_btn.download = 'displaced.png';
      comb_dl_btn.href = combined_canvas.toDataURL();

      return this;
    };
  }

  var ImagePaint = function(element) {
      original_ctx.drawImage(element, 0, 0, 390, 292);
      var imgProc = new ImageProcess(original_ctx);
      imgProc.separateChannels().combineChannels();
  }

  navigator.getMedia = (navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia);

  if (!navigator.getMedia) {
      console.log('Webcam not supported?');
      setErrorScreen();
  } else {
      navigator.getMedia(
      {
          video: true,
          audio: false
      },
      function (stream) {
          if (navigator.mozGetUserMedia) {
              video.mozSrcObject = stream;
          } else {
              var vendorURL = window.URL || window.webkitURL;
              video.src = vendorURL.createObjectURL(stream);
          }
      },
      function (err) {
          console.log('An error occured! ', err);
      }
      );
  }

})(document, jQuery);