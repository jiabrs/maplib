(function () {

  "use strict";

  altriaMap.filter ('slug', function () {

    return function (input) {

      if (input) {

        if(input.constructor === Array){

          for(var i=0; i < input.length; i++){
            input[i] = input[i].toLowerCase ().replace (/[^a-z0-9_]/g, '-');
          }

          return input;

        }else{

          return input.toLowerCase ().replace (/[^a-z0-9_]/g, '-');

        }

      }
    };
  });

  altriaMap.filter ('deslug', function(capitalizeFilter){

  	return function (input){

  		if(input){

        if(input.constructor === Array){

          for(var i=0; i < input.length; i++){

            input[i] = capitalizeFilter(input[i].replace(/-/g,' '));

          }

          return input;

        }else{

          return capitalizeFilter(input.replace(/-/g,' '));

        }
  		}
  	}
  });

  altriaMap.filter ('approval', function () {
    return function (input) {
        return '<span class="'+input+'">'+input+'</span>'
    }
  });

  altriaMap.filter('capitalize', function() {
    return function(input, all) {

    input = $.isArray(input) ? input : [input];

    $.each(input, function(key,val){
     input[key] = (!!val) ? val.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
    });

    return input.length === 1 ? input[0] : input;
    }
  });

  altriaMap.filter('extension', function() {
    return function(input) {

      if(!!input){
        var dotIndex = input.lastIndexOf('.');
        return input.substring(dotIndex).toLowerCase();
      }

      return '';
    }
  });

  altriaMap.filter('percentage', ['$filter', function ($filter) {
    return function(input) {
      input = Math.round(parseFloat(input));

      /*if(input % 1 === 0) {
        input = input.toFixed(0);
      }
      else {
        input = input.toFixed(2);
      }*/

      return input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '%';
    };
  }]);

  altriaMap.filter('MorMM', ['$filter', function ($filter) {
    return function(input){
      if (input >= 1000000) {
        return $filter('number')(input/ 100000, 0)/10 + "MM";
      } else if (input >= 1000) {
        return $filter('number')(input / 1000, 0) + "M";
      } else if(angular.isNumber(input)){
        return $filter('number')(input, 0);
      } else{
        return '--';
      }
    }
  }]);

})();
