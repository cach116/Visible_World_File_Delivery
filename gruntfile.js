module.exports = function (grunt) {
    grunt.initConfig({

        jshint: {
            all: ['app.js']
        }
    });

// load plugins
    grunt.loadNpmTasks('grunt-contrib-jshint');

// register at least this one task
    grunt.registerTask('default', [ 'jshint' ]);


};
