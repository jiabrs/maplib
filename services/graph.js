altriaMap.service('GraphService', [
  '$rootScope',
  '$filter',
  '$state',
  'FilterService',
  'Utility',
  'BRANDS',
  'REPORT_SUITE',

  function ($rootScope, $filter, $state, FilterService, Utility, BRANDS, REPORT_SUITE) {

    var self = this,
      localData,
      scopeFunctions = {};

    this.setElement = function GSsetelement(element) {
      self.element = (element instanceof jQuery) ? element : jQuery(element);
    };

    this.setScope = function GSsetScope(scope) {
      scopeFunctions.openExpandedNotes = scope.openExpandedNotes;
      scopeFunctions.closeExpandedNotes = scope.closeExpandedNotes;
      scopeFunctions.moveIndicatorArrow = scope.moveIndicatorArrow;
    };

    this.getChartTitle = function () {
      switch ($state.params.report) {
        case REPORT_SUITE.UGC:
          if (FilterService.getCommunitySelectType() !== 'single-community') {
            return $filter('deslug')(FilterService.displayMultiCommunitySelect()).join("-");
          } else {
            return $filter('deslug')(FilterService.displaySingleCommunitySelect()).toString();
          }

          break;

        case REPORT_SUITE.PROMOTIONS:
          if($state.params.reportState == "single") {
            return FilterService.displaySelectedPromo().toString();
          } else if($state.params.reportState == "compare"){
            return "Compare";
          }
          break;
      }
    };

    this.getChartTimePeriod = function () {

      var copy = "";

      switch ($state.params.report) {

        case REPORT_SUITE.UGC:
          if (FilterService.getTimePeriodType() === "time-period") {
            copy += Utility.formatTimePeriod(FilterService.displayTimePeriod().value.toLowerCase()) + " by " + FilterService.displayDateSort().toUpperCase()
          } else {
            copy += $filter('date')(FilterService.displayTimePeriod()[0], "MM/dd/yyyy", 'UTC') +
            " - " +
            $filter('date')(FilterService.displayTimePeriod()[1], "MM/dd/yyyy", 'UTC') +
            " by " +
            FilterService.displayDateSort().toUpperCase()
          }

          return copy;

          break;

        case REPORT_SUITE.PROMOTIONS:
          if($state.params.reportState == "single"){
            copy += FilterService.displayPromoQtrTimePeriod().toUpperCase().replace(",", " to ") + " by " + FilterService.displayPromoDateSort().toUpperCase();
          } else if($state.params.reportState == "compare"){
            copy += $filter('deslug')(FilterService.displayPromoMultiSelect()).join("-");
          }

          return copy;

          break;
      }

    };

    this.getChartSubtitle = function(){
      return "";
    };

    this.getBrand = function () {
      return $rootScope.$stateParams.brand;
    };

    this.getColorProperty = function (propertyName) {
      return _.first(_.pluck(_.filter(BRANDS, {'className': self.getBrand()}), propertyName))
    };

    this.getReport = function () {
      return $rootScope.$stateParams.report.toUpperCase();
    };

    this.setData = function GSsetdata(info, graphType, elem, titleObj) {

      var primary = FilterService.displayPrimaryGraphFilter(),
        secondary = FilterService.displaySecondaryGraphFilter(),
        _info, dates, chartObj;

      switch (graphType) {
        case "overviewHighChart":
          if (info) {
            info = $.parseJSON(info)
            var dateFormat = 'MM/dd';
            dates = _.map(info['Date'], function (date) {
              var d = date;
              return $filter('date')(d, dateFormat, 'UTC');
            });

            chartObj = {
              barData: info.Entries,
              data: info,
              dates: dates
            };
          }

          break;

        case "overviewTable":

          var categories,
              actual = [],
              goal = [];

          if (info) {

            if(typeof info == "string") info = $.parseJSON(info);
            categories = info.keys || $.keys(info);

            if(info.keys) delete info.keys;

            for(var key in categories){
              actual.push(info[categories[key]]['actual']);
              goal.push(info[categories[key]]['goal'])
            }

            chartObj = {
              data: info,
              categories: categories,
              series: [{
                name:"Actual",
                data: actual
              },{
                name:"Goal",
                data: goal
              }]
            };
          }

          break;


        case "emailOverviewTable":

          var categories,
            val = [];

          if (info) {

            if(typeof info == "string") info = $.parseJSON(info);
          //  categories = info.keys || $.keys(info);
            categories = info.keys || $.keys(info);

            if(info.keys) delete info.keys;

            for(var key in categories){
              val.push(info[categories[key]]);
            }

            chartObj = {
              data: info,
              categories: categories,
              series: [{
                name:"",
                data: val
              }],
              legend: {
                enabled: false
              }
            };
          }

          break;

        case "overviewPieChart":
          if (info) {
            info = $.parseJSON(info)
            chartObj = {
              pieData: info
            };
          }

          break;


        case "overviewHorizontalBarChart":
          if (info) {
            info = $.parseJSON(info)
            chartObj = info;
          }

          break;


        case "promoHighChart":
          primary = FilterService.displayPromoPrimaryGraphFilter();
          secondary = FilterService.displayPromoSecondaryGraphFilter();

          _info = localData = (info) ? info.data : localData;

          if (!localData) {
            throw new Error("there's no data!");
          }

          if (FilterService.getPromoSelectType() === "single-promo") {

            var dateFormat = FilterService.getDateSort() === 'month' ? 'MM/dd' : 'MM/dd/yy';
            dates = _.map(_info['Date'], function (date) {
              var d = date;
              return $filter('date')(d, dateFormat, 'UTC');
            });

            chartObj = {
              barData: _info[primary],
              lineData: _info[secondary],
              data: _info,
              dates: dates,
              openExpandedNotes: _info.openExpandedNotes,
              moveIndicatorArrow: _info.moveIndicatorArrow
            };

          } else if (FilterService.getPromoSelectType() === "multi-promo") {

            var promoNames = [];

            for (var name in _info['Promotion']) {
              promoNames.push(name);
            }

            chartObj = {
              barData: self.getCommunitiesBy(_info['Promotion'], primary),
              lineData: self.getCommunitiesBy(_info['Promotion'], secondary),
              data: _info,
              dates: promoNames
            };

          }

          break;

        case "compareMultipleCommunities":

          primary = FilterService.displayPrimaryGraphFilter(),
            secondary = FilterService.displaySecondaryGraphFilter()

          _info = localData = (info) ? info.data : localData;

          var communityNames = [];

          for (var name in _info['Community']) {
            communityNames.push(name);
          }

          chartObj = {
            barData: self.getCommunitiesBy(_info['Community'], primary),
            lineData: self.getCommunitiesBy(_info['Community'], secondary),
            data: _info,
            dates: communityNames
          };

          break;

        default:

          primary = FilterService.displayPrimaryGraphFilter();
          secondary = FilterService.displaySecondaryGraphFilter();

          _info = localData = (info) ? info.data : localData;

          if (!localData) {
            throw new Error("there's no data!");
          }

          var dateFormat = FilterService.getDateSort() === 'month' ? 'MM/yy' : 'MM/dd/yy';
          dates = _.map(_info['Date'], function (date) {
            var d = date;
            return $filter('date')(d, dateFormat, 'UTC');
          });

          chartObj = {
            barData: _info[primary],
            lineData: _info[secondary],
            pointStart: _info['Date'][0],
            data: _info,
            dates: dates,
            openExpandedNotes: _info.openExpandedNotes,
            moveIndicatorArrow: _info.moveIndicatorArrow
          };

          break;

      }

      self.renderChart(chartObj, primary.toLowerCase(), secondary.toLowerCase(), graphType, elem, titleObj);

    };

    this.formatTableObj = function(tableData){

    }

    this.getCommunitiesBy = function (communityObj, val) {
      var arr = [];

      for (var i in communityObj) {
        arr.push(communityObj[i][val]);
      }
      return arr;
    };

    this.renderChart = function GSrenderchart(graph, primaryFilterType, secondaryFilterType, graphType, elem, titleObj) {

      var tickInterval,
        lineLabelType,
        barLabelType,
        percentLabel,
        valueLabel,
        pointInterval,
        toolTipDateFormat;

      var colors = {
        bar: "#000000",
        line: self.getColorProperty('lineColor'),
        pie: self.getColorProperty('pieColors')
      };

      var types = {};
      var _point = {};
      var renderChart = {};

      if (graph) {
        switch (graphType) {

          case "overviewTable":

            tickInterval = 1;
            lineLabelType = '{value}';

            renderChart = {
              chart: {
                events: {
                  load : Highcharts.drawTable,
                 // redraw: Highcharts.drawTable
                },
                borderWidth:0,
                reflow:true
              },
              title: {
                text: self.getBrand().toUpperCase() + " : " + self.getChartTitle().toUpperCase()
              },
              subtitle: {
                text: titleObj ? titleObj : null
              },
              xAxis: {
                categories: graph.categories,
                formatter: function () {
                  this.options.style.fontSize = '8px';

                  if (this.total >= 1000000) {
                    return $filter('number')(this.total / 1000000, 0) + "MM";
                  } else if (this.total >= 1000) {
                    return $filter('number')(this.total / 1000, 0) + "M";
                  } else {
                    return this.total;
                  }

                }
              },
              yAxis:{
                formatter: function () {
                  this.options.style.fontSize = '8px';

                  if (this.total >= 1000000) {
                    return $filter('number')(this.total / 1000000, 0) + "MM";
                  } else if (this.total >= 1000) {
                    return $filter('number')(this.total / 1000, 0) + "M";
                  } else {
                    return this.total;
                  }

                }
              },
              exporting:{
                sourceHeight: 240
              },
              series: graph.series,
              credits: {
                enabled: false
              }
            };

            elem.highcharts(renderChart);

            break;


          case "emailOverviewTable":

            tickInterval = 1;
            lineLabelType = '{value}';

            renderChart = {
              chart: {
                events: {
                  load : Highcharts.drawTable,
                //  redraw: Highcharts.drawTable
                },
                borderWidth:0,
                reflow:true
              },
              title: {
               // text: self.getBrand().toUpperCase() + " : " + self.getChartTitle().toUpperCase()
                text: 'table title'
              },
              subtitle: {
                text: titleObj ? titleObj : null
              },
              xAxis: {
                categories: graph.categories,

              },
              yAxis:{
                labels: {
                  enabled: false
                },
               // lineWidth:0,
                gridLineWidth: 0,
              },
              legend: {
                enabled: false
              },
              exporting:{
                sourceHeight: 240
              },
              series: graph.series,
              credits: {
                enabled: false
              }
            };

            elem.highcharts(renderChart);

            break;

          case "overviewHighChart":

            tickInterval = 1;
            lineLabelType = '{value}';

            renderChart = {
              series: [
                {
                  color: colors.bar,
                  data: graph.barData,
                  point: _point,
                  type: 'column'
                }
              ],
              chart: {
                type: 'column'
              },
              plotOptions: {
                column: {
                  stacking: 'normal',
                  pointPadding: 0,
                  groupPadding: .25,
                  dataLabels: {
                    enabled: false
                  }
                }
              },
              tooltip: {
                enabled: false
              },
              xAxis: {
                categories: graph.dates,
                labels: {
                  enabled: true
                }
              },
              yAxis: [
                { // bar display options
                  title: {
                    enabled: false
                  },
                  labels: {
                    format: '{value:,.0f}'
                  },
                  stackLabels: {
                    style: {
                      color: 'black'
                    },
                    enabled: true,
                    formatter: function () {
                      this.options.style.fontSize = '8px';

                      if (this.total >= 1000000) {
                        return $filter('number')(this.total / 100000, 0)/10 + "MM";
                      } else if (this.total >= 1000) {
                        return $filter('number')(this.total / 1000, 0) + "M";
                      } else {
                        return $filter('number')(this.total, 0);
                      }

                    }
                  }
                }
              ],
              title: {
                text: null,
                floating:true
              },
              subtitle: {
                text: 'Entries By Week'
              },
              legend: {
                enabled: false
              },
              exporting: {
                enabled: true,
                filename: self.getReport().toUpperCase() + "_"
                + self.getBrand().toUpperCase() + "_"
                + self.getChartTitle().toUpperCase() + "_"
                + self.getChartTimePeriod()
              },
              credits: {
                enabled: false
              }
            };

            elem.highcharts(renderChart);

            break;

          case "overviewPieChart":

            renderChart = {
              chart: {
                plotBackgroundColor: null,
                plotShadow: false,
                spacingTop: 0,
                margin: [25, 0, 0, 0]
              },
              colors: colors.pie,
              tooltip: {
                enabled: false
              },
              plotOptions: {
                pie: {
                  allowPointSelect: false,
                  dataLabels: {
                    enabled: true,
                    distance: -50,
                    //format: 'null',
                    formatter: function () {
                      if (this.percentage >= 0.5) {
                        return '<b>' + this.point.name + '</b><br>' + $filter('percentage')(this.percentage);
                      } else {
                        return '';
                      }
                    },
                    style: {
                      color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'white',
                      textAlign: 'center',
                      textTransform: 'capitalize'
                    },
                    inside: true
                  }
                },
                series: {
                  states: {
                    hover: {
                      enabled: false,
                    }
                  }
                }
              },
              series: [{
                type: 'pie',
                data: $.map(graph.pieData, function (value, key) {
                  return [[key, value]];
                })
              }],
              title: {
                text: null,//self.getBrand().toUpperCase() + " : " +self.getChartTitle().toUpperCase(),
                floating: false,
                y: 5
              },
              subtitle: {
                text: titleObj ? titleObj : null,
                floating: false,
                y: 15
              },
              legend: {
                enabled: false
              },
              //exporting: {
              //  enabled: true,
              //  filename: self.getReport().toUpperCase() + "_"
              //  + self.getBrand().toUpperCase() + "_"
              //  + self.getChartTitle().toUpperCase() + "_"
              //  + self.getChartTimePeriod()
              //},
              credits: {
                enabled: false
              },

            };

            elem.highcharts(renderChart);

            break;


          case  "overviewHorizontalBarChart":
            renderChart = {
              chart: {

                type: 'bar',

              },

              title:{
                text: 'Email Subject Lines',
                style:{
                  fontSize: 15
                },
                y: -10
              },
              //   colors: colors.pie,
              tooltip: {
                enabled: false
              },

              series: [
                {
                name: 'open rate',
                data: graph.openrate
              },{
                name: 'click open',
                data: graph.clickopen
              }],

              xAxis: {
                categories: graph.subject,
                title: {
                  text: null
                },
                labels: {
                  useHTML: true,
                  formatter: function () {
                    var text = this.value,
                      formatted = text.length > 10 ? text.substring(0, 10) + '...' : text;
                    if (titleObj == "mobile") {
                      return '<div class="js-ellipse" style="overflow:hidden" title="' + text + '">' + formatted + '</div>';
                      titleObj = null;
                    }
                    else {
                      return text;
                    }
                  },
                },
              },
              tickWidth:0,
              lineWidth:0,
              yAxis: {

                labels: {
                  formatter: function(){
                    return this.value * 100 + '%'
                  },
                //  step:1,
                  style:{
                    fontSize: '10px'
                  }
                },
                title:null,
                gridLineWidth: 0,
                tickWidth:1,
                lineWidth:1,
                max:1
              },
              legend: {
                verticalAlign: 'top',
                x: 0,
                y: 0,
              },
              exporting: {
                sourceWidth: 1000
              },
              credits: {
                enabled: false
              }
            };

            elem.highcharts(renderChart);
            break;

          case "promoHighChart":

            tickInterval = FilterService.getPromoDateSort() === 'day' ? 7 : 1;
            percentLabel = '{value}%';
            valueLabel = '{value:,f}';

            types = {
              '% tablet/mobile/sms/mms': percentLabel,
              'new to the atcd': valueLabel,
              'total entries': valueLabel,
              'date': valueLabel,
            };

            barLabelType = primaryFilterType.indexOf('%') != -1 ? percentLabel : valueLabel;
            lineLabelType = secondaryFilterType.indexOf('%') != -1 ? percentLabel : valueLabel;

            _point = {
              events: {
                click: function (e) {
                  scopeFunctions.openExpandedNotes(e);
                  scopeFunctions.moveIndicatorArrow(e);
                }
              }
            };

            renderChart = {
              series: [
                {
                  color: colors.bar,
                  data: graph.barData,
                  point: _point,
                  type: 'column',
                  name: primaryFilterType.toUpperCase()
                },
                {
                  color: colors.line,
                  data: graph.lineData,
                  type: 'line',
                  point: _point,
                  yAxis: 1,
                  name: secondaryFilterType.toUpperCase()
                }
              ],
              chart: {
                type: 'column',
                alignTicks: false
              },
              plotOptions: {
                column: {
                  stacking: 'normal',
                  dataLabels: {
                    enabled: true,
                    padding: 0,
                    useHTML: true,
                    align:"left",
                    verticalAlign:"bottom",
                    y:4,
                    style:{
                      width:'100%',
                      color:'red',
                      display: 'block',
                      'pointer-events': 'none'
                    },
                    formatter: function(){
                      var pointData = this;
                      var text = '';

                      scopeFunctions.openExpandedNotes({point:pointData}, true).then(function(info){
                        if(info)
                        {
                          $('.highcharts-data-labels span').eq(pointData.point.x).show().css("width",(parseInt($('.highcharts-series rect').attr("width"))-1) + "px");
                          $('.highcharts-data-labels text div.notes-container span.note-count').html(info)
                        }
                        else
                        {
                         $('.highcharts-data-labels span').eq(pointData.point.x).hide();
                        }
                      });

                    //  text += '<div class="highcharts-note-indicator">&nbsp;</div><div class="highcharts-note-indicator">&nbsp;</div><div class="highcharts-note-indicator">&nbsp;</div><div class="highcharts-note-indicator">&nbsp;</div>';
                      text += '<div class="highcharts-note-indicator">'+ ' '+'</div><div class="highcharts-note-indicator">'+ ' '+'</div><div class="highcharts-note-indicator">'+ ' '+'</div><div class="highcharts-note-indicator">'+ ' '+'</div>';

                      return text;
                    }
                  }
                },
                series: {
                  cursor: 'pointer'
                }
              },
              tooltip: {
                backgroundColor: 'rgba(255,255,255,.75)',
                borderColor: 'rgba(0,0,0,.25)',
                shadow: false,
                useHTML: true,
                formatter: function () {

                  scopeFunctions.openExpandedNotes({point:this}, true).then(function(info){
                    if(info)
                    {
                      $('.highcharts-tooltip div.notes-container').css('opacity', 1).show();
                      $('.highcharts-tooltip div.notes-container span.note-count').html(info);
                    }
                    else
                    {
                      $('.highcharts-tooltip div.notes-container').hide();
                    }
                  });

                  var text = '<span style="font-size:10px;">' + this.x + '</span><br/><b>';
                  if (this.series.name === primaryFilterType.toUpperCase()) {
                    text += barLabelType === percentLabel ? this.y + '%' : $filter('number')(this.y);
                  } else {
                    text += lineLabelType === percentLabel ? this.y + '%' : $filter('number')(this.y);
                  }
                  text += '</b>';
                  text += '<div class="notes-container" style="opacity: 0;"><span class="icon-notes"></span>&nbsp;<span class="note-count"></span>&nbsp;Notes&nbsp;</div>';

                  return text;
                }
              },
              xAxis: {
                categories: graph.dates,
                tickInterval: tickInterval
              },
              yAxis: [
                { // bar display options
                  /*labels: {
                    format: barLabelType
                  },*/
                  title: {
                    enabled: false
                  },
                  /*stackLabels: {
                    style: {
                      color: 'white',
                      display: 'block',
                      border: '2px solid #ccc'
                    },
                    enabled: true,
                    //useHTML: true,
                   formatter:function () {
                      var pointData = this;

                      scopeFunctions.openExpandedNotes({point:pointData}, true).then(function(info){
                        if(info)
                        {
                          $('.highcharts-stack-labels text').eq(pointData.x).show();
                          $('.highcharts-stack-labels text div.notes-container span.note-count').html(info);
                        }
                        else
                        {
                          $('.highcharts-stack-labels text').eq(pointData.x).hide();
                        }
                      });
                      var text = '';
                      text += '_____________<br/>_____________<br/>_____________<br/>_____________<br/>'//'<div style="width: 100%"> <hr/><hr/><hr/><hr/> </div>';

                      return text;
                    },
                    align:"left",
                    textAlign: "left",
                    x: 4,
                    y: 14,
                  },*/
                  min: 0, // only for % based options
                  max: barLabelType === percentLabel ? 100 : null,
                  ceiling: barLabelType === percentLabel ? 100 : null
                },
                { // line display options
                  linkedTo: lineLabelType === barLabelType ? 0 : null,
                  labels: {
                    format: lineLabelType
                  },
                  title: {
                    enabled: false
                  },
                  gridLineColor: 'transparent',
                  min: 0, // only for % based options
                  max: lineLabelType === percentLabel ? 100 : null,
                  ceiling: lineLabelType === percentLabel ? 100 : null,
                  opposite: true
                }
              ],
              title: {
                text: self.getBrand().toUpperCase() + " : " + self.getChartTitle().toUpperCase()
              },
              subtitle: {
                text: $state.params.reportState == "compare" ? "Promotions: " + $filter('deslug')(FilterService.displayPromoMultiSelect()).join("-") : "Time Period: " + self.getChartTimePeriod()
              },
              legend: {
                enabled: true
              },
              exporting: {
                enabled: true,
                filename: self.getReport().toUpperCase() + "_"
                + self.getBrand().toUpperCase() + "_"
                + self.getChartTitle().toUpperCase() + ($state.params.reportState != "compare" ? "_"
                + self.getChartTimePeriod() : "")
              },
              credits: {
                enabled: false
              }
            };
            //self.element.highcharts(renderChart);

            if (elem) {

              elem = elem.length > 1 ? elem : [elem];

              _.each(elem, function (v, k) {
                $(v).eq(0).highcharts(renderChart);
              });

              /*for(var i=0; i < elem.length; i++){
               elem[i].highcharts(renderChart);
               }*/

            }
            else
              self.element.highcharts(renderChart);
            break;

          default:

            var communitySelectType = FilterService.getCommunitySelectType();
            var xAxisType,
              labelFormat,
              categories;
            tickInterval = 1;

            if (communitySelectType == 'single-community') {
              xAxisType = 'datetime';
              categories = null;
              switch (FilterService.getDateSort()) {
                case 'day':
                  labelFormat = '{value: %m/%d/%Y}';
                  toolTipDateFormat = '%m/%d/%Y';
                  pointInterval = 24 * 3600 * 1000; // one day
                  break;
                case 'week':
                  labelFormat = '{value: %m/%d/%Y}';
                  toolTipDateFormat = '%m/%d/%Y';
                  pointInterval = 7 * 24 * 3600 * 1000; // one week
                  break;
                default:
                  labelFormat = '{value: %m/%Y}';
                  toolTipDateFormat = '%m/%Y';
                  pointInterval = null;//*29.6042 29.99999**/ 30.4375 * 24 * 3600 * 1000; // one month (average dates per month over a four year span)/**/
                  break;
              }
            } else if (communitySelectType == 'multi-community') {
              xAxisType = 'categories';
              categories = graph.dates;
            }

            percentLabel = '{value}%';
            valueLabel = '{value:,f}';
            types = {
              'photo approval rate': percentLabel,
              'comments submitted': valueLabel,
              'photos submitted': valueLabel,
              'likes': valueLabel,
              'comment approval rate': percentLabel,
              'average word count': valueLabel,
              'comments approved': valueLabel,
              'photos approved': valueLabel
            };

            barLabelType = types[primaryFilterType];
            lineLabelType = types[secondaryFilterType];

            var ceilingVal = lineLabelType == percentLabel ? 100 : null;

            _point = {
              events: {
                click: function (e) {
                  scopeFunctions.openExpandedNotes(e);
                  scopeFunctions.moveIndicatorArrow(e);
                }
              }
            };

            renderChart = {
              series: [
                {
                  color: colors.bar,
                  data: graph.barData,
                  point: _point,
                  type: 'column',
                  name: primaryFilterType.toUpperCase()
                },
                {
                  color: colors.line,
                  data: graph.lineData,
                  type: 'line',
                  point: _point,
                  yAxis: 1,
                  name: secondaryFilterType.toUpperCase()
                }
              ],
              chart: {
                type: 'line'
              },
              plotOptions: {
                series: {
                  /*pointStart: graph.pointStart,
                  pointInterval: pointInterval,*/
                  cursor: 'pointer'
                },

                column:{
                  stacking: 'normal',
                  dataLabels: {
                    enabled: true,
                    padding: 0,
                    useHTML: true,
                    align:"left",
                    verticalAlign:"bottom",
                    y:4,
                    style:{
                      width:'100%',
                      color:'red',
                      display: 'block',
                      'pointer-events': 'none'
                    },
                    formatter: function(){
                      var pointData = this;
                      var text = '';

                      scopeFunctions.openExpandedNotes({point:pointData}, true).then(function(info){
                        if(info)
                        {
                          $('.highcharts-data-labels span').eq(pointData.point.x).show().css("width",(parseInt($('.highcharts-series rect').attr("width"))-1) + "px");
                          $('.highcharts-data-labels text div.notes-container span.note-count').html(info)
                        }
                        else
                        {
                          $('.highcharts-data-labels span').eq(pointData.point.x).hide();
                        }
                      });

                      //text += '<div class="highcharts-note-indicator">&nbsp;</div><div class="highcharts-note-indicator">&nbsp;</div><div class="highcharts-note-indicator">&nbsp;</div><div class="highcharts-note-indicator">&nbsp;</div>';
                      text += '<div class="highcharts-note-indicator">'+ ' '+'</div><div class="highcharts-note-indicator">'+ ' '+'</div><div class="highcharts-note-indicator">'+ ' '+'</div><div class="highcharts-note-indicator">'+ ' '+'</div>';

                      return text;
                    }
                  }
                }
              },
              tooltip: {
                backgroundColor: 'rgba(255,255,255,.75)',
                borderColor: 'rgba(0,0,0,.25)',
                shadow: false,
                useHTML: true,
                formatter: function () {

                  scopeFunctions.openExpandedNotes({point:this}, true).then(function(info){
                    if(info)
                    {
                      $('.highcharts-tooltip div.notes-container').css("opacity",1).show();
                      $('.highcharts-tooltip div.notes-container span.note-count').html(info);
                    }
                    else
                    {
                      $('.highcharts-tooltip div.notes-container').hide();
                    }
                  });

                  var text = '<span style="font-size:10px;">';
                  /*if (FilterService.getDateSort() === 'day' || FilterService.getDateSort() === 'week') {
                    text += Highcharts.dateFormat(toolTipDateFormat, new Date(this.x)) + '</span><br/><b>';
                  } else if (FilterService.getDateSort() === 'month') {*/
                    text += graph.dates[this.point.index] + '</span><br/><b>';
                  //}

                  if (this.series.name === primaryFilterType.toUpperCase()) {
                    text += barLabelType === percentLabel ? this.y + '%' : $filter('number')(this.y);
                  } else {
                    text += lineLabelType === percentLabel ? this.y + '%' : $filter('number')(this.y);
                  }
                  text += '</b>';
                  text += '<div class="notes-container" style="opacity:0;"><span class="icon-notes"></span>&nbsp;<span class="note-count"></span>&nbsp;Notes&nbsp;</div>';

                  return text;

                  /*var text = '<span style="font-size:10px;">';
                  if (FilterService.getDateSort() === 'day' || FilterService.getDateSort() === 'week') {
                    text += Highcharts.dateFormat(toolTipDateFormat, new Date(this.x)) + '</span><br/><b>';
                  } else if (FilterService.getDateSort() === 'month') {
                    text += graph.dates[this.point.index] + '</span><br/><b>';
                  }

                  if (this.series.name === primaryFilterType.toUpperCase()) {
                    text += barLabelType === percentLabel ? this.y + '%' : $filter('number')(this.y);
                  } else {
                    text += lineLabelType === percentLabel ? this.y + '%' : $filter('number')(this.y);
                  }

                  return text += '</b>';*/
                }
              },
              xAxis: {
                type: xAxisType,
                categories: categories,
                labels: {
                  formatter: function(){
                    return categories ? this.value : graph.dates[this.value];
                  },
                  //format: labelFormat
                }
              },
              yAxis: [
                { // bar display options
                  labels: {
                    format: barLabelType
                  },
                  title: {
                    enabled: false
                  }
                },
                { // line display options
                  labels: {
                    format: lineLabelType
                  },
                  title: {
                    enabled: false
                  },
                  ceiling: ceilingVal, // only for % based options
                  max: ceilingVal,
                  alignTicks: false,
                  gridLineWidth: 0,
                  floor: 0, // only for % based options
                  opposite: true
                }
              ],
              title: {
                text: self.getBrand().toUpperCase() + " : " + self.getChartTitle().toUpperCase()
              },
              subtitle: {
                text: "Time Period: " + self.getChartTimePeriod()
              },
              legend: {
                enabled: true
              },
              exporting: {
                enabled: true,
                filename: self.getReport().toUpperCase() + "_"
                + self.getBrand().toUpperCase() + "_"
                + self.getChartTitle().toUpperCase() + "_"
                + self.getChartTimePeriod()
              },
              credits: {
                enabled: false
              }
            };

            self.element.highcharts(renderChart);

            break;

        }
      }

    };

  }]);

