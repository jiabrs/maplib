altriaMap.controller('DropdownMenuController', ['$scope', 'UserService', 'BrandService', 'ReportService',
  function ($scope, UserService, BrandService, ReportService) {

    var dropdownMenu = this;
    dropdownMenu.brands = BrandService.returnBrands();
    dropdownMenu.reportOrder = ReportService.reportOrder(dropdownMenu.brands);

    this.isBrandActive = function(brand) {
      return BrandService.getActiveBrands(brand);
    };

    this.isReportActive = function(brand, report) {
      return ReportService.getActiveReports(brand, report);
    };

    $scope.DropdownMenuController = this;
    return $scope.DropdownMenuController;
  }]);
