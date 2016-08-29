altriaMap.service('Utility', ['TIME_PERIODS',

	function UtilityConstructor(TIME_PERIODS) {
		var utility = this;
		var debug = false;

		utility.lowerize = function (str) {
			if (typeof str !== 'string') {
				return str;
			}
			return str.charAt(0).toLowerCase() + str.slice(1);
		};

		utility.capitalize = function (str) {
			if (typeof str !== 'string') {
				return str;
			}
			return str.charAt(0).toUpperCase() + str.slice(1);
		};

		utility.transformStringToParameter = function (str) {
			var rex = /[\W^,]/g;

			function parameterize(str) {
				str = str.toLowerCase();
				str = str.replace(rex, "-");
				return str;
			}


			if (angular.isString(str)) {
				return parameterize(str);
			} else if (angular.isArray(str)) {
				//        return str;
				return _.map(str, function (i) {
					return parameterize(i);
				});
			} else {
				return str;
			}
		};

		utility.getType = function (reference) {
			// order IS important because angular.isObject does not distinguish between arrays and objects.
			if (angular.isUndefined(reference)) {
				return 'undefined';
			} else if (angular.isArray(reference)) {
				return 'array';
			} else if (angular.isObject(reference)) {
				return 'object';
			} else if (angular.isString(reference) && angular.isDefined(reference)) {
				return 'string';
			} else if (angular.isNumber(reference)) {
				return 'number';
			} else if (typeof reference === 'boolean') {
				return 'boolean';
			} else if (angular.isFunction(reference)) {
				return 'function';
			} else if (reference === null) {
				return 'null';
			} else if (angular.isElement(reference)) {
				return 'element';
			} else {
				throw new Error('no idea what this is but its not an array, string, boolean, undefined, function , number, element or null:\n' + reference);
			}
		};

		utility.transformArgumentsToParameter = function (thing) {
			//commas, alpha-numeric, multiCase,
			var type = utility.getType(thing);
			var rex = /[^A-z0-9-,]/g;

			//this is dirty as hell but I suck at regular expressions so whatever.
			function parameterize(str) {
				var space = /\s/g;
				var _str = str.toString();

				if (/\\/g.test(_str)) {
					_str = _str.replace(/\\/g, '');
				}
				if (/[\]\[\^`]/g.test(_str)) {
					_str = _str.replace(/[\]\[\^`]/g, '');
				}
				if (rex.test(_str)) {
					_str = _str.replace(rex, '');
				}
				if (space.test(_str)) {
					_str = _str.replace(space, '');

				}

				return _str;
			}

			function transformCollectionToString(collection) {
				var _str;

				_.each(collection, function (v, i) {
					if (_str) {
						_str = _str + ',' + parameterize(v);
					} else {
						_str = parameterize(v);
					}
				});

				return _str;
			}

			if (type === 'object') {
				if (_.keys(thing).length < 1) {
					if (debug) {
						console.warn('passed an empty object');
					}
					return '';
				}
				return transformCollectionToString(thing);
			}

			if (type === 'array') {
				var _str = '';
				if (thing.length < 1) {
					if (debug === true) {
						console.warn('passed an empty array');
					}
					return '';
				}

				for (var i = 0; i < thing.length; i++) {

					if (i !== 0) {
						_str = _str + ',' + parameterize(thing[i]);
					} else {
						_str = parameterize(thing[i]);
					}
				}
				return _str;
			}

			if (type === 'string' || type === 'number' || type === 'boolean') {
				if (type === 'number' || type === 'boolean') {
					thing = thing.toString();
				}
				return parameterize(thing);
			} else {
				if (debug === true) {
					console.warn(thing + " is not an array, string or object");
				}
				return '';
			}

		};

		utility.truncateString = function UTtruncateString(str, limit) {
			var _str;
			if (str.length > limit) {
				_str = str.substring(0, limit - 3);
				_str = _str + '...';
				return _str;
			}
			return str;
		};

		utility.exportTableToCSV = function exportTableToCSV($table, infoObj) {

	        var $rows = $table.find('thead tr:has(th):not(".ng-hide"),tr:has(td):not(".ng-hide")'),
	            // Temporary delimiter characters unlikely to be typed by keyboard
	            // This is to avoid accidentally splitting the actual contents
	            tmpColDelim = String.fromCharCode(11), // vertical tab character
	            tmpRowDelim = String.fromCharCode(0), // null character

	            // actual delimiter characters for CSV format
	            colDelim = '","',
	            rowDelim = '"\r\n"',


	            // Add Data title and filter parameters
              csv = (infoObj.brand && infoObj.brand.length) ? '"Brand' + colDelim + infoObj.brand.toUpperCase() + rowDelim : '"';
	            csv += infoObj.reportSuite + colDelim + infoObj.title.toUpperCase() + rowDelim;
              csv += infoObj.subtitle.length ? 'Time Period' + colDelim + infoObj.subtitle + rowDelim : "";
	            csv += '"\r\n';


	            // Grab text from table into CSV formatted string
	            csv += '"' + $rows.map(function (i, row) {
	                var $row = $(row),
	                    $cols = $row.clone().find('th,td');

	                // remove the edit buttons
	                $cols.find(".edit-link").remove();

	                return $cols.map(function (j, col) {
	                    var $col = $(col),
	                        text = $col.text().trim();

	                    return text.replace('"', '""'); // escape double quotes

	                }).get().join(tmpColDelim);

	            }).get().join(tmpRowDelim)
	                .split(tmpRowDelim).join(rowDelim)
	                .split(tmpColDelim).join(colDelim) + '"',

	            // Data URI
	            csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);
	            var $tempLink = $('<a id="temp-link">Download Link</a>')
	        $(this).after( $tempLink
	            .attr({
	            'download': infoObj.filename,
	                'href': csvData,
	                'target': '_blank'
	        	})
	        	.css("opacity", 0)
	        );

	        document.getElementById('temp-link').click()
	        $tempLink.remove();

	    }

    utility.formatTimePeriod = function (timePeriod){
      for(var period in TIME_PERIODS){
        if(TIME_PERIODS[period] === timePeriod){
          return period;
        }
      }
    };

	  utility.clone = function clone(src) {
			function mixin(dest, source, copyFunc) {
				var name, s, i, empty = {};
				for(name in source){
					// the (!(name in empty) || empty[name] !== s) condition avoids copying properties in "source"
					// inherited from Object.prototype.	 For example, if dest has a custom toString() method,
					// don't overwrite it with the toString() method that source inherited from Object.prototype
					s = source[name];
					if(!(name in dest) || (dest[name] !== s && (!(name in empty) || empty[name] !== s))){
						dest[name] = copyFunc ? copyFunc(s) : s;
					}
				}
				return dest;
			}

			if(!src || typeof src != "object" || Object.prototype.toString.call(src) === "[object Function]"){
				// null, undefined, any non-object, or function
				return src;	// anything
			}
			if(src.nodeType && "cloneNode" in src){
				// DOM Node
				return src.cloneNode(true); // Node
			}
			if(src instanceof Date){
				// Date
				return new Date(src.getTime());	// Date
			}
			if(src instanceof RegExp){
				// RegExp
				return new RegExp(src);   // RegExp
			}
			var r, i, l;
			if(src instanceof Array){
				// array
				r = [];
				for(i = 0, l = src.length; i < l; ++i){
					if(i in src){
						r.push(clone(src[i]));
					}
				}
				// we don't clone functions for performance reasons
				//		}else if(d.isFunction(src)){
				//			// function
				//			r = function(){ return src.apply(this, arguments); };
			}else{
				// generic objects
				r = src.constructor ? new src.constructor() : {};
			}
			return mixin(r, src, clone);

		}
	}

]);
