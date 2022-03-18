module.exports = function(grunt){

    grunt.loadNpmTasks('grunt-contrib-uglify-es');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify:{
            wd_m_pkg:{
                files:{
                    'public/dest/js/wd_m_pkg.min.js': [
                        'public/vendor/jquery/jquery.min.js',
                        'public/vendor/jquery-ui/jquery-ui.min.js',
                        'public/vendor/pace/pace.min.js',
                        'public/vendor/bootstrap/js/bootstrap.min.js',
                        'public/vendor/bootstrap/js/bootstrap-progressbar.min.js',
                        'public/vendor/klorofilpro/klorofilpro-common.js',
                        'public/vendor/moment/moment.min.js',
                        'public/vendor/toastr/toastr.min.js',
                        'public/vendor/intlTelInput/js/intlTelInput-jquery.min.js',
                        'public/vendor/intlTelInput/js/intlTelInput.min.js',
                        'public/vendor/jquery.maskedinput/jquery.maskedinput.min.js',
                        'public/vendor/js.cookie/js.cookie.min.js',
                        'public/vendor/daterangepicker-customized/daterangepicker-customized.js',
                        'public/vendor/select2/select2.min.js',
                        'public/vendor/xlsx/jszip.js',
                        'public/vendor/xlsx/xlsx.min.js',
                        'public/vendor/xlsx/FileSaver.min.js',
                        'public/vendor/socket.io/socket.io.min.js',
                        'public/vendor/datatables/js/datatables.min.js',
                        'public/vendor/datatables/js/dataTables.bootstrap.min.js',
                        'public/vendor/datatables-responsive/dataTables.responsive.min.js',
                        'public/vendor/dropify/dropify.min.js',
                        'public/vendor/datatables-buttons/buttons.colVis.min.js',
                        'public/vendor/datatables-buttons/dataTables.buttons.min.js',
                        'public/vendor/datatables-buttons/buttons.flash.min.js',
                        'public/vendor/datatables-buttons/buttons.html5.min.js',
                        'public/vendor/chart-js/chart-js.min.js',
                        'public/vendor/bootstrap/js/bootstrap-datepicker-timepicker.js',
                        'public/vendor/calendar-table/calendar-table.js',
                    ]
                }
            },
            wd_login:{
                files:{
                    'public/dest/js/wd_login.min.js': [
                        'public/vendor/jquery/jquery.min.js',
                        'public/vendor/hideshowpassword/hideShowPassword.min.js',
                        'public/vendor/js.cookie/js.cookie.min.js',
                        'public/vendor/socket.io/socket.io.min.js',
                        'public/js/public.js',
                        'public/js/core.js',
                        'public/js/login.js',
                    ]
                }
            },
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
            wd_fuelRefillScanner_pkg:{
                files:{
                    'public/dest/js/fuelRefillScanner_pkg.min.js': [
                        'public/vendor/jquery/jquery.min.js',
                        'public/vendor/hideshowpassword/hideShowPassword.min.js',
                        'public/vendor/js.cookie/js.cookie.min.js',
                        'public/vendor/socket.io/socket.io.min.js',
                        'public/vendor/html5-qrcode@2.1.6/html5-qrcode.min.js',
                        'public/vendor/moment/moment.min.js',
                    ]
                }
            },
            wd_fuelRefillScanner:{
                files:{
                    'public/dest/fuelRefillScanner.min.js': [
                        'public/js/public.js',
                        'public/js/core.js',
                        'public/js/fuelRefillScanner.js',
                    ]
                }
            },
        },

        cssmin: {
            wd_l_pkg: {
                files:{
                    'public/dest/css/wd_l_pkg.min.css': [
                        'public/vendor/bootstrap/css/bootstrap.min.css',
                        'public/vendor/line-awesome/css/line-awesome.css',
                        'public/vendor/toastr/toastr.min.css',
                    ]
                }
            },
            wd_m_pkg: {
                files:{
                    'public/dest/css/wd_m_pkg.min.css': [
                        'public/vendor/jquery-ui/jquery-ui.min.css',
                        'public/vendor/bootstrap/css/bootstrap.css',
                        'public/vendor/bootstrap/css/bootstrap-progressbar-3.3.4.min.css',
                        'public/vendor/line-awesome/css/line-awesome.css',
                        'public/vendor/pace/pace-theme-minimal.css',
                        'public/vendor/toastr/toastr.min.css',
                        'public/vendor/intlTelInput/css/intlTelInput.css',
                        'public/vendor/daterangepicker-customized/daterangepicker-customized.css',
                        'public/vendor/select2/select2.min.css',
                        'public/vendor/dropify/dropify.min.css',
                        'public/vendor/datatables/css/jquery.dataTables.min.css',
                        'public/vendor/datatables/css/dataTables.bootstrap.min.css',
                        'public/vendor/datatables-responsive/dataTables.responsive.css',
                        'public/vendor/datatables-buttons/buttons.dataTables.min.css',
                        'public/vendor/css-toggle-switch/toggle-switch.css',
                        'public/vendor/bootstrap/css/bootstrap-datepicker3.css',
                        'public/css/skins/sidebar-nav-darkgray.min.css',
                        'public/css/skins/navbar3.min.css',
                        'public/vendor/calendar-table/calendar-table.css'
                    ]
                }
            },
            wd_app: {
                files:{
                    'public/dest/css/app.min.css': [
                        'public/css/main.css',
                        'public/css/style.css',
                    ]
                }
            },
        },
    })
}