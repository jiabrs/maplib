altriaMap.controller('MainMenuController', [
    '$scope'
  , '$rootScope'
  , 'BrandService'
  , 'ReportService'
  , function (
      $scope
    , $rootScope
    , BrandService
    , ReportService) {

    var mainMenu = this;

    mainMenu.brands = BrandService.returnBrands();
    mainMenu.reportOrder = ReportService.reportOrder(mainMenu.brands);

    $rootScope.layoutClass = "main-menu";

    this.showReportMenu = function(elClass) {
      // TODO: rewrite without jQuery
      $('.show-report-menu').removeClass('show-report-menu');
      var clickedEl = $('.' + elClass);
      clickedEl.addClass("show-report-menu");
    };

    this.isBrandActive = function(brand) {
      return BrandService.getActiveBrands(brand);
    };

    $scope.MainMenuController = this;
    return $scope.MainMenuController;

}]);
