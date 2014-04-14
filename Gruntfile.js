/**
 * Jii Gruntfile
 *
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        nodeunit: {
            all: ['tests/unit/*Test.js']
        },
        concat: {
            client: {
                options: {
                    banner: "/*\n * --- Jii Framework --- */\n",
                    separator: ';'
                },
                dest: 'build/Jii-client.js',
                src: require('./framework/require-client')
            }
        },
        uglify: {
            build: {
                src: '<%= concat.client.dest %>',
                dest: 'build/Jii.min.js'
            }
        },
        copy: {
            tests: {
                src: '<%= concat.client.dest %>',
                dest: 'apps/basic-simple-page/public/js/Jii-client.js'
            }
        }
    });

    // Load tasks
    //grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');

    // Default task(s).
    grunt.registerTask('default', [/*'nodeunit',*/ 'concat', 'uglify', 'copy']);

};