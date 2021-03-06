// Configuration for Concurrent task(s)
// Runs tasks in parallel to speed up the build process
'use strict';

var taskConfig = function(grunt) {

  grunt.config.set('concurrent', {
    images: [
      'imagemin:dist',
    ],
    compile: [
      'less:dist',
      'handlebars:dist',
      'browserify:dist'
    ],
  });

};

module.exports = taskConfig;
