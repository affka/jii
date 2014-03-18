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
        concat: {
            options: {
                banner: "/* --- Jii Framework --- */\n",
                separator: ';'
            },
            client: {
                dest: 'build/Jii.js',
                src: require('./jii/require-client')
            }
        },
        uglify: {
            build: {
                src: 'build/Jii.js',
                dest: 'build/Jii.min.js'
            }
        },
        nodeunit: {
            all: ['tests/unit/*Test.js']
        }
    });

    // Load tasks
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');

    // Default task(s).
    grunt.registerTask('default', [/*'nodeunit',*/ 'concat', 'uglify']);

};