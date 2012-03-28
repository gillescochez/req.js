module.exports = function(grunt) {

  grunt.initConfig({
    meta: {
      banner: '/*! github.com/gillescochez/req.js */'
    },
    min: {
      dist: {
        src: ['<banner>', 'source/req.js'],
        dest: 'dist/req.min.js'
      }
    }
  });

  grunt.registerTask('default', 'min');
};
