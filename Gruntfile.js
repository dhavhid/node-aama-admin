'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    conf: {
      // configurable paths
      app: require('./bower.json').appPath || 'app',
      dist: 'www',
      appName: 'aama',
      angularAppName: 'aama'
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      js: {
        files: ['<%= conf.app %>/scripts/{,*/}*.js'],
        //tasks: ['newer:jshint:all'],
        options: {
          livereload: '<%= connect.options.livereload %>'
        }
      },
      jsTest: {
        files: ['test/spec/{,*/}*.js'],
        //tasks: ['newer:jshint:test', 'karma']
      },
      compass: {
        files: ['<%= conf.app %>/styles/{,**/}*.{scss,sass}'],
        tasks: ['compass:server', 'autoprefixer']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
       nggettext_extract: {
         //files: ['<%= conf.app %>/views/{,**/}*.html', '<%= conf.app %>/langs.html'],
         files: ['<%= conf.app %>/langs.html'],
         tasks: ['nggettext_extract']
       },
       nggettext_compile: {
         files: ['<%= conf.app %>/po/{,*/}*.po'],
         tasks: ['nggettext_compile']
       },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= conf.app %>/{,**/}*.html',
          '.tmp/styles/{,*/}*.css',
          '<%= conf.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9021,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: '0.0.0.0',
        livereload: 19021
      },
      livereload: {
        options: {
          middleware: function (connect, options, middlewares) {
            var rules = ["!\\.html|\\.js|\\.css|\\.svg|\\.jp(e?)g|\\.png|\\.gif|\\.ico|\\.ttf|\\.woff|\\.eot|\\.pdf|\\.tpl$ /index.html"];
            middlewares.unshift(require("connect-modrewrite")(rules));
            return middlewares;
          },
          open: true,
          base: [
            '.tmp',
            '<%= conf.app %>'
          ]
        }
      },
      test: {
        options: {
          port: 29021,
          base: [
            '.tmp',
            'test',
            '<%= conf.app %>'
          ]
        }
      },
      dist: {
        options: {
          base: '<%= conf.dist %>'
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%= conf.app %>/scripts/{,*/}*.js'
      ],
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/spec/{,*/}*.js']
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= conf.dist %>/*',
            '!<%= conf.dist %>/.git*'
          ]
        }, {
          dot: true,
          src: [
            'platforms/android/ant-build/res/**',
            'platforms/android/res/*/splash*.*',
            'platforms/android/res/*/icon.png'
          ]
        }]
      },
      server: '.tmp'
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 30 version']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/'
        }]
      }
    },

    // Automatically inject Bower components into the app
    'wiredep': {
      app: {
        src: '<%= conf.app %>/index.html',
        ignorePath: '<%= conf.app %>/'
      }
    },




    // Compiles Sass to CSS and generates necessary files if requested
    compass: {
      options: {
        sassDir: '<%= conf.app %>/styles',
        cssDir: '.tmp/styles',
        generatedImagesDir: '.tmp/images/generated',
        imagesDir: '<%= conf.app %>/images',
        javascriptsDir: '<%= conf.app %>/scripts',
        fontsDir: '<%= conf.app %>/styles/fonts',
        importPath: '<%= conf.app %>/bower_components',
        httpImagesPath: '/images',
        httpGeneratedImagesPath: '/images/generated',
        httpFontsPath: '/styles/fonts',
        relativeAssets: false,
        assetCacheBuster: false,
        raw: 'Sass::Script::Number.precision = 10\n'
      },
      dist: {
        options: {
          generatedImagesDir: '<%= conf.dist %>/images/generated'
        }
      },
      server: {
        options: {
          debugInfo: true,
          force: true
        }
      }
    },

    // Renames files for browser caching purposes
    rev: {
      dist: {
        files: {
          src: [
            '<%= conf.dist %>/scripts/{,*/}*.js',
            '!<%= conf.dist %>/scripts/vendorcopy/**',
            '<%= conf.dist %>/styles/{,*/}*.css',
            //'<%= conf.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= conf.dist %>/docs/{,*/}*.*'
            //'<%= conf.dist %>/styles/fonts/*'
          ]
        }
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: '<%= conf.app %>/index.html',
      options: {
        dest: '<%= conf.dist %>'
      }
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      html: ['<%= conf.dist %>/{,**/}*.html'],
      css: ['<%= conf.dist %>/styles/{,**/}*.css'],
      options: {
        assetsDirs: ['<%= conf.dist %>', '<%= conf.dist %>/images']
      }
    },

    // The following *-min tasks produce minified files in the dist folder
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= conf.app %>/images',
          src: '{,*/}*.{png,jpg,jpeg,gif}',
          dest: '<%= conf.dist %>/images'
        }]
      }
    },
    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= conf.app %>/images',
          src: '{,*/}*.svg',
          dest: '<%= conf.dist %>/images'
        }]
      }
    },
    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: '<%= conf.dist %>',
          src: ['*.html', 'views/{,**/}*.html'],
          dest: '<%= conf.dist %>'
        }]
      }
    },

    // Add, remove and rebuild AngularJS dependency injection annotations
    ngAnnotate: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/scripts',
          src: '*.js',
          dest: '.tmp/concat/scripts'
        }]
      }
    },
	
	ngtemplates: {
		'aama': {
			cwd: '<%= conf.dist %>',
			src: 'views/{,*/}*.{html,tpl}',
			dest: '<%= conf.dist %>/scripts/templates.js',
			options: {
				prefix: ''
			}
		}
	},

    // Replace Google CDN references
    cdnify: {
      dist: {
        html: ['<%= conf.dist %>/*.html']
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= conf.app %>',
          dest: '<%= conf.dist %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            '*.html',
            'views/{,*/}*.html',
            'images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            'fonts/*',
            'docs/*',
            'scripts/vendorcopy/**',
            'cordova.js'
          ]
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= conf.dist %>/images',
          src: ['generated/*']
        }]
      },
      styles: {
        expand: true,
        cwd: '<%= conf.app %>/styles',
        dest: '.tmp/styles/',
        src: '{,*/}*.css'
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        'compass:server'
      ],
      test: [
        'compass'
      ],
      dist: [
        'compass:dist',
        'imagemin',
        'svgmin'
      ]
    },

    // By default, your `index.html`'s <!-- Usemin block --> will take care of
    // minification. These next options are pre-configured if you do not wish
    // to use the Usemin blocks.
    // cssmin: {
    //   dist: {
    //     files: {
    //       '<%= conf.dist %>/styles/main.css': [
    //         '.tmp/styles/{,*/}*.css',
    //         '<%= conf.app %>/styles/{,*/}*.css'
    //       ]
    //     }
    //   }
    // },
    // uglify: {
    //   dist: {
    //     files: {
    //       '<%= conf.dist %>/scripts/scripts.js': [
    //         '<%= conf.dist %>/scripts/scripts.js'
    //       ]
    //     }
    //   }
    // },
    // concat: {
    //   dist: {}
    // },

    // Test settings
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    },
	
	nggettext_extract: {
		pot: {
		  files: {
			'<%= conf.app %>/po/template.pot': ['<%= conf.app %>/views/*.html', '<%= conf.app %>/*.html']
		  }
		},
	},
	
	nggettext_compile: {
		all: {
		  options: {
			module: '<%= conf.angularAppName %>'
		  },
		  files: {
			'<%= conf.app %>/scripts/translations.js': ['<%= conf.app %>/po/*.po']
		  }
		},
	}
  });
  
  
  function setHtml5Mode(val){
	var html5modeOption = grunt.option('html5mode'),
	    isHtml5mode = typeof val !== 'undefined' ? val : (typeof html5modeOption === 'undefined' ? true : !!html5modeOption),
	    indexPath = grunt.config('conf.app') + '/index.html',
	    indexFl = grunt.file.read(indexPath, {encoding: 'utf8'});

	indexFl = indexFl.replace(/(html5mode\:)([\d\w ]+)(,*)$/igm, '$1 ' + isHtml5mode + '$3');
    grunt.file.write(indexPath, indexFl, {encoding: 'utf8'});
  };

  
  grunt.registerTask('setConfig', function(){
    var config = grunt.option('config') || 'dev',
		isDebug = !!grunt.option('debug'),
        path = grunt.config('conf.app') + '/scripts/config.js',
        fl = grunt.file.read(path, {encoding: 'utf8'});

	fl = fl.replace(/(debug\:)([\d\w ]+)(,*)$/igm, '$1 ' + isDebug + '$3');
	fl = fl.replace(/(config\:)([\d\w\'\" ]+)(,*)$/igm, "$1 '" + config + "'$3");
    grunt.file.write(path, fl, {encoding: 'utf8'});
	
    setHtml5Mode();
  });

  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }
    setHtml5Mode(true);

    grunt.task.run([
      'clean:server',
      'wiredep',
      'concurrent:server',
      'autoprefixer',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('server', function () {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve']);
  });

  grunt.registerTask('test', [
    'clean:server',
    'concurrent:test',
    'autoprefixer',
    'connect:test'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'setConfig',
    'wiredep',
    'nggettext_extract',
    'nggettext_compile',
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer',
    'concat',
    'ngAnnotate',
    'copy:dist',
    'cdnify',
    'cssmin',
    'uglify',
    'rev',
    'usemin',
    'htmlmin',
    'ngtemplates'
  ]);

  grunt.registerTask('po', ['nggettext_extract']);
  
  grunt.registerTask('lang', ['nggettext_compile']);

  grunt.registerTask('default', [
    'test',
    'build',
    'po',
    'lang'
  ]);
};
