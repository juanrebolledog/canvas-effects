(function ($) {
  var image_width = 390;
  var image_height = 292;
  var original_canvas = document.getElementById('original');
  var original_ctx = original_canvas.getContext('2d');
  var combined_canvas = document.getElementById('combined');
  var combined_ctx = combined_canvas.getContext('2d');
  var img_file = document.getElementById('img-file');
  var ImageProcessor = new ImageProcess();

  var wait_img = new Image();
  var error_img = new Image();
  wait_img.src = 'assets/img/wait.png';
  error_img.src = 'assets/img/error.png';

  function setWaitScreen(ev) {
    combined_ctx.drawImage(wait_img, 0, 0);
    original_ctx.drawImage(wait_img, 0, 0);
  }

  function setErrorScreen(ev) {
    combined_ctx.drawImage(error_img, 0, 0);
    original_ctx.drawImage(error_img, 0, 0);
  }

  img_file.addEventListener('change', function(ev) {
    var files = ev.target.files;
    var reader = new FileReader();
    var captured_img = new Image();
    reader.onload = (function(theFile) {
      return function(e) {
        captured_img.src = e.target.result;
        ImagePaint(captured_img);
      };
    })(files[0]);
    reader.readAsDataURL(files[0]);
    ev.preventDefault();
  }, false);

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

  function snap(ev) {
    ImagePaint(video);
    ev.preventDefault();
  }

  var i = 0;
  for (i = 0;  i < snapshot_btn.length; i++) {
    snapshot_btn[i].addEventListener('click', snap, false);
  }

  var offset_range = document.getElementById('offset');
  offset_range.addEventListener('change', function (ev) {
    var offset = ev.target.value;
    ImageProcessor.setOffset(offset);
    ImageProcessor.combineChannels();
  });

  function ImageProcess() {
    this.context = null;
    this.offset = 10;

    this.setContext = function(c) {
      this.context = c;
      this.imageHeight = this.context.canvas.height;
      this.imageWidth = this.context.canvas.width;
      this.source = {
      image: c.getImageData(0, 0, image_width, image_height),
        channels: {
          blue: {
            image: c.getImageData(0, 0, image_width, image_height)
          },
          green: {
              image: c.getImageData(0, 0, image_width, image_height)
          },
          red: {
              image: c.getImageData(0, 0, image_width, image_height)
          }
        }
      };
    };

    this.setOffset = function(offset) {
      this.offset = offset;
    };

    this.separateChannels = function() {

        for (y = 0; y < image_height; y++) {
          for (x = 0; x < image_width; x++) {
            pos = (y * image_width + x) * 4;
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
        }

        return this;
    };

    this.combineChannels = function() {

      var pixels = 4 * this.imageHeight * this.imageWidth;
      var offset = 4 * this.offset;
      var brightness = 0.9;

      var empty_canvas = document.createElement('canvas');
      var empty_ctx = empty_canvas.getContext('2d');
      this.source.channels.combined = {
        image: empty_ctx.getImageData(0, 0, image_width, image_height)
      };

      for (y = 0; y < image_height; y++) {
        for (x = 0; x < image_width; x++) {
          pos = (y * image_width + x) * 4;
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
      original_ctx.drawImage(element, 0, 0, image_width, image_height);
      ImageProcessor.setContext(original_ctx);
      ImageProcessor.separateChannels().combineChannels();
  };

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
})(jQuery);