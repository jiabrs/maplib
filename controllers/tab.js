altriaMap.controller('TabController', ['$scope', '$rootScope', '$stateParams',
	function ($scope, $rootScope, $stateParams) {

		this.tabList = [];

		$scope.disableTabs = false;

    this.tabList["email"]= {};

    this.tabList["email"]["single"] = [
      {
        title: "overview",
        tmpl: "_res/views/" + $stateParams.report + "/_overviewTab.html"
      },
      //{
      //  title: "graph",
      //  tmpl: "_res/views/" + $stateParams.report + "/_graphTab.html"
      //},
      //{
      //  title: "table",
      //  tmpl: "_res/views/" + $stateParams.report + "/_tableTab.html"
      //},
      {
        title: "notes",
        tmpl: "_res/views/" + $stateParams.report + "/_notesTab.html"
      }
    ];

    this.tabList["email"]["compare"] = [
      {
        title: "graph",
        tmpl: "_res/views/" + $stateParams.report + "/_graphTab.html"
      },
      {
        title: "table",
        tmpl: "_res/views/" + $stateParams.report + "/_tableTab.html"
      },
      {
        title: "notes",
        tmpl: "_res/views/" + $stateParams.report + "/_notesTab.html"
      }
    ];

		this.tabList["promotions"]= {};

		this.tabList["promotions"]["single"] = [
			{
				title: "overview",
				tmpl: "_res/views/" + $stateParams.report + "/_overviewTab.html"
			},
			{
				title: "graph",
				tmpl: "_res/views/" + $stateParams.report + "/_graphTab.html"
			},
			{
				title: "table",
				tmpl: "_res/views/" + $stateParams.report + "/_tableTab.html"
			},
			{
				title: "notes",
				tmpl: "_res/views/" + $stateParams.report + "/_notesTab.html"
			}
		];

		this.tabList["promotions"]["compare"] = [
			{
				title: "graph",
				tmpl: "_res/views/" + $stateParams.report + "/_graphTab.html"
			},
			{
				title: "table",
				tmpl: "_res/views/" + $stateParams.report + "/_tableTab.html"
			},
			{
				title: "notes",
				tmpl: "_res/views/" + $stateParams.report + "/_notesTab.html"
			}
		];


		this.tabList["ugc"]={};
		this.tabList["ugc"]["reporting"] = [
			{
				title: "graph",
				tmpl: "_res/views/" + $stateParams.report + "/_graphTab.html"
                    },
			{
				title: "table",
				tmpl: "_res/views/" + $stateParams.report + "/_tableTab.html"
                    },
			{
				title: "notes",
				tmpl: "_res/views/" + $stateParams.report + "/_notesTab.html"
                    }
    	];

		$rootScope.$on('RequestService:noPromo', function() {
			$scope.disableTabs = true;
		});

		$scope.activeTab = this.tabList[$stateParams.report][$stateParams.reportState][0].tmpl;
		//console.log("Current Tab: " + this.tabList[$stateParams.report][0].tmpl);

		this.onTabClick = function (tab) {
			$scope.activeTab = tab.tmpl;
		};

		this.isActiveTab = function (tabTmpl) {
			return tabTmpl === $scope.activeTab;
		};

		$scope.TabController = this;
		return $scope.TabController;

	}
]);
