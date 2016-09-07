module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    less: {
      development: {
        options: {
          compress: true,
          yuicompress: true,
          optimization: 2
        },
        files: {
          "dist/css/zenplaces.css": "src/less/zenplaces.less" // destination file : source file
        }
      }
    },
    watch: {
      styles: {
        files: ['src/less/*.less'], // which files to watch
        tasks: ['less'],
        options: {
          nospawn: true
        }
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['watch']);

};
