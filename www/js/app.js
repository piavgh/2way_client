
angular.module('starter', ['ionic', 'ui.router', 'jrCrop', 'ngMap', 'globaltpl', 'starter.controllers', 'starter.services', 'google.places', 'ngCordova'])

.run(function($ionicPlatform, $rootScope, $cordovaNetwork, $cordovaDevice, GlobalTpl, $state, $ionicPopup) {
	
	$rootScope.config ={
		url: 'http://hmac.nhahang.bz/v1',
	};
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
	if($cordovaNetwork.getNetwork() === 0 || $cordovaNetwork.getNetwork() === 'unknown' || $cordovaNetwork.getNetwork() === 'none') {
		$ionicPopup.alert({
		  title: 'Lỗi kết nối !',
		  content: '<div class="only-text">Vui lòng bật Wifi hoặc 3G để sử dụng ứng dụng</div>'
		}).then(function(result) {
			navigator.app.exitApp();
		});
	}else{
	
	if(window.localStorage['deviceID'] === undefined){
      // Get UUID device
		window.localStorage['deviceID'] = $cordovaDevice.getUUID();
	}
		
	if(window.localStorage['register'] === "true"){
		var options = {
			showLoad : true,
			method: 'get',
			url: $rootScope.config.url + "/clients/" 
				+ window.localStorage['clientId'] + "/requests?page=1&type=undone"
		};

		GlobalTpl.request(options, function (response) {
			if (response.data && response.data.length > 0) {
				$state.go('tab.running');
			}else{
				$state.go('tab.main');
			}
		}, function (){
		});
	}else{
		$state.go('active');
	}
	};
	
  });
})

.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: "/tab",
    abstract: true,
    templateUrl: "templates/tabs.html",
	controller: "TabCtrl"
  })

  // Each tab has its own nav history stack:
	.state('active',{
		url: '/active',	
		templateUrl: 'templates/active.html',
		controller: 'ActiveCtrl'
		
	})
  
  .state('tab.main', {
    url: '/main',
    views: {
      'menuContent': {
        templateUrl: 'templates/main.html',
        controller: 'MainCtrl'
      }
    }
  })
  
  .state('tab.screen2', {
    url: '/screen2',
    views: {
      'menuContent': {
        templateUrl: 'templates/screen2.html',
        controller: 'Screen2Ctrl'
      }
    }
  })
  
  .state('tab.screen3', {
    url: '/screen3',
    views: {
      'menuContent': {
        templateUrl: 'templates/screen3.html',
        controller: 'Screen3Ctrl'
      }
    }
  })
  
  .state('tab.screen4', {
    url: '/screen4',
    views: {
      'menuContent': {
        templateUrl: 'templates/screen4.html',
        controller: 'Screen4Ctrl'
      }
    }
  })
  
  .state('tab.screen5', {
    url: '/screen5',
    views: {
      'menuContent': {
        templateUrl: 'templates/screen5.html',
        controller: 'Screen5Ctrl'
      }
    }
  })
  
  .state('tab.profile', {
    url: '/profile',
    views: {
      'menuContent': {
        templateUrl: 'templates/profile.html',
        controller: 'ProfileCtrl'
      }
    }
  })
  
  .state('tab.profileEdit', {
    url: '/profileEdit',
    views: {
      'menuContent': {
        templateUrl: 'templates/profileEdit.html',
        controller: 'ProfileEditCtrl'
      }
    }
  })
  
  .state('tab.about', {
    url: '/about',
    views: {
      'menuContent': {
        templateUrl: 'templates/about.html',
        controller: 'AboutCtrl'
      }
    }
  })  
  
	.state('tab.holderDetails', {
    url: '/holder/:id',
    views: {
      'menuContent': {
        templateUrl: 'templates/holderDetails.html',
        controller: 'HolderDetailsCtrl'
      }
    }
  })
  
  .state('tab.cancelDetails', {
    url: '/cancel/:id',
    views: {
      'menuContent': {
        templateUrl: 'templates/cancelDetails.html',
        controller: 'CancelDetailsCtrl'
      }
    }
  })
  
	.state('tab.driverDetails', {
    url: '/driverDetails/:id',
    views: {
      'menuContent': {
        templateUrl: 'templates/driverDetails.html',
        controller: 'DriverDetailsCtrl'
      }
    }
  })  
  
	.state('tab.running', {
    url: '/running',
    views: {
      'menuContent': {
        templateUrl: 'templates/running.html',
        controller: 'RunningCtrl'
      }
    }
  })
  
	.state('tab.runningDetails', {
    url: '/running/:id',
    views: {
      'menuContent': {
        templateUrl: 'templates/runningDetails.html',
        controller: 'RunningDetailsCtrl'
      }
    }
  })  

    .state('tab.history', {
    url: '/history',
    views: {
      'menuContent': {
        templateUrl: 'templates/history.html',
        controller: 'HistoryCtrl'
      }
    }
  })  
  
    .state('tab.historyDetails', {
    url: '/historyDetails/:id',
    views: {
      'menuContent': {
        templateUrl: 'templates/historyDetails.html',
        controller: 'HistoryDetailsCtrl'
      }
    }
  })
  

  // if none of the above states are matched, use this as the fallback
  //$urlRouterProvider.otherwise('/active');

});
