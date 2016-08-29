altriaMap.service('RequestService', ['$rootScope', '$http', 'FilterService', '$log', '$location', 'Utility', 'ngDialog', '$q', '$filter'
  ,
  function ($rootScope, $http, FilterService, $log, $location, Utility, ngDialog, $q, $filter) {
    var _baseUrl = $location.host(),
      _currentRequests = {},
      self = this;

    function generateError(status, data, config, headers) {
      if (!$rootScope.errorDialog) {
        $rootScope.errorDialog = true; //prevent multiple error dialogs from opening
        ngDialog.open({
          template: '' +
          '<h2 class="ng-dialog-error-message ng-dialog-error">A server error occurred.</h2>',
          plain: true
        });
      }
      $log.warn("the request failed because:");
      $log.warn(status);
      $log.warn("the data returned was:");
      $log.warn(data);
      $log.warn("the request was:");
      $log.warn(config);
      $log.warn("and the headers were:");
      $log.warn(headers);
    }

    function constructUrl(type) {
      var hostName = $location.host(),
        _communityType = FilterService.getCommunitySelectType(),
        _timePeriod = FilterService.displayTimePeriod().value,
        _brand = $rootScope.$stateParams.brand.replace('-', ''),
        _contentType = FilterService.getContentType(),
        _communities, _documentType, _dateSort, _reportType, _promotions;



      if (hostName === "localhost" || hostName.indexOf('local') != -1) {
        //_baseUrl = '//map-dev.lbi.io/api';
        _baseUrl = 'https://qamap.leoburnett.com/api';
        //_baseUrl = 'http://10.50.10.228:8888/api';
        ///_baseUrl = '//map.leoburnett.com/api';
      } else {

        _baseUrl = '//' + hostName + '/api'; //':' + $location.port() + '/api';
      }

      if (type === "search" || type === "search-terms") {
        _communityType = 'single-community';
      }

      switch (_communityType) {

        case 'single-community':

          switch (type) {

            case "addNote":
            case "updateNote":

              _communities = FilterService.getModalSingleCommunitySelect();

              break;

            case "search":
            case "search-terms":
            case "search-paging":

              _communities = FilterService.getSearchSingleCommunitySelect();

              break;

            default:

              _communities = FilterService.getSingleCommunitySelect();

          }

          break;

        case 'multi-community':

          switch (type) {

            case "addNote":
            case "updateNote":

              _communities = FilterService.displayModalMultiCommunitySelect();

              break;

            default:
              _communities = FilterService.getMultiCommunitySelect();

          }

          break;

        default:

          var str = 'communitySelectType is neither single-community, nor multi-community.\n _communityType is :' + _communityType;
          throw new Error(str);
      }

      if (_communities === false) {
        return false;
      }


      switch (type) {
        case 'note':
        case 'addNote':
        case 'updateNote':
        case 'deleteNote':
        case "addPromoNote":
        case "updatePromoNote":
        case "deletePromoNote":
        case "addEmailNote":
        case "updateEmailNote":
        case "deleteEmailNote":
        case 'note-paging':
          _documentType = 'document';
          _reportType = 'note';
          _dateSort = '';
          _communities = _communities + '/';
          break;

        case 'listCommunities':
          _documentType = 'communities';
          _reportType = 'comment';
          _dateSort = '';
          _communities = '';
          _dateSort = '';
          _timePeriod = '';
          break;

        case 'compareMultipleCommunities':
          _documentType = 'communities';
          _reportType = 'comment';
          _communities = _communities + '/';
          _dateSort = '';
          _timePeriod = FilterService.displayTimePeriod().value;
          // _timePeriod = 'now-12M,now';

          break;

        case 'image':
          _documentType = "images";
          break;

        case 'search':
        case 'search-paging':
          _documentType = 'document';
          _reportType = 'comment';
          _communities = _communities + '/';
          _timePeriod = FilterService.displaySearchTimePeriod().value;
          break;

        case 'search-terms':
          _documentType = 'terms';
          _reportType = 'comment';
          _communities = _communities + '/';
          _timePeriod = FilterService.displaySearchTimePeriod().value;
          break;

        case 'promotion-overview':
        case 'promotion-filters':
        case 'promotion-trend':

          _documentType = "promotions";
          _promotions = FilterService.getSelectedPromo();
          _dateSort = FilterService.getPromoDateSort();
          break;

        case 'compareMultiplePromos':
          _documentType = 'promotions';

          _promotions = FilterService.displayPromoMultiSelect();
          _dateSort = '';
          _timePeriod = '';
          // _timePeriod = 'now-12M,now';

          break;

        case 'promotion-notes':
        case 'promo-note-paging':
          _documentType = 'promotions';
          _promotions = FilterService.getPromoSelectType() === 'single-promo' ? FilterService.getSelectedPromo() : FilterService.displayPromoMultiSelect();
          _reportType = 'note';
          _timePeriod = 'all';
          _dateSort = 'all';
          _communities = _communities + '/';

          break;

        case 'email-filters':
        case 'email-overview':
        case 'email-trend':
          _documentType = "email";
          _promotions = FilterService.getSelectedEmail()['id'];
          _dateSort = FilterService.getPromoDateSort();
          break;

        case 'email-notes':
          _documentType = 'email';
          _promotions = FilterService.getEmailSelectType() === 'single-email' ? FilterService.getSelectedEmail().Name : FilterService.displayEmailMultiSelect();
          _reportType = 'note';
          _timePeriod = 'all';
          _dateSort = 'all';
          _communities = _communities + '/';


          break;

        case 'expanded-notes':

          var timestamp,
              endDate;

          _documentType = 'document';
          _reportType = 'note';
          _dateSort = FilterService.getDateSort();


          if(FilterService.displayCommunitySelectType() !== 'multi-community'){

            _communities = _communities + '/';


            timestamp = FilterService.displayExpandedTimePeriod();
            endDate = new Date(timestamp);

            switch (_dateSort) {

              case "month":
                endDate.setUTCMonth(endDate.getUTCMonth() + 1);
                _timePeriod = timestamp + "," + (endDate.getTime()-1);
                break;

              case "week":
                endDate.setUTCDate(endDate.getUTCDate() + 7);
                _timePeriod = timestamp + "," + (endDate.getTime()-1);
                break;

              case "day":
                endDate.setUTCDate(endDate.getUTCDate() + 1);
                _timePeriod = timestamp + "," + (endDate.getTime()-1);
                break;

              default:
                _timePeriod = "";
                break;

            }

          } else {
            _communities = FilterService.getExpandedTimePeriod()+'/';
            _timePeriod = FilterService.displayTimePeriod().value;

          }


          _dateSort = "all";

          break;

        case 'promotion-expanded-notes':

          _documentType = 'promotions';
          _reportType = 'note';
          _dateSort = FilterService.getPromoDateSort();
          //_communities = _communities + '/';

          if(FilterService.getPromoSelectType() === 'single-promo'){

            _promotions = FilterService.getPromoSelectType() === 'single-promo' ? FilterService.getSelectedPromo() : FilterService.displayPromoMultiSelect();

            var timestamp = FilterService.displayExpandedPromoTimePeriod();
            var endDate = new Date(timestamp);

            switch (_dateSort) {
              case "month":
                endDate.setUTCMonth(endDate.getUTCMonth() + 1);
                _timePeriod = timestamp + "," + (endDate.getTime()-1);
                break;

              case "week":
                endDate.setUTCDate(endDate.getUTCDate() + 7);
                _timePeriod = timestamp + "," + (endDate.getTime()-1);
                break;

              case "day":
                endDate.setUTCDate(endDate.getUTCDate() + 1);
                _timePeriod = timestamp + "," + (endDate.getTime()-1);
                break;

              default:
                _timePeriod = "";
                break;

            }

          }else{

            _promotions = FilterService.displayExpandedPromoTimePeriod();
            _timePeriod = FilterService.displayPromoTimePeriod();

          }

          _dateSort = "all";

          break;

        default:
          _documentType = 'trend';
          _reportType = 'comment';
          _communities = _communities + '/';
          _dateSort = FilterService.getDateSort() + '/';
          break;
      }


      if (mock === true) {

        if (type === 'note') {
          return '/mockNote.json';
        } else if (type === 'listCommunities') {
          return '/mockCommunities.json';
        } else {
          return '/mockTrend.json';

        }
      } else {

        var serviceURL = _baseUrl +
          '/' +
          _documentType;


        switch (type) {

          case "addNote":
          case "updateNote":
          case "deleteNote":
          case "addPromoNote":
          case "updatePromoNote":
          case "deletePromoNote":


            serviceURL += '/' +
            _brand +
            '/' +
            _reportType +
            '/' +
            _contentType;

            break;

          case "addEmailNote":
          case "updateEmailNote":
          case "deleteEmailNote":

       //     serviceURL =  'http://mapdev.dxide.com/api/document/marlboro/note/email/'
            serviceURL =  'http://mapdev.dxide.com/api/document/' +
              _brand +
              '/' +
              _reportType +
              '/' +
              _contentType;


            // serviceURL = "/_res/data/email-overview-result.json";
            //serviceURL =
            //  "https://mapdev.dxide.com/api/email/overview/marlboro/";

            break;

          case "email-overview":
            serviceURL =  'https://mapdev.dxide.com/api/email/overview' +
            '/' + _brand +
            '/' + _promotions;


            // serviceURL = "/_res/data/email-overview-result.json";
           //serviceURL =
           //  "https://mapdev.dxide.com/api/email/overview/marlboro/";

            break;

          case "email-filters":

          //  serviceURL = "/_res/data/email-filters-result.json";
            serviceURL =
              "https://mapdev.dxide.com/api/email/filter/marlboro/";
            break;

          //case "email-filters":
		  //
          //  var serviceURL = "http://localhost:8000" +
          //    '/' +
          //    _documentType;

          case "promotion-filters":

            serviceURL += '/filter/' + _brand;

            break;

          case "promotion-overview":

              serviceURL +=
              '/' + 'overview' +
              '/' + _brand +
              '/' + _promotions;

            break;

          case "email-overview":

            //var serviceURL = "http://localhost:8000/api/" + _documentType +
            //  '/' + 'overview' +
            //'/' + _brand +
            //'/' + _promotions;
			//
            //break;

          case "email-trend":
            var serviceURL = "http://localhost:8000" +
              '/' +
              _documentType;

          case "promotion-trend":

            serviceURL += '/trend' +
            '/' + _brand +
            '/' + _promotions +
            '/' + _dateSort;

            break;

          case "compareMultiplePromos":

            serviceURL += '/hist' +
            '/' + _brand +
            '/' + _promotions + '/';

            break;


          case "email-notes":
          case "email-note-paging":
            //var serviceURL = "http://localhost:8000" +
            //  '/' +
            ////  _documentType;
            serviceURL = 'https://mapdev.dxide.com/api/email/notes/'
              + _brand +
          '/' + _promotions +
          '/' + _timePeriod +
          '/' + _dateSort;

            break;

          case "promotion-notes":
          case "promo-note-paging":

            serviceURL += '/notes' +
            '/' + _brand +
            '/' + _promotions +
            '/' + _timePeriod +
            '/' + _dateSort;

            break;


          case "expanded-notes":

            serviceURL += '/' +
            _brand +
            '/' +
            _reportType +
            '/' +
            _contentType +
            '/' +
            _communities +
            _timePeriod +
            '/' + _dateSort;

            break;

          case "promotion-expanded-notes":

            serviceURL += '/notes' +
            '/' + _brand +
            '/' + _promotions +
            '/' + _timePeriod +
            '/' + _dateSort;

            break;

          case "search":
          case "search-terms":
          case "search-paging":
          case "note-paging":

            serviceURL += '/' +
            _brand +
            '/' +
            _reportType +
            '/' +
            _contentType +
            '/' +
            _communities +
            _timePeriod;

            break;


            serviceURL += '/' +
            _brand +
            '/' +
            _reportType +
            '/' +
            _contentType +
            '/' +
            _communities;

            break;

          case "image":

            if (hostName == "localhost") {
              serviceURL = "//localhost:9666/images";
            } else {
              serviceURL = '//' + hostName + ':' + $location.port() + '/images';
            }

            break;

          case "user-info":


            if (hostName == "localhost")
              serviceURL = "//localhost:9666/user";
            else
              serviceURL = '//' + hostName + ':' + $location.port() + '/user';

            break;


          default:

            serviceURL += '/' +
            _brand +
            '/' +
            _reportType +
            '/' +
            _contentType +
            '/' +
            _communities +
            _dateSort +
            _timePeriod;

            break;
        }

        return serviceURL;
      }
    }

    this.data = function RSdata(type, dataObj, uploadFile) {
      var _type = Utility.getType(type),
        _canceller = $q.defer(),
        _requestXhr;

      if (dataObj == null) {
        dataObj = {};
      }

      //dataObj.timeout = _canceller.promise;

      if (_type !== 'string' && _type !== 'undefined') {
        return;
      }
      var url = constructUrl(type);
      if (!url) {
        return;
      }

      if(type === "") type = "default";

      if (_currentRequests[type] && type) {

        if (_currentRequests[type].url == url ) {
          if(typeof Promise !== "undefined" && Promise.toString().indexOf("[native code]") !== -1){
          //_currentRequests[type].canceller.resolve("canceling duplicate "+ type);

          /*console.log("canceling duplicate request: "+type);
           delete _currentRequests[type];*/
            return new Promise(function (resolve, reject) {
            // do a thing, possibly async, then…
            //console.log("Preventing duplicate request: " + type);
              reject();
            });
          }
          else {

            //for the 'compare communities' , for some reason I don't know there is always a duplicate request, the code commented aboved is used
            //for this purpose. I changed it to the one below to support older browsers also.  --Jia

            return;
          }
        }


         else if(FilterService.getIsNewPromoSelected()){

          switch(type){

            case "compareMultiplePromos":
            case 'promotion-overview':
            case 'promotion-filters':
            case 'promotion-trend':
            case 'promotion-notes':
            case 'promo-note-paging':
            case 'promotion-expanded-notes':
            case 'email-notes':

              if(typeof _currentRequests[type].canceller.abort == "function")
                _currentRequests[type].canceller.abort("overriding existing request: "+type);
              else if(typeof _currentRequests[type].canceller.reject == "function")
                _currentRequests[type].canceller.reject("overriding existing request: "+type);

              delete _currentRequests[type];
          }

        }

      }

      var deferredAbort = $q.defer();

      switch (type) {

        case "addNote":
        case "addPromoNote":
        case "addEmailNote":

          _requestXhr = $http.put(url, dataObj)
            .success(function (info) {

              delete _currentRequests[type];

              if (uploadFile) {
                var uploadData = new FormData();

                uploadData.append("name", info.id);
                uploadData.append("file", uploadFile);

                url = constructUrl("image");

                $http.defaults.useXDomain = true;
                delete $http.defaults.headers.common['X-Requested-With'];

                $http.post(url, uploadData, {
                  withCredentials: true,
                  xsrfCookieName: "_files_session",
                  xsrfHeaderName: "X-XSRF-TOKEN",
                  transformRequest: angular.identity,
                  headers: {
                    'Content-Type': undefined
                  }
                }).success(function (resp) {

                  delete _currentRequests["image"];

                }).error(function (data, status, headers, config) {
                  generateError(status, data, config, headers);
                  delete _currentRequests["image"];
                });
              }
              delete _currentRequests[type];
            })
            .error(function (data, status, headers, config) {
              generateError(status, data, config, headers);
              delete _currentRequests[type];
            });

          break;

        case "updateNote":
        case "updatePromoNote":
        case "updateEmailNote":
          _requestXhr = $http.put(url + "/" + dataObj.id, dataObj)
            .success(function (info) {
              delete _currentRequests[type];

              if (uploadFile) {

                var uploadData = new FormData();

                uploadData.append("name", dataObj.id);
                uploadData.append("file", uploadFile);

                url = constructUrl("image");

                $http.defaults.useXDomain = true;
                delete $http.defaults.headers.common['X-Requested-With'];

                $http.post(url, uploadData, {
                  withCredentials: true,
                  xsrfCookieName: "_files_session",
                  xsrfHeaderName: "X-XSRF-TOKEN",
                  transformRequest: angular.identity,
                  headers: {
                    'Content-Type': undefined
                  }
                })
                  .success(function (resp) {
                    delete _currentRequests["image"];
                  })
                  .error(function (data, status, headers, config) {
                    generateError(status, data, config, headers);
                    delete _currentRequests["image"];
                  });
              }
            })
            .error(function (data, status, headers, config) {
              generateError(status, data, config, headers);
              delete _currentRequests[type];
            });

          break;

        case "deleteNote":
        case "deletePromoNote":
        case "deleteEmailNote":
          _requestXhr = $http.delete(url + "/" + dataObj.id, {timeout : deferredAbort.promise})
            .success(function (info) {
              delete _currentRequests[type];
            })
            .error(function (data, status, headers, config) {
              generateError(status, data, config, headers);
              delete _currentRequests[type];
            });

          break;

        case "search":

          _requestXhr = $http.get(url + "/" + (dataObj.query || "all"),{timeout : deferredAbort.promise})
            .success(function (info) {

              FilterService.setSearchResults(info);
              delete _currentRequests[type];

            }).
            error(function (data, status, headers, config) {
              generateError(status, data, config, headers);
              delete _currentRequests[type];
            });

          break;


        case "search-paging":
        case "note-paging":

          _requestXhr = $http.get(url + "/" + (dataObj.query || "all") + "/p/" + dataObj.pageNum + "," + dataObj.amtPerPage, {timeout : deferredAbort.promise})
            .success(function (info) {
              delete _currentRequests[type];
              //FilterService.setSearchResults(info);

            }).
            error(function (data, status, headers, config) {
              generateError(status, data, config, headers);
              delete _currentRequests[type];
            });

          break;

        case "promotion-filters":

          _requestXhr = $http.get(url,{timeout: deferredAbort.promise})
            .success(function (info) {
              self.checkNoDataAvailable(info);
              delete _currentRequests[type];
            }).
            error(function (data, status, headers, config) {
              generateError(status, data, config, headers);
              delete _currentRequests[type];
            });

          break;

        case "promotion":

          break;

        case "promotion-notes":
        case "email-notes":

          _requestXhr = $http.get(url,{timeout: deferredAbort.promise})
            .success(function (info) {
              delete _currentRequests[type];
            })
            .error(function (data, status, headers, config) {
              generateError(status, data, config, headers);
              delete _currentRequests[type];
            });

          break;

        case "promo-note-paging":

          _requestXhr = $http.get(url + "/p/" + dataObj.pageNum + "," + dataObj.amtPerPage,{timeout: deferredAbort.promise})
            .success(function (info) {

              //FilterService.setSearchResults(info);
              delete _currentRequests[type];

            }).
            error(function (data, status, headers, config) {
              generateError(status, data, config, headers);
              delete _currentRequests[type];
            });

          break;

        case "promotion-trend":

          _requestXhr = $http.get(url,{timeout: deferredAbort.promise})
            .success(function (info) {
              var _graphFilters = info.hasOwnProperty('keys') ? $.extend({}, info['keys']) : _.keys(info);
              _.pull(_graphFilters, 'Date', 'Total', 'date', 'total', 'Keys', 'keys');
              FilterService.setPromoChartData(info);
              FilterService.setPromoGraphFilters(_graphFilters);
              delete _currentRequests[type];
            })
            .error(function (data, status, headers, config) {
              generateError(status, data, config, headers);
              delete _currentRequests[type];
            });

          break;
        case "compareMultipleCommunities":
          _requestXhr = $http.get(url,{timeout: deferredAbort.promise})
            .success(function (info) {
              var _graphFilters = _.keys(info.Total);

              FilterService.setChartData(info);
              FilterService.setGraphFilters(_graphFilters);

              self.checkNoDataAvailable(info);
              delete _currentRequests[type];

            }).
            error(function (data, status, headers, config) {
              generateError(status, data, config, headers);
              delete _currentRequests[type];
            });
          break;

        case "compareMultiplePromos":
          _requestXhr = $http.get(url,{timeout: deferredAbort.promise})
            .success(function (info) {
              var _graphFilters = _.keys(info.Total);

              _.pull(_graphFilters, 'Date', 'Total', 'date', 'total', 'Keys', 'keys');
              FilterService.setPromoChartData(info);
              FilterService.setPromoGraphFilters(_graphFilters);

              self.checkNoDataAvailable(info);
              delete _currentRequests[type];

            }).
            error(function (data, status, headers, config) {
              generateError(status, data, config, headers);
              delete _currentRequests[type];
            });
          break;

        case "note":

          _requestXhr = $http.get(url,{timeout : deferredAbort.promise})
            .success(function (info) {
              delete _currentRequests[type];
            })
            .error(function (data, status, headers, config) {
              generateError(status, data, config, headers);
              delete _currentRequests[type];
            });

          break;

        case "user-info":

          _requestXhr = $http.get(url + '/' + dataObj,{timeout : deferredAbort.promise})
            .success(function (info) {
              delete _currentRequests[type];
            })
            .error(function (data, status, headers, config) {
              generateError(status, data, config, headers);
              delete _currentRequests[type];
            });

          break;

        case "expanded-notes":
        case "promotion-expanded-notes":

          _requestXhr = $http.get(url,{timeout : deferredAbort.promise})
            .success(function (info) {
              delete _currentRequests[type];
              //self.checkNoDataAvailable(info);

            }).
            error(function (data, status, headers, config) {
              generateError(status, data, config, headers);
              delete _currentRequests[type];
            });

          break;

        case "email-overview":

          _requestXhr = $http.get(url,{timeout : deferredAbort.promise})
            .success(function (info) {
              delete _currentRequests[type];
              //self.checkNoDataAvailable(info);

            }).
            error(function (data, status, headers, config) {
              generateError(status, data, config, headers);
              delete _currentRequests[type];
            });

              break

        default:

          _requestXhr = $http.get(url,{timeout : deferredAbort.promise})
            .success(function (info) {
              /*var _graphFilters = _.keys(info);
              FilterService.setChartData(info);
              FilterService.setGraphFilters(_graphFilters);*/
              delete _currentRequests[type];
               //self.checkNoDataAvailable(info);

            }).
            error(function (data, status, headers, config) {
              generateError(status, data, config, headers);
              delete _currentRequests[type];
            });

          break;

      }

      var promise = _requestXhr.then(
        function(response){
          return (response);
        },
        function(response){
          return ($q.reject("terminating request: "+type));
        }
      );

      promise.abort = function(){

        deferredAbort.resolve();

      }

      promise.finally(
        function() {

          console.info( "Cleaning up object references." );

          promise.abort = angular.noop;

          deferredAbort = _requestXhr = promise = null;

        }
      );

      _currentRequests[type] = {xhr: _requestXhr, url: url, canceller: deferredAbort};

      return( promise );

      //return _requestXhr;
    };

    this.checkNoDataAvailable = function (info) {
      var errorMsg;

      if (info.Promotion && info.Promotion.length < 1) {
        errorMsg = 'Promotion data is not available yet, please check back later.';
        $rootScope.$broadcast('RequestService:noPromo');
      } else if (info['Total'] === 0) {
        errorMsg = 'Sorry there is no data available, please revise your filters.';
      } else {
        return;
      }

      if (!$rootScope.errorDialog) {
        $rootScope.errorDialog = true;
        ngDialog.open({
          template: '' +
          '<h2 class="ng-dialog-error-message ng-dialog-error">' + errorMsg + '</h2>',
          plain: true
        });
      }

    }
  }]);
