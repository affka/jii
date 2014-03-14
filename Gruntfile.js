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
            dist: {
                dest: 'build/Jii.js',
                src: [
                    'jii/Jii.js',
                    'jii/main.js'
                ]
            }
        },
        uglify: {
            build: {
                src: 'build/Jii.js',
                dest: 'build/Jii.min.js'
            }
        }
    });

    // Load tasks
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');

    // Default task(s).
    grunt.registerTask('default', ['concat', 'uglify']);

};