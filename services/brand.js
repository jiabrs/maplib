altriaMap.service('BrandService', ['BRANDS',
  function(BRANDS) {

    var brandService = this;
    brandService.brands = BRANDS;
    brandService.availableBrands = _.chain(BRANDS).filter('available').pluck('className');

    this.returnBrands = function() {
      return brandService.brands;
    };

    this.returnAvailableBrands = function() {
      return brandService.availableBrands;
    };

    this.getActiveBrands = function(brand) {
      brandService.activeBrands = sessionStorage.getItem('brands').split(',');
      return brandService.activeBrands.indexOf(brand) > -1 && brandService.availableBrands.indexOf(brand) > -1;
    };

    return brandService;
}]);
