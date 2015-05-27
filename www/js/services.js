angular.module('starter.services', [])



.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    nameDriver: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png',
	src: '1.png'
  }, {
    id: 1,
    nameDriver: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460',
	src: '1.png'
	
  }, {
    id: 2,
    nameDriver: 'Andrew Jostlin',
    lastText: 'Did you get the ice cream?',
    face: 'https://pbs.twimg.com/profile_images/491274378181488640/Tti0fFVJ.jpeg',
	src: '2.png'
  }, {
    id: 3,
    nameDriver: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg',
	src: '3.png'
  }, {
    id: 4,
    nameDriver: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'https://pbs.twimg.com/profile_images/491995398135767040/ie2Z_V6e.jpeg',
	src: '5.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  }
})

/**
 * A simple example service that returns some data.
 */
.factory('History', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var history = [{
		description : "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ",
		nameDriver : "Nguyễn Văn A",
		time : "10:00 am, 12/3/2015",
		cost : "10.000 đồng",
		status : 1,
		id: 0,
		src: '5.png',
		successRate: '84%'
	},{
		description : "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ",
		nameDriver : "Nguyễn Văn B",
		time : "10:00 am, 12/3/2015",
		cost : "20.000 đồng",
		status : 2,
		id: 1,
		src: '4.png',
		successRate: '80%'
	},{
		description : "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ",
		nameDriver : "Nguyễn Văn B",
		time : "10:00 am, 15/3/2015",
		cost : "100.000 đồng",
		status : 2,
		id: 2,
		src: '3.png',
		successRate: '70%'
	},{
		description : "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ",
		nameDriver : "Nguyễn Văn A",
		time : "10:00 am, 12/3/2015",
		cost : "10.000 đồng",
		status : 0,
		id: 3,
		src: '3.png',
		successRate: '84%'
	},{
		description : "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ",
		nameDriver : "Nguyễn Văn B",
		time : "10:00 am, 12/3/2015",
		cost : "20.000 đồng",
		status : 3,
		id: 4,
		src: '2.png',
		successRate: '80%'
		
	},{
		description : "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ",
		nameDriver : "Nguyễn Văn B",
		time : "10:00 am, 15/3/2015",
		cost : "100.000 đồng",
		status : 3,
		id: 5,
		src: '3.png',
		successRate: '70%'
	},{
		description : "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ",
		nameDriver : "Nguyễn Văn B",
		time : "10:00 am, 12/3/2015",
		cost : "100.000 đồng",
		status : 4,
		id: 6,
	}];
var receives = [];
	angular.forEach(history, function(item){
		if(item.status === 3 || item.status === 2){
			receives.push(item);
		}
		return;
	});
var holder = [];
	angular.forEach(history, function(item){
		if(item.status === 3){
			holder.push(item);
		}
		return;
	});
var run = [];
	angular.forEach(history, function(item){
		if(item.status === 2){
			run.push(item);
		}
		return;
	});
var success = [];
	angular.forEach(history, function(item){
		if(item.status === 0){
			success.push(item);
		}
		return;
	});
var fail = [];
	angular.forEach(history, function(item){
		if(item.status === 1){
			fail.push(item);
		}
		return;
	});
var cancel = [];
	angular.forEach(history, function(item){
		if(item.status === 4){
			cancel.push(item);
		}
		return;
	});
	
	
	
	
  return {
    all: function() {
      return history;
    },
	receive: function(){
		
		return receives;
	},
	holder: function(){
		
		return holder;
	},
	run: function(){
		
		return run;
	},
	success: function(){
		
		return success;
	},
	fail: function(){
		
		return fail;
	},
	cancel: function(){
		
		return cancel;
	},
    get: function(idx) {
      // Simple index lookup
      return history[idx];
    }
  }
})
.directive('fundooRating', function () {
    return {
      restrict: 'A',
      template: '<ul class="rating">' +
                  '<li ng-repeat="star in stars" ng-class="star" ng-click="toggle($index)">' +
                    '\u2605' +
                  '</li>' +
                '</ul>',
      scope: {
        ratingValue: '=',
        max: '=',
        readonly: '@',
        onRatingSelected: '&'
      },
      link: function (scope, elem, attrs) {

        var updateStars = function() {
          scope.stars = [];
          for (var  i = 0; i < scope.max; i++) {
            scope.stars.push({filled: i < scope.ratingValue});
          }
        };

        scope.toggle = function(index) {
          if (scope.readonly && scope.readonly === 'true') {
            return;
          }
          scope.ratingValue = index + 1;
          scope.onRatingSelected({rating: index + 1});
        };

        scope.$watch('ratingValue', function(oldVal, newVal) {
          if (newVal) {
            updateStars();
          }
        });
      }
    }
  });
