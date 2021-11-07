module.exports = function(grunt){

    grunt.loadNpmTasks('grunt-contrib-uglify-es');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify:{
            wd_main:{
                files:{
                    'public/dest/js/wd_main.min.js': [
                        'public/js/public.js',
                        'public/js/core.js',
                        'public/js/changelog.js',
                        'public/js/main.js',
                    ]
                }
            },
            wd_remarks:{
                files:{
                    'public/dest/remarks.min.js': [
                        'public/js/remarks.js',
                    ]
                }
            },
        },
    })
}