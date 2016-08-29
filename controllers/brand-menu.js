altriaMap.controller('BrandMenuController', [
    '$scope'
  , '$rootScope'
  , 'BrandService'
  , 'ReportService'
  , function (
      $scope
    , $rootScope
    , BrandService
    , ReportService) {

    var brandMenu = this;

    brandMenu.brands = BrandService.returnBrands();
    brandMenu.reportOrder = ReportService.reportOrder(brandMenu.brands);

    $rootScope.layoutClass = "brand-menu";

    this.isReportActive = function(brand, report) {
      return ReportService.getActiveReports(brand, report);
    };

    $scope.BrandMenuController = this;
    return $scope.BrandMenuController;

}]);
