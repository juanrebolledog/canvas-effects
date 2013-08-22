module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
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
        src: ['bower_components/jquery/jquery.js', 'bower_components/bootstrap/dis/js/bootstrap.js', 'src/assets/js/<%= pkg.name %>.js'],
        dest: 'build/assets/js/<%= pkg.name %>.js'
      }
    },
    copy: {
      main: {
        files: [
          {expand: true, flatten: true, src: ['src/assets/css/*'], dest: 'build/assets/css/', filter: 'isFile'},
          {expand: true, flatten: true, src: ['src/assets/img/*'], dest: 'build/assets/img/', filter: 'isFile'}
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', ['concat', 'uglify', 'copy']);

};