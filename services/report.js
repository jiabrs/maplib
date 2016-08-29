altriaMap.service('ReportService', ['BRANDS',
  function(BRANDS) {

    var reportService = this;
    reportService.brands = BRANDS;

    this.reportOrder = function(brands) {
      var reportOrder = [];
      _.each(brands[0].reports, function(value, key) {
        reportOrder.push(key);
      });
      return reportOrder;
    };

    this.getActiveReports = function(brand, report) {
      var currentBrandData, currentBrandReports, currentReport;
      currentBrandData = _.find(reportService.brands, { 'className' : brand});
      currentBrandReports = _.pick(currentBrandData, 'reports');
      currentReport = _.pluck(currentBrandReports, report);
      return _.first(currentReport);
    };

    return reportService;

}]);