Highcharts.drawTable = function() {

  // user options
  var tableTop = 56,
    colWidth = ($(this.container).width()-20)/3,
    tableLeft = 0,
    rowHeight = 20,
    cellPadding = 2.5,
    valueDecimals = 0,
    valueSuffix = '';
  // internal variables
  var chart = this,
    series = chart.series,
    renderer = chart.renderer,
    cellLeft = tableLeft;

 // $(".table-elem").remove();

  renderer.rect(0, tableTop, $(this.container).width(), 240-tableTop)
    .attr({
      'stroke-width': 0,
      stroke: 'white',
      fill: 'white',
      class: "table-elem",
      zIndex: 10
    })
    .css({
      "z-index":10
    })
    .add();

  // draw category labels
  $.each(chart.xAxis[0].categories, function(i, name) {
    renderer.text(
      name,
      cellLeft + cellPadding,
      tableTop + (i + 2) * rowHeight - cellPadding
    )
      .css({
        fontWeight: 'bold',
        fontSize : ".875em",
        zIndex: 20
      })
      .attr({
        class: "table-elem",
        zIndex: 20
      })
      .add();
  });

  $.each(series, function(i, serie) {
    cellLeft += colWidth;

    // Apply the cell text
    if(serie.name && serie.name.indexOf('Series') === -1) {
    renderer.text(
      serie.name,
      cellLeft - cellPadding + colWidth,
      tableTop + rowHeight - cellPadding
    )
      .attr({
        align: 'right',
        class: "table-elem",
        zIndex: 20
      })
      .css({
        fontWeight: 'bold',
        fontSize : ".875em",
        zIndex: 20
      })
      .add();
    }

    $.each(serie.data, function(row, point) {

      // Apply the cell text
      valueSuffix = point.y >= 1000000 ? " MM" : point.y >= 1000 ? " M" : "";
      valueDecimals = point.y >= 1000000 ? 1:0;
      var a=Highcharts.numberFormat(Math.round(point.y/100000)/10);
      renderer.text(
        (point.y || point.y === 0) ? (Highcharts.numberFormat((point.y >= 1000000 ? Math.round(point.y/100000)/10 : point.y >= 1000 ? Math.round(point.y/1000) : point.y) , valueDecimals))+ valueSuffix: "--"  ,
        cellLeft + colWidth - cellPadding,
        tableTop + (row + 2) * rowHeight - cellPadding
      )
        .attr({
          align: 'right',
          class: "table-elem",
          zIndex: 20
        })
        .css({
          fontSize : ".875em",
          zIndex: 20
        })
        .add();

      // horizontal lines
     /* if (row == 0) {
        Highcharts.tableLine( // top
          renderer,
          tableLeft,
          tableTop + cellPadding,
          cellLeft + colWidth,
          tableTop + cellPadding
        );
        Highcharts.tableLine( // bottom
          renderer,
          tableLeft,
          tableTop + (serie.data.length + 1) * rowHeight + cellPadding,
          cellLeft + colWidth,
          tableTop + (serie.data.length + 1) * rowHeight + cellPadding
        );
      }
      // horizontal line
      Highcharts.tableLine(
        renderer,
        tableLeft,
        tableTop + row * rowHeight + rowHeight + cellPadding,
        cellLeft + colWidth,
        tableTop + row * rowHeight + rowHeight + cellPadding
      );*/

    });

    // vertical lines
    /*if (i == 0) { // left table border
      Highcharts.tableLine(
        renderer,
        tableLeft,
        tableTop + cellPadding,
        tableLeft,
        tableTop + (serie.data.length + 1) * rowHeight + cellPadding
      );
    }

    Highcharts.tableLine(
      renderer,
      cellLeft,
      tableTop + cellPadding,
      cellLeft,
      tableTop + (serie.data.length + 1) * rowHeight + cellPadding
    );

    if (i == series.length - 1) { // right table border

      Highcharts.tableLine(
        renderer,
        cellLeft + colWidth,
        tableTop + cellPadding,
        cellLeft + colWidth,
        tableTop + (serie.data.length + 1) * rowHeight + cellPadding
      );
    }*/

  });
};

/**
 * Draw a single line in the table
 */
Highcharts.tableLine = function (renderer, x1, y1, x2, y2) {
  renderer.path(['M', x1, y1, 'L', x2, y2])
    .attr({
      'stroke': 'silver',
      'stroke-width': 1,
      class: "table-elem"
    })
    .add();
}
