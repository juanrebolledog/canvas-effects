module.exports = function (grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      js: {
        tasks: 'copy:dev',
        files: ['src/assets/js/*.js']
      },
      livereload: {
        options: { livereload: true },
        files: ['src/index.html'],
        tasks: ['preprocess:dev']
      }
    },
    preprocess: {
      options: {
        context: {}
      },
      dev: {
        options: {
          context: {
            DEBUG: true
          }
        },
        src: 'src/index.html',
        dest: 'dev/index.html'
      },
      prod: {
        src: 'src/index.html',
        dest: 'build/index.html'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'build/assets/js/<%= pkg.name %>.js',
        dest: 'build/assets/js/<%= pkg.name %>.min.js'
      }
    },
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['bower_components/jquery/jquery.js', 'bower_components/bootstrap/dist/js/bootstrap.js', 'src/assets/js/<%= pkg.name %>.js'],
        dest: 'build/assets/js/<%= pkg.name %>.js'
      }
    },
    copy: {
      dev: {
        files: [
          {expand: true, flatten: true, src: ['src/assets/css/*'], dest: 'dev/assets/css/', filter: 'isFile'},
          {expand: true, flatten: true, src: ['src/assets/img/*'], dest: 'dev/assets/img/', filter: 'isFile'},
          {src: 'bower_components/jquery/jquery.js', dest: 'dev/assets/js/jquery.js'},
          {src: 'bower_components/bootstrap/dist/js/bootstrap.js', dest: 'dev/assets/js/bootstrap.js'},
          {src: 'src/assets/js/<%= pkg.name %>.js', dest: 'dev/assets/js/<%= pkg.name %>.js'}
        ]
      },
      prod: {
        assets: {
          files: [
            {expand: true, flatten: true, src: ['src/assets/css/*'], dest: 'build/assets/css/', filter: 'isFile'},
            {expand: true, flatten: true, src: ['src/assets/img/*'], dest: 'build/assets/img/', filter: 'isFile'}
          ]
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-preprocess');

  grunt.registerTask('default', ['concat', 'uglify', 'copy']);
  grunt.registerTask('dev', function() {
    grunt.task.run(['copy:dev', 'preprocess:dev']);
  });
  grunt.registerTask('build', function() {
    grunt.task.run(['copy:prod', 'concat', 'uglify', 'preprocess:prod']);
  });
};