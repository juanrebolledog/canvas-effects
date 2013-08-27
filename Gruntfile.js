module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      js: {
        tasks: 'js',
        files: ['src/assets/js/*.js']
      },
      html: {
        tasks: 'default',
        files: ['src/index.html']
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
      main: {
        files: [
          {expand: true, flatten: true, src: ['src/assets/css/*'], dest: 'build/assets/css/', filter: 'isFile'},
          {expand: true, flatten: true, src: ['src/assets/img/*'], dest: 'build/assets/img/', filter: 'isFile'}
        ]
      },
      html: {
        files: [
          {src: 'src/index.html', dest: 'build/index.html'}
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['concat', 'uglify', 'copy']);
  grunt.registerTask('js', ['concat', 'uglify']);

};