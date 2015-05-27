angular.module('starter.controllers', [])
// .config(function($ionicConfigProvider) {
    // if(!ionic.Platform.isIOS())$ionicConfigProvider.scrolling.jsScrolling(false);
// })

    .controller('TabCtrl', function ($scope, $state, $ionicPlatform, $ionicPopup, GlobalTpl, $rootScope, $location) {
        $scope.settings = [{
            href: '#/tab/profile',
            title: 'Hồ sơ cá nhân',
            icon: 'ion-compose'
        }, {
            href: '#/tab/screen2',
            title: 'Tạo đơn gửi hàng',
            icon: 'ion-document'
        }, {
            href: '#/tab/running',
            title: 'Giao dịch đang diễn ra',
            icon: 'ion-paper-airplane'
        }, {
            href: '#/tab/history',
            title: 'Quản lí giao dịch',
            icon: 'ion-filing'
        }];


        $scope.exitApp = function () {
            $ionicPopup.show({
                title: 'Thông báo',
                template: '<div class="text-center">Ứng dụng sẽ bị xóa hoàn toàn dữ liệu!<br/> Bạn thực sự muốn đăng xuất?</div>',
                buttons: [
                    {
                        text: 'Thoát',
                        type: 'button-positive',
                        onTap: function (e) {
                            navigator.app.exitApp();
                            window.localStorage['register'] = "false";
                            window.localStorage['deviceID'] = undefined;
                        }
                    },
                    // {
                    // text: 'Đăng xuất',
                    // type: 'button-positive',
                    // onTap: function(e) {
                    // $state.go('tab.main');
                    // }
                    // },
                    {
                        text: 'Hủy',
                        type: 'button-positive',

                    }
                ]
            });
        }


    })

    .controller('ActiveCtrl', function ($scope, $ionicPopup, $state, GlobalTpl, $rootScope, $http, $cordovaDevice, $cordovaNetwork, $ionicPlatform) {

        $scope.deviceID = window.localStorage['deviceID'];

        $scope.active = {
            phone: '',
            verify: ''
        };

        function validForm() {
            if (!$scope.active.phone || typeof $scope.active.phone === 'undefined') {
                return false;
            }
            return true;
        }

        $scope.next = function () {

            if (!validForm()) {
                $scope.formWarning = "Vui lòng nhập đúng số điện thoại";
            }
            else {
                $scope.formWarning = "";
                $scope.data = {
                    phone: '84' + $scope.active.phone,
                    deviceId: $scope.deviceID

                }
                var data = JSON.stringify($scope.data);
                var options = {
                    showLoad: true,
                    method: 'post',
                    url: $rootScope.config.url + '/clients/register',
                    data: data,
                    headers: {
                        'Content-Type': undefined
                    },
                    timeout: 15000,
                };
                GlobalTpl.showLoading();
                $http(options).success(function (response) {
                    GlobalTpl.hideLoading();

                    $ionicPopup.show({
                        templateUrl: 'templates/popup_active.html',
                        title: 'Nhập mã xác thực',
                        scope: $scope,
                        buttons: [
                            {text: 'Hủy'},
                            {
                                text: '<b>Gửi</b>',
                                type: 'button-positive',
                                onTap: function (e) {
                                    var data = {
                                        phone: '84' + $scope.active.phone,
                                        verifyToken: ($scope.active.verify < 1000000) ? ('0' + $scope.active.verify) : $scope.active.verify
                                    }
                                    var options1 = {
                                        showLoad: true,
                                        method: 'post',
                                        url: $rootScope.config.url + '/clients/verify',
                                        data: JSON.stringify(data),
                                        headers: {
                                            'Content-Type': undefined
                                        },
                                        timeout: 15000,
                                    };
                                    GlobalTpl.showLoading();
                                    $http(options1)
                                        .success(function (response) {
                                            GlobalTpl.hideLoading();
                                            GlobalTpl.showAlert({template: "Xác thực thành công"});
                                            window.localStorage['register'] = true;
                                            window.localStorage['clientId'] = response.data.clientId;
                                            $state.go('tab.main');
                                        })
                                        .error(function (response) {
                                            GlobalTpl.hideLoading();
                                            GlobalTpl.showAlert({template: response.moreInfo});
                                        }).finally({});
                                }
                            }
                        ]
                    });

                }).error(function (response) {
                    GlobalTpl.hideLoading();
                    GlobalTpl.showAlert({template: response.moreInfo});
                }).finally(function () {
                });
            }
        }

    })

    .controller('AboutCtrl', function ($scope) {
        $scope.version = "0.11";
        $scope.date = "20150523";
    })

    .controller('MainCtrl', function ($scope, GlobalTpl, $rootScope, $state, $cordovaGeolocation, $ionicPopup) {

        $scope.requests = [];
        $scope.doRefresh = function () {
            $scope.requests = [];
            LoadMainRequest();
        }
        function LoadMainRequest() {
            $scope.$on('mapInitialized', function (event, map) {
                $cordovaGeolocation.getCurrentPosition({timeout: 100000, enableHighAccuracy: false})
                    .then(function (position) {
                        var mainMap = map;
                        var lat = position.coords.latitude;
                        var lng = position.coords.longitude;
                        $scope.center = {
                            lat: lat,
                            lng: lng
                        };
                        var options = {
                            method: 'get',
                            url: $rootScope.config.url + "/drivers_around?clientLat=" + lat + "&clientLng=" + lng + "&radius= 10000"
                        }
                        var latLng = new google.maps.LatLng(lat, lng);

                        var Marker = new google.maps.Marker({
                            position: latLng,
                            map: mainMap,
                            icon: 'img/user_marker_green.png'
                        });

                        GlobalTpl.request(options, function (response) {
                            // Check there is existing data to load

                            if (response.data && response.data !== null) {

                                for (var i in response.data) {
                                    var req = response.data[i];

                                    $scope.requests.push({
                                        fullName: req.fullName,
                                        time: req.createdAt,
                                        rating: Math.floor(req.rating),
                                        lat: req.currentLat,
                                        lng: req.currentLng,
                                        vehicleStatus: req.vehicleStatus
                                    });
                                    var Marker = new google.maps.Marker({
                                        position: new google.maps.LatLng(req.currentLat, req.currentLng),
                                        map: mainMap,
                                        icon: 'img/taxi_marker.png'
                                    });

                                    // infowindow.setContent("hello");
                                    // infowindow.open(mainMap, marker);

                                    // var htmlString = '';
                                    // htmlString += '<div class="to"><div class="left"><span class="green-text">Tài xế: </span><br>' + '</br>'
                                    // + '<span class="green-text">Biển số: </span><br>' + '</div>'
                                    // + '<div class="right"><a href="tel:' + '"><img src="./img/phone_icon.png"></a></div></div>';
                                    // var infowindow = new google.maps.InfoWindow({
                                    // content: htmlString
                                    // });
                                    // infowindow.open(mainMap, Marker);
                                }
                            }
                        }, function () {
                            // Stop the ion-refresher from spinning
                            $scope.$broadcast('scroll.refreshComplete');
                        });
                    }, function (err) {
                        $ionicPopup.show({
                            title: 'Thông báo',
                            template: '<div class="text-center">Vui lòng bật GPS. Ứng dụng sẽ tự động thoát</div>',
                            buttons: [{
                                text: 'Đóng',
                                type: 'button-positive',
                                onTap: function (e) {
                                    navigator.app.exitApp();
                                }
                            }]
                        });
                    });
            });
        };
        LoadMainRequest();
    })

    .controller('Screen2Ctrl', function ($scope, $rootScope, $state, $cordovaDatePicker, $filter) {


        $scope.send = {
            address: '',
            date: '',
            time: '',
            description: '',
            feature: ''
        };
        // $scope.sendAddressArray = [];
        // function clearSend() {
        // $scope.sendAddress= "";
        // }

        // $scope.options1 = {
        // country: 'vn',
        // };
        // $scope.details1 = '';
        // $scope.details2 = '';


        // $scope.addSend = function(id){
        // if(id != ""){
        // $scope.sendAddressArray.push(id);
        // }
        // console.log($scope.sendAddressArray);
        // clearSend();
        // }
        // $scope.deleteSend = function(){
        // $scope.sendAddressArray.length=0;
        // }
        // $scope.delete1Send= function(idx){
        // $scope.sendAddressArray.splice(idx, 1);
        // }
        // $scope.getEmptySend = function(){
        // if($scope.sendAddressArray.length != 0){
        // return true;
        // }
        // return false;
        // }
        // $scope.get2Send = function(){
        // if($scope.sendAddressArray.length > 1)
        // return true;
        // return false;

        // }

        $scope.receive = {
            address: '',
            date: '',
            time: '',
            description: '',
            feature: ''
        };
        // $scope.receiveAddressArray = [];

        // function clearReceive() {
        // $scope.receiveAddress= "";
        // }

        // $scope.addReceive = function(id){
        // if(id != ""){
        // $scope.receiveAddressArray.push(id);
        // }
        // console.log($scope.receiveAddressArray);
        // $scope.receiveAddress= "";
        // }
        // $scope.deleteReceive = function(){
        // $scope.receiveAddressArray.length = 0;
        // }
        // $scope.delete1Receive= function(idx){
        // $scope.receiveAddressArray.splice(idx, 1);
        // }
        // $scope.getEmptyReceive= function(){
        // if($scope.receiveAddressArray.length != 0){
        // return true;
        // }
        // return false;
        // }
        // $scope.get2Receive = function(){
        // if($scope.receiveAddressArray.length > 1)
        // return true;
        // return false;

        // }

        $scope.btSend = [{
            img: 'img/ngohep.png',
            name: 'a',
            state: false
        }, {
            img: 'img/duongmotchieu.png',
            name: 'b',
            state: false
        }, {
            img: 'img/camquaydau.png',
            name: 'c',
            state: false
        }, {
            img: 'img/camxetai.png',
            name: 'd',
            state: false
        }, {
            img: 'img/dangxaydung.png',
            name: 'e',
            state: false
        }];

        $scope.btReceive = [{
            img: 'img/ngohep.png',
            name: 'a',
            state: false
        }, {
            img: 'img/duongmotchieu.png',
            name: 'b',
            state: false
        }, {
            img: 'img/camquaydau.png',
            name: 'c',
            state: false
        }, {
            img: 'img/camxetai.png',
            name: 'd',
            state: false
        }, {
            img: 'img/dangxaydung.png',
            name: 'e',
            state: false
        }];

        $scope.toggle = function () {
            this.b.state = !this.b.state;
        };

        function clearData() {
            $scope.send = {
                address: '',
                date: '',
                time: '',
                description: '',
                feature: ''
            };
            $scope.receive = {
                address: '',
                date: '',
                time: '',
                description: '',
                feature: ''
            };
        }


        $scope.sendDate = function () {
            $cordovaDatePicker.show({
                date: new Date(),
                mode: 'date'
            }).then(function (date) {
                $scope.send.date = $filter('date')(date, 'yyyy-MM-dd');
                $scope.$apply();

            });
        };

        $scope.sendTime = function () {
            $cordovaDatePicker.show({
                date: new Date(),
                mode: 'time'
            }).then(function (date) {
                $scope.send.time = $filter('date')(date, 'HH:mm');
                $scope.$apply();
            });
        };


        $scope.receiveDate = function () {
            $cordovaDatePicker.show({
                date: new Date(),
                mode: 'date'
            }).then(function (date) {
                $scope.receive.date = $filter('date')(date, 'yyyy-MM-dd');
                $scope.$apply();
            });
        };

        $scope.receiveTime = function () {
            $cordovaDatePicker.show({
                date: new Date(),
                mode: 'time'
            }).then(function (date) {
                $scope.receive.time = $filter('date')(date, 'HH:mm');
                $scope.$apply();
            });
        };


        var requiredFields = ["address", "date", "time"];

        function validateForm() {

            for (index in requiredFields) {
                if (!$scope.send[requiredFields[index]] || !$scope.receive[requiredFields[index]]) {
                    return false;
                }
            }
            return true;
        }

        $scope.formWarning = '';

        $scope.next = function () {
            angular.forEach($scope.btSend, function (item) {
                if (item.state === true) {
                    $scope.send.feature += item.name;
                }
                return;
            });
            angular.forEach($scope.btReceive, function (item) {
                if (item.state === true) {
                    $scope.receive.feature += item.name;
                }
                return;
            });
            if (!validateForm()) {
                $scope.formWarning = true;
            }
            else {
                $rootScope.infoDistance = {
                    pickupDatetime: $scope.send.date + ' ' + $scope.send.time + ':00',
                    pickupAddress: $scope.send.address.formatted_address,
                    pickupLat: $scope.send.address.geometry.location.A,
                    pickupLng: $scope.send.address.geometry.location.F,
                    receiverDatetime: $scope.receive.date + ' ' + $scope.receive.time + ':00',
                    receiverAddress: $scope.receive.address.formatted_address,
                    receiverLat: $scope.receive.address.geometry.location.A,
                    receiverLng: $scope.receive.address.geometry.location.F,
                    pickupFeature: $scope.send.feature,
                    receiverFeature: $scope.receive.feature,
                    pickupDescription: $scope.send.description,
                    receiverDescription: $scope.receive.description
                };

                $state.go("tab.screen3");
                clearData();
            }

        }
    })

    .controller('Screen3Ctrl', function ($scope, $state, $cordovaCamera, $rootScope, $ionicPopup, $jrCrop) {
        $scope.values = [{
            id: 0,
            name: 'Xe tải',
        }, {
            id: 1,
            name: 'Xe có cẩu'
        }, {
            id: 2,
            name: 'Xe container'
        }];

        $scope.selected = $scope.values[0];
        $scope.type = {
            vehicles: $scope.selected.id,
            feature: "Hàng dễ vỡ",
            size: "",
            weight: "",
            description: "",
            imageSrc: "",
            length: "",
            width: "",
            height: "",
        }

        function clearData() {
            $scope.selected = $scope.values[0];
            $scope.type = {
                vehicles: $scope.selected.id,
                feature: "Hàng dễ vỡ",
                size: "",
                weight: "",
                description: "",
                imageSrc: "",
                length: "",
                width: "",
                height: "",
            }
        }


        $scope.takePicture = function () {
            $ionicPopup.show({
                template: '',
                title: 'Chọn cách up ảnh',
                scope: $scope,
                // buttons: [{text : 'Hủy',
                // type: 'button-positive'
                // },
                // { text: 'Chụp ảnh',
                // type: 'button-positive',
                // onTap: function(e) {
                // var options = {
                // quality: 75,
                // destinationType: Camera.DestinationType.DATA_URL,
                // sourceType: Camera.PictureSourceType.CAMERA,
                // mediaType: Camera.MediaType.PICTURE,
                // encodingType: Camera.EncodingType.JPEG,
                // targetWidth: 480,
                // targetHeight: 320,
                // correctOrientation: true
                // };

                // $cordovaCamera.getPicture(options).then(function (imageData) {
                // // Success! Image data is here
                // $scope.type.imageSrc = "data:image/jpeg;base64," +imageData;
                // $scope.$apply();

                // }, function (err) {
                // // An error occurred. Show a message to the user
                // alert(err);
                // });
                // }
                // },
                // {
                // text: 'Thư viện',
                // type: 'button-positive',
                // onTap: function(e) {
                // var options = {
                // quality: 75,
                // destinationType: Camera.DestinationType.FILE_URI,
                // sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
                // mediaType: Camera.MediaType.PICTURE,
                // encodingType: Camera.EncodingType.JPEG,
                // targetWidth: 480,
                // targetHeight: 320
                // };

                // $cordovaCamera.getPicture(options).then(function (imageData) {
                // // Success! Image data is here
                // function convertImgToBase64(url, callback, outputFormat){
                // var canvas = document.createElement('CANVAS'),
                // ctx = canvas.getContext('2d'),
                // img = new Image;
                // img.crossOrigin = 'Anonymous';
                // img.onload = function(){
                // var dataURL;
                // canvas.height = img.height;
                // canvas.width = img.width;
                // ctx.drawImage(img, 0, 0);
                // dataURL = canvas.toDataURL(outputFormat);
                // callback.call(this, dataURL);
                // canvas = null;
                // };
                // img.src = url;
                // }

                // convertImgToBase64(imageData, function(base64Img){
                // $scope.type.imageSrc = base64Img;
                // $scope.$apply();
                // });


                // }, function (err) {
                // // An error occurred. Show a message to the user
                // alert(err);
                // });
                // }
                // }
                // ]
                buttons: [{
                    text: 'Hủy',
                    type: 'button-positive'
                },
                    {
                        text: 'Chụp ảnh',
                        type: 'button-positive',
                        onTap: function (e) {
                            var options = {
                                quality: 75,
                                destinationType: Camera.DestinationType.FILE_URI,
                                sourceType: Camera.PictureSourceType.CAMERA,
                                mediaType: Camera.MediaType.PICTURE,
                                encodingType: Camera.EncodingType.JPEG,
                                targetWidth: 480,
                                targetHeight: 320,
                                correctOrientation: true
                            };

                            $cordovaCamera.getPicture(options).then(function (imageData) {
                                // Success! Image data is here
                                $jrCrop.crop({
                                    url: imageData,
                                    width: 200,
                                    height: 200
                                }).then(function (data) {
                                    $scope.type.imageSrc = data.toDataURL();
                                    $scope.$apply();
                                }, function () {
                                    // User canceled or couldn't load image.
                                });
                            }, function (err) {
                                // An error occurred. Show a message to the user
                                alert(err);
                            });
                        }
                    },
                    {
                        text: 'Thư viện',
                        type: 'button-positive',
                        onTap: function (e) {
                            var options = {
                                quality: 75,
                                destinationType: Camera.DestinationType.FILE_URI,
                                sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
                                mediaType: Camera.MediaType.PICTURE,
                                encodingType: Camera.EncodingType.JPEG,
                                targetWidth: 480,
                                targetHeight: 320
                            };

                            $cordovaCamera.getPicture(options).then(function (imageData) {
                                // Success! Image data is here
                                $jrCrop.crop({
                                    url: imageData,
                                    width: 200,
                                    height: 200
                                }).then(function (data) {
                                    $scope.type.imageSrc = data.toDataURL();
                                    $scope.$apply();
                                }, function () {
                                    // User canceled or couldn't load image.
                                });
                            }, function (err) {
                                // An error occurred. Show a message to the user
                                alert(err);
                            });
                        }
                    }
                ]
            });
        };

        $scope.removePicture = function () {
            $scope.type.imageSrc = '';
        };

        var requiredFields = [
            "feature",
            "size",
            "weight",
            "description",
            "imageSrc"];

        function validateForm() {

            for (index in requiredFields) {
                if (!$scope.type[requiredFields[index]]) {
                    return false;
                }
            }
            return true;
        }

        $scope.formWarning = '';

        $scope.next = function () {
            if (!validateForm()) {
                $scope.formWarning = "Vui lòng nhập đầy đủ thông tin(*)";
            }
            else if (($scope.type.size.match(/x/g) || []).length !== 2) {
                $scope.formWarning = "Vui lòng nhập kích thước đúng chuẩn";
            } else {

                var arr = $scope.type.size.split('x');
                $scope.type.length = arr[0];
                $scope.type.width = arr[1];
                $scope.type.height = arr[2];
                $rootScope.infoProduct = {
                    description: $scope.type.description,
                    vehicleType: $scope.type.vehicles,
                    weight: $scope.type.weight,
                    length: $scope.type.length,
                    width: $scope.type.width,
                    height: $scope.type.height,
                    feature: $scope.type.feature,
                    stuffImage: $scope.type.imageSrc
                }
                $state.go("tab.screen4");
                clearData();
            }
        };

    })

    .controller('Screen4Ctrl', function ($scope, $state, $rootScope, $cordovaCamera, $ionicPopup, $jrCrop) {

        $scope.genders = [{
            name: 'Nam',
            id: 1
        }, {
            name: 'Nữ',
            id: 0
        }];

        $scope.send = {
            name: '',
            phone: ''
            //imageSrc: ''
        };
        $scope.receive = {
            name: '',
            phone: '',
            gender: $scope.genders[0],
            identifyNumber: '',
            imageSrc: ''
        };
        function clearData() {
            $scope.genders = [{
                name: 'Nam',
                id: 1
            }, {
                name: 'Nữ',
                id: 0
            }];
            $scope.send = {
                name: '',
                phone: ''
                //imageSrc: ''
            };
            $scope.receive = {
                name: '',
                phone: '',
                gender: $scope.genders[0],
                identifyNumber: '',
                imageSrc: ''
            };
        }

        // $scope.takeSendPicture = function () {
        // $ionicPopup.show({
        // template: '',
        // title: 'Chọn cách up ảnh',
        // scope: $scope,
        // buttons: [
        // { text: 'Chụp ảnh',
        // type: 'button-positive',
        // onTap: function(e) {
        // var options = {
        // quality: 75,
        // destinationType: Camera.DestinationType.DATA_URL,
        // sourceType: Camera.PictureSourceType.CAMERA,
        // mediaType: Camera.MediaType.PICTURE,
        // encodingType: Camera.EncodingType.JPEG,
        // targetWidth: 480,
        // targetHeight: 320
        // };

        // $cordovaCamera.getPicture(options).then(function (imageData) {
        // // Success! Image data is here
        // $scope.send.imageSrc = "data:image/jpeg;base64," +imageData;
        // $scope.$apply();

        // }, function (err) {
        // // An error occurred. Show a message to the user
        // alert(err);
        // });
        // }
        // },
        // {
        // text: 'Thư viện',
        // type: 'button-positive',
        // onTap: function(e) {
        // var options = {
        // quality: 75,
        // destinationType: Camera.DestinationType.FILE_URI,
        // sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
        // mediaType: Camera.MediaType.PICTURE,
        // encodingType: Camera.EncodingType.JPEG,
        // targetWidth: 480,
        // targetHeight: 320
        // };

        // $cordovaCamera.getPicture(options).then(function (imageData) {
        // // Success! Image data is here
        // function convertImgToBase64(url, callback, outputFormat){
        // var canvas = document.createElement('CANVAS'),
        // ctx = canvas.getContext('2d'),
        // img = new Image;
        // img.crossOrigin = 'Anonymous';
        // img.onload = function(){
        // var dataURL;
        // canvas.height = img.height;
        // canvas.width = img.width;
        // ctx.drawImage(img, 0, 0);
        // dataURL = canvas.toDataURL(outputFormat);
        // callback.call(this, dataURL);
        // canvas = null;
        // };
        // img.src = url;
        // }

        // convertImgToBase64(imageData, function(base64Img){
        // $scope.send.imageSrc = base64Img;
        // $scope.$apply();
        // // Base64DataURL
        // console.log('converted',base64Img);
        // });


        // }, function (err) {
        // // An error occurred. Show a message to the user
        // alert(err);
        // });
        // }
        // }
        // ]
        // });
        // };


        $scope.takeReceivePicture = function () {
            $ionicPopup.show({
                template: '',
                title: 'Chọn cách up ảnh',
                scope: $scope,
                // buttons: [{text : 'Hủy',
                // type: 'button-positive'
                // },
                // { text: 'Chụp ảnh',
                // type: 'button-positive',
                // onTap: function(e) {
                // var options = {
                // quality: 75,
                // destinationType: Camera.DestinationType.DATA_URL,
                // sourceType: Camera.PictureSourceType.CAMERA,
                // mediaType: Camera.MediaType.PICTURE,
                // encodingType: Camera.EncodingType.JPEG,
                // targetWidth: 480,
                // targetHeight: 320,
                // correctOrientation: true
                // };

                // $cordovaCamera.getPicture(options).then(function (imageData) {
                // // Success! Image data is here
                // $scope.receive.imageSrc = "data:image/jpeg;base64," +imageData;
                // $scope.$apply();

                // }, function (err) {
                // // An error occurred. Show a message to the user
                // alert(err);
                // });
                // }
                // },
                // {
                // text: 'Thư viện',
                // type: 'button-positive',
                // onTap: function(e) {
                // var options = {
                // quality: 75,
                // destinationType: Camera.DestinationType.FILE_URI,
                // sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
                // mediaType: Camera.MediaType.PICTURE,
                // encodingType: Camera.EncodingType.JPEG,
                // targetWidth: 480,
                // targetHeight: 320
                // };

                // $cordovaCamera.getPicture(options).then(function (imageData) {
                // // Success! Image data is here
                // function convertImgToBase64(url, callback, outputFormat){
                // var canvas = document.createElement('CANVAS'),
                // ctx = canvas.getContext('2d'),
                // img = new Image;
                // img.crossOrigin = 'Anonymous';
                // img.onload = function(){
                // var dataURL;
                // canvas.height = img.height;
                // canvas.width = img.width;
                // ctx.drawImage(img, 0, 0);
                // dataURL = canvas.toDataURL(outputFormat);
                // callback.call(this, dataURL);
                // canvas = null;
                // };
                // img.src = url;
                // }

                // convertImgToBase64(imageData, function(base64Img){
                // $scope.receive.imageSrc = base64Img;
                // $scope.$apply();
                // });


                // }, function (err) {
                // // An error occurred. Show a message to the user
                // alert(err);
                // });
                // }
                // }
                // ]
                buttons: [{
                    text: 'Hủy',
                    type: 'button-positive'
                },
                    {
                        text: 'Chụp ảnh',
                        type: 'button-positive',
                        onTap: function (e) {
                            var options = {
                                quality: 75,
                                destinationType: Camera.DestinationType.FILE_URI,
                                sourceType: Camera.PictureSourceType.CAMERA,
                                mediaType: Camera.MediaType.PICTURE,
                                encodingType: Camera.EncodingType.JPEG,
                                targetWidth: 480,
                                targetHeight: 320,
                                correctOrientation: true
                            };

                            $cordovaCamera.getPicture(options).then(function (imageData) {
                                // Success! Image data is here
                                $jrCrop.crop({
                                    url: imageData,
                                    width: 200,
                                    height: 200
                                }).then(function (data) {
                                    $scope.receive.imageSrc = data.toDataURL();
                                    $scope.$apply();
                                }, function () {
                                    // User canceled or couldn't load image.
                                });
                            }, function (err) {
                                // An error occurred. Show a message to the user
                                alert(err);
                            });
                        }
                    },
                    {
                        text: 'Thư viện',
                        type: 'button-positive',
                        onTap: function (e) {
                            var options = {
                                quality: 75,
                                destinationType: Camera.DestinationType.FILE_URI,
                                sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
                                mediaType: Camera.MediaType.PICTURE,
                                encodingType: Camera.EncodingType.JPEG,
                                targetWidth: 480,
                                targetHeight: 320
                            };

                            $cordovaCamera.getPicture(options).then(function (imageData) {
                                // Success! Image data is here
                                $jrCrop.crop({
                                    url: imageData,
                                    width: 200,
                                    height: 200
                                }).then(function (data) {
                                    $scope.receive.imageSrc = data.toDataURL();
                                    $scope.$apply();
                                }, function () {
                                    // User canceled or couldn't load image.
                                });
                            }, function (err) {
                                // An error occurred. Show a message to the user
                                alert(err);
                            });
                        }
                    }
                ]
            });
        }

        // $scope.removeSendPicture = function () {
        // $scope.send.imageSrc = '';
        // };

        $scope.removeReceivePicture = function () {
            $scope.receive.imageSrc = '';
        };

        var requiredFieldsSend = ["name",
            "phone"
        ];

        var requiredFieldsReceive = ["name",
            "phone",
            "identifyNumber"
        ];

        function validateForm() {

            for (index in requiredFieldsReceive) {
                if (!$scope.receive[requiredFieldsReceive[index]]) {
                    return false;
                }
            }
            for (index in requiredFieldsSend) {
                if (!$scope.send[requiredFieldsSend[index]]) {
                    return false;
                }
            }
            return true;
        }

        $scope.formWarning = '';

        function clearData() {
            $scope.send = {
                name: '',
                phone: ''
                //imageSrc: ''
            };
            $scope.receive = {
                name: '',
                phone: '',
                gender: $scope.genders[0],
                identifyNumber: '',
                imageSrc: ''
            };
        }

        $scope.next = function () {
            if (!validateForm()) {
                $scope.formWarning = "Vui lòng điền đầy đủ thông tin(*)";
            }
            else {

                $rootScope.infoPeople = {
                    pickupName: $scope.send.name,
                    pickupPhone: '0' + $scope.send.phone,
                    //pickupImage: $scope.send.imageSrc,
                    receiverName: $scope.receive.name,
                    receiverGender: $scope.receive.gender.id,
                    receiverPhone: '0' + $scope.receive.phone,
                    receiverIdentify: $scope.receive.identifyNumber,
                    receiverImage: $scope.receive.imageSrc
                };
                $state.go("tab.screen5");
                clearData();
            }

        }
    })

    .controller('Screen5Ctrl', function ($scope, $state, $rootScope, GlobalTpl, $ionicPopup, $http) {

        $scope.getGender = function (id) {
            if (id === '1' || id === 1) {
                return "Nam";
            } else if (id === '0' || id === 0) {
                return "Nữ";
            }
            return '';
        };
        $scope.getVehicles = function (id) {
            if (id === "0" || id === 0) {
                return "Xe tải";
            } else if (id === "1" || id === 1) {
                return "Xe có cẩu";
            } else if (id === "2" || id === 2) {
                return "Xe container";
            }
        };
        $scope.data = {
            clientId: window.localStorage['clientId'],
            description: $rootScope.infoProduct.description,
            vehicleType: $rootScope.infoProduct.vehicleType,
            weight: $rootScope.infoProduct.weight,
            length: $rootScope.infoProduct.length,
            width: $rootScope.infoProduct.width,
            height: $rootScope.infoProduct.height,
            feature: $rootScope.infoProduct.feature,
            pickupName: $rootScope.infoPeople.pickupName,
            pickupPhone: $rootScope.infoPeople.pickupPhone,
            //pickupImage: $rootScope.infoPeople.pickupImage,
            pickupDatetime: $rootScope.infoDistance.pickupDatetime,
            pickupAddress: $rootScope.infoDistance.pickupAddress,
            pickupLat: $rootScope.infoDistance.pickupLat,
            pickupLng: $rootScope.infoDistance.pickupLng,
            pickupDescription: $rootScope.infoDistance.pickupDescription,
            receiverName: $rootScope.infoPeople.receiverName,
            receiverGender: $rootScope.infoPeople.receiverGender,
            receiverDatetime: $rootScope.infoDistance.receiverDatetime,
            receiverAddress: $rootScope.infoDistance.receiverAddress,
            receiverLat: $rootScope.infoDistance.receiverLat,
            receiverLng: $rootScope.infoDistance.receiverLng,
            receiverDescription: $rootScope.infoDistance.receiverDescription,
            receiverPhone: $rootScope.infoPeople.receiverPhone,
            receiverIdentify: $rootScope.infoPeople.receiverIdentify,
            stuffImage: $rootScope.infoProduct.stuffImage,
            receiverImage: $rootScope.infoPeople.receiverImage,
            pickupFeature: $rootScope.infoDistance.pickupFeature,
            receiverFeature: $rootScope.infoDistance.receiverFeature
        }

        function clearData() {
            $rootScope.infoProduct = '';
            $rootScope.infoDistance = '';
            $rootScope.infoPeople = '';
        }

        $scope.next = function () {

            var data = JSON.stringify($scope.data);
            var options = {
                showLoad: true,
                method: 'post',
                url: $rootScope.config.url + '/requests',
                data: data,
                headers: {
                    'Content-Type': undefined
                },
                timeout: 15000,
            };

            GlobalTpl.showLoading();
            $http(options)
                .success(function (response) {
                    GlobalTpl.hideLoading();
                    GlobalTpl.showAlert({template: "Tạo vận đơn thành công"});
                    $state.go('tab.running');
                })
                .error(function (response) {
                    GlobalTpl.hideLoading();
                    GlobalTpl.showAlert({template: response.moreInfo});
                })
                .finally(function () {
                    clearData();
                });
        }
    })

    .controller('ProfileCtrl', function ($scope, $state, GlobalTpl, $rootScope) {
        $scope.profile = '';
        $scope.requests = [];
        $scope.page = 1;
        $scope.moreDataCanBeLoaded = false;

        $scope.get = function (rate) {
            if (rate === '1') {
                return "img/5stars/1.png";
            } else if (rate === '2') {
                return "img/5stars/2.png";
            } else if (rate === '3') {
                return "img/5stars/3.png";
            } else if (rate === '4') {
                return "img/5stars/4.png";
            } else if (rate === '5') {
                return "img/5stars/5.png";
            }
        }

        $scope.loadMoreData = function () {
            LoadClientRequest({
                showLoad: false,
                showAlert: false
            });
        };

        $scope.doRefresh = function () {
            $scope.page = 1;
            $scope.requests = [];
            $scope.profile = '';
            LoadMainRequest();
            LoadClientRequest();
        };

        function LoadMainRequest() {

            var options = {
                method: 'get',
                url: $rootScope.config.url + "/clients/" + window.localStorage['clientId']
            }

            GlobalTpl.request(options, function (response) {
                // Check there is existing data to load

                if (response.data && response.data !== null) {
                    var req = response.data;
                    $scope.profile = {
                        id: (typeof req.id === 'undefined') ? '' : req.id,
                        deviceId: (typeof req.deviceId === 'undefined') ? '' : req.deviceId,
                        imageSrc: (typeof req.avatarPath === 'undefined') ? '' : req.avatarPath,
                        name: (typeof req.fullName === 'undefined') ? '' : req.fullName,
                        email: (typeof req.email === 'undefined') ? '' : req.email,
                        phoneNumber: (typeof req.phone === 'undefined') ? '' : req.phone,
                        identifyNumber: (typeof req.identifyCard === 'undefined') ? '' : req.identifyCard,
                        identifyDate: (typeof req.identifyCardDate === 'undefined' || req.identifyCardDate === null ) ? '' : req.identifyCardDate.substring(0, 10),
                        identifyPlace: (typeof req.identifyCardPlace === 'undefined') ? '' : req.identifyCardPlace,
                        imageFront: (typeof req.identifyCardFront === 'undefined') ? '' : req.identifyCardFront,
                        imageBack: (typeof req.identifyCardBack === 'undefined') ? '' : req.identifyCardBack,
                        starRating: (typeof req.rating === 'undefined') ? '' : Math.floor(req.rating),

                    };
                }
            }, function () {
                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        }

        function LoadClientRequest(opts) {
            opts = (typeof opts !== 'undefined') ? opts : {};

            var options = {
                showLoad: (typeof opts.showLoad === 'undefined') ? true : opts.showLoad,
                showAlert: (typeof opts.showAlert === 'undefined') ? true : opts.showAlert,
                method: (typeof opts.method === 'undefined') ? 'get' : opts.method,
                url: (typeof opts.url === 'undefined')
                    ? ($rootScope.config.url + "/client_rates/" + window.localStorage['clientId'] + "?page=" + $scope.page)
                    : opts.url
            };

            GlobalTpl.request(options, function (response) {
                // Check there is existing data to load
                $scope.moreDataCanBeLoaded =
                    (response && response.data && response.data.length > 0) ? true : false;

                if (response.data && response.data !== null) {

                    // Fetch new requests
                    for (var i in response.data) {
                        var req = response.data[i];

                        $scope.requests.push({
                            fullName: (typeof req.fullName === 'undefined') ? '' : req.fullName,
                            time: (typeof req.createdAt === 'undefined') ? '' : req.createdAt,
                            rating: (typeof req.rating === 'undefined') ? '' : Math.floor(req.rating),
                            comment: (typeof req.comment === 'undefined') ? '' : req.comment,
                            updateTime: ( typeof req.updateAt === 'undefined') ? '' : req.updateAt
                        });
                    }

                    $scope.page++;
                }
            }, function () {
                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        }

        LoadMainRequest();
        LoadClientRequest();

        $scope.next = function () {
            $state.go("tab.profileEdit");
        }
    })

    .controller('ProfileEditCtrl', function ($scope, $state, $rootScope, GlobalTpl, $cordovaDatePicker, $filter, $http, $cordovaCamera, $ionicPopup, $timeout, $jrCrop) {
        $rootScope.hide = false;
        $scope.profile = {
            id: '',
            deviceId: '',
            imageSrc: '',
            name: '',
            email: '',
            phoneNumber: '',
            identifyNumber: '',
            identifyDate: '',
            identifyPlace: '',
            imageFront: '',
            imageBack: '',
            starRating: ''
        };

        $scope.sendDate = function () {
            $cordovaDatePicker.show({
                date: new Date(),
                mode: 'date'
            }).then(function (date) {
                $scope.profile.identifyDate = $filter('date')(date, 'yyyy-MM-dd');
                $scope.$apply();
            });
        };

        $scope.get = function (id) {
            if (id === '') {
                return "Ngày cấp";
            }
            return $scope.profile.identifyDate;
        }

        $scope.takeAvatarPicture = function () {
            $ionicPopup.show({
                template: '',
                title: 'Chọn cách up ảnh',
                scope: $scope,
                buttons: [{
                    text: 'Hủy',
                    type: 'button-positive'
                },
                    {
                        text: 'Chụp ảnh',
                        type: 'button-positive',
                        onTap: function (e) {
                            var options = {
                                quality: 75,
                                destinationType: Camera.DestinationType.FILE_URI,
                                sourceType: Camera.PictureSourceType.CAMERA,
                                mediaType: Camera.MediaType.PICTURE,
                                encodingType: Camera.EncodingType.JPEG,
                                targetWidth: 480,
                                targetHeight: 320,
                                correctOrientation: true
                            };

                            $cordovaCamera.getPicture(options).then(function (imageData) {
                                // Success! Image data is here
                                $jrCrop.crop({
                                    url: imageData,
                                    width: 200,
                                    height: 200
                                }).then(function (data) {
                                    $scope.profile.imageSrc = data.toDataURL();
                                    $scope.$apply();
                                }, function () {
                                    // User canceled or couldn't load image.
                                });
                            }, function (err) {
                                // An error occurred. Show a message to the user
                                alert(err);
                            });
                        }
                    },
                    {
                        text: 'Thư viện',
                        type: 'button-positive',
                        onTap: function (e) {
                            var options = {
                                quality: 75,
                                destinationType: Camera.DestinationType.FILE_URI,
                                sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
                                mediaType: Camera.MediaType.PICTURE,
                                encodingType: Camera.EncodingType.JPEG,
                                targetWidth: 480,
                                targetHeight: 320
                            };

                            $cordovaCamera.getPicture(options).then(function (imageData) {
                                // Success! Image data is here
                                $jrCrop.crop({
                                    url: imageData,
                                    width: 200,
                                    height: 200
                                }).then(function (data) {
                                    $scope.profile.imageSrc = data.toDataURL();
                                    $scope.$apply();
                                }, function () {
                                    // User canceled or couldn't load image.
                                });
                            }, function (err) {
                                // An error occurred. Show a message to the user
                                alert(err);
                            });
                        }
                    }
                ]
            });
        };

        $scope.takeFrontPicture = function () {
            $ionicPopup.show({
                template: '',
                title: 'Chọn cách up ảnh',
                scope: $scope,
                // buttons: [{text : 'Hủy',
                // type: 'button-positive'
                // },
                // { text: 'Chụp ảnh',
                // type: 'button-positive',
                // onTap: function(e) {
                // var options = {
                // quality: 75,
                // destinationType: Camera.DestinationType.DATA_URL,
                // sourceType: Camera.PictureSourceType.CAMERA,
                // mediaType: Camera.MediaType.PICTURE,
                // encodingType: Camera.EncodingType.JPEG,
                // targetWidth: 480,
                // targetHeight: 320,
                // correctOrientation: true
                // };

                // $cordovaCamera.getPicture(options).then(function (imageData) {
                // // Success! Image data is here
                // $scope.profile.imageFront = "data:image/jpeg;base64," +imageData;
                // $scope.$apply();

                // }, function (err) {
                // // An error occurred. Show a message to the user
                // alert(err);
                // });
                // }
                // },
                // {
                // text: 'Thư viện',
                // type: 'button-positive',
                // onTap: function(e) {
                // var options = {
                // quality: 75,
                // destinationType: Camera.DestinationType.FILE_URI,
                // sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
                // mediaType: Camera.MediaType.PICTURE,
                // encodingType: Camera.EncodingType.JPEG,
                // targetWidth: 480,
                // targetHeight: 320
                // };

                // $cordovaCamera.getPicture(options).then(function (imageData) {
                // // Success! Image data is here
                // function convertImgToBase64(url, callback, outputFormat){
                // var canvas = document.createElement('CANVAS'),
                // ctx = canvas.getContext('2d'),
                // img = new Image;
                // img.crossOrigin = 'Anonymous';
                // img.onload = function(){
                // var dataURL;
                // canvas.height = img.height;
                // canvas.width = img.width;
                // ctx.drawImage(img, 0, 0);
                // dataURL = canvas.toDataURL(outputFormat);
                // callback.call(this, dataURL);
                // canvas = null;
                // };
                // img.src = url;
                // }

                // convertImgToBase64(imageData, function(base64Img){
                // $scope.profile.imageFront = base64Img;
                // $scope.$apply();
                // // Base64DataURL
                // console.log('converted',base64Img);
                // });


                // }, function (err) {
                // // An error occurred. Show a message to the user
                // alert(err);
                // });
                // }
                // }
                // ]
                buttons: [{
                    text: 'Hủy',
                    type: 'button-positive'
                },
                    {
                        text: 'Chụp ảnh',
                        type: 'button-positive',
                        onTap: function (e) {
                            var options = {
                                quality: 75,
                                destinationType: Camera.DestinationType.FILE_URI,
                                sourceType: Camera.PictureSourceType.CAMERA,
                                mediaType: Camera.MediaType.PICTURE,
                                encodingType: Camera.EncodingType.JPEG,
                                targetWidth: 480,
                                targetHeight: 320,
                                correctOrientation: true
                            };

                            $cordovaCamera.getPicture(options).then(function (imageData) {
                                // Success! Image data is here
                                $jrCrop.crop({
                                    url: imageData,
                                    width: 200,
                                    height: 200
                                }).then(function (data) {
                                    $scope.profile.imageFront = data.toDataURL();
                                    $scope.$apply();
                                }, function () {
                                    // User canceled or couldn't load image.
                                });
                            }, function (err) {
                                // An error occurred. Show a message to the user
                                alert(err);
                            });
                        }
                    },
                    {
                        text: 'Thư viện',
                        type: 'button-positive',
                        onTap: function (e) {
                            var options = {
                                quality: 75,
                                destinationType: Camera.DestinationType.FILE_URI,
                                sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
                                mediaType: Camera.MediaType.PICTURE,
                                encodingType: Camera.EncodingType.JPEG,
                                targetWidth: 480,
                                targetHeight: 320
                            };

                            $cordovaCamera.getPicture(options).then(function (imageData) {
                                // Success! Image data is here
                                $jrCrop.crop({
                                    url: imageData,
                                    width: 200,
                                    height: 200
                                }).then(function (data) {
                                    $scope.profile.imageFront = data.toDataURL();
                                    $scope.$apply();
                                }, function () {
                                    // User canceled or couldn't load image.
                                });
                            }, function (err) {
                                // An error occurred. Show a message to the user
                                alert(err);
                            });
                        }
                    }
                ]
            });
        };


        $scope.takeBackPicture = function () {
            $ionicPopup.show({
                template: '',
                title: 'Chọn cách up ảnh',
                scope: $scope,
                // buttons: [{text : 'Hủy',
                // type: 'button-positive'
                // },{ text: 'Chụp ảnh',
                // type: 'button-positive',
                // onTap: function(e) {
                // var options = {
                // quality: 75,
                // destinationType: Camera.DestinationType.DATA_URL,
                // sourceType: Camera.PictureSourceType.CAMERA,
                // mediaType: Camera.MediaType.PICTURE,
                // encodingType: Camera.EncodingType.JPEG,
                // targetWidth: 480,
                // targetHeight: 320,
                // correctOrientation: true
                // };

                // $cordovaCamera.getPicture(options).then(function (imageData) {
                // // Success! Image data is here
                // $scope.profile.imageBack = "data:image/jpeg;base64," +imageData;
                // $scope.$apply();

                // }, function (err) {
                // // An error occurred. Show a message to the user
                // alert(err);
                // });
                // }
                // },
                // {
                // text: 'Thư viện',
                // type: 'button-positive',
                // onTap: function(e) {
                // var options = {
                // quality: 75,
                // destinationType: Camera.DestinationType.FILE_URI,
                // sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
                // mediaType: Camera.MediaType.PICTURE,
                // encodingType: Camera.EncodingType.JPEG,
                // targetWidth: 480,
                // targetHeight: 320
                // };

                // $cordovaCamera.getPicture(options).then(function (imageData) {
                // // Success! Image data is here
                // function convertImgToBase64(url, callback, outputFormat){
                // var canvas = document.createElement('CANVAS'),
                // ctx = canvas.getContext('2d'),
                // img = new Image;
                // img.crossOrigin = 'Anonymous';
                // img.onload = function(){
                // var dataURL;
                // canvas.height = img.height;
                // canvas.width = img.width;
                // ctx.drawImage(img, 0, 0);
                // dataURL = canvas.toDataURL(outputFormat);
                // callback.call(this, dataURL);
                // canvas = null;
                // };
                // img.src = url;
                // }

                // convertImgToBase64(imageData, function(base64Img){
                // $scope.profile.imageBack = base64Img;
                // $scope.$apply();
                // });


                // }, function (err) {
                // // An error occurred. Show a message to the user
                // alert(err);
                // });
                // }
                // }
                // ]
                buttons: [{
                    text: 'Hủy',
                    type: 'button-positive'
                },
                    {
                        text: 'Chụp ảnh',
                        type: 'button-positive',
                        onTap: function (e) {
                            var options = {
                                quality: 75,
                                destinationType: Camera.DestinationType.FILE_URI,
                                sourceType: Camera.PictureSourceType.CAMERA,
                                mediaType: Camera.MediaType.PICTURE,
                                encodingType: Camera.EncodingType.JPEG,
                                targetWidth: 480,
                                targetHeight: 320,
                                correctOrientation: true
                            };

                            $cordovaCamera.getPicture(options).then(function (imageData) {
                                // Success! Image data is here
                                $jrCrop.crop({
                                    url: imageData,
                                    width: 200,
                                    height: 200
                                }).then(function (data) {
                                    $scope.profile.imageBack = data.toDataURL();
                                    $scope.$apply();
                                }, function () {
                                    // User canceled or couldn't load image.
                                });
                            }, function (err) {
                                // An error occurred. Show a message to the user
                                alert(err);
                            });
                        }
                    },
                    {
                        text: 'Thư viện',
                        type: 'button-positive',
                        onTap: function (e) {
                            var options = {
                                quality: 75,
                                destinationType: Camera.DestinationType.FILE_URI,
                                sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
                                mediaType: Camera.MediaType.PICTURE,
                                encodingType: Camera.EncodingType.JPEG,
                                targetWidth: 480,
                                targetHeight: 320
                            };

                            $cordovaCamera.getPicture(options).then(function (imageData) {
                                // Success! Image data is here
                                $jrCrop.crop({
                                    url: imageData,
                                    width: 200,
                                    height: 200
                                }).then(function (data) {
                                    $scope.profile.imageBack = data.toDataURL();
                                    $scope.$apply();
                                }, function () {
                                    // User canceled or couldn't load image.
                                });
                            }, function (err) {
                                // An error occurred. Show a message to the user
                                alert(err);
                            });
                        }
                    }
                ]
            });
        }

        $scope.removeAvatarPicture = function () {
            $scope.profile.imageSrc = '';
        };
        $scope.removeFrontPicture = function () {
            $scope.profile.imageFront = '';
        };

        $scope.removeBackPicture = function () {
            $scope.profile.imageBack = '';
        };

        $scope.doRefresh = function () {
            $scope.profile = {};
            LoadMainRequest();
        };

        function LoadMainRequest() {

            var options = {
                method: 'get',
                url: $rootScope.config.url + "/clients/" + window.localStorage['clientId']
            }

            GlobalTpl.request(options, function (response) {
                // Check there is existing data to load

                if (response.data && response.data !== null) {
                    var req = response.data;
                    $scope.profile = {
                        id: (typeof req.id === 'undefined') ? '' : req.id,
                        deviceId: ( typeof req.deviceId === 'undefined') ? '' : req.deviceId,
                        imageSrc: ( typeof req.avatarPath === 'undefined') ? '' : req.avatarPath,
                        name: (typeof req.fullName === 'undefined') ? '' : req.fullName,
                        email: (typeof req.email === 'undefined') ? '' : req.email,
                        phoneNumber: (typeof req.phone === 'undefined') ? '' : req.phone,
                        identifyNumber: (typeof req.identifyCard === 'undefined') ? '' : req.identifyCard,
                        identifyDate: (typeof req.identifyCardDate === 'undefined' || req.identifyCardDate === null) ? '' : req.identifyCardDate.substring(0, 10),
                        identifyPlace: (typeof req.identifyCardPlace === 'undefined') ? '' : req.identifyCardPlace,
                        imageFront: (typeof req.identifyCardFront === 'undefined') ? '' : req.identifyCardFront,
                        imageBack: (typeof req.identifyCardBack === 'undefined') ? '' : req.identifyCardBack,
                        starRating: (typeof req.rating === 'undefined') ? '' : Math.floor(req.rating)
                    };
                }
            }, function () {
                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            });
        }

        LoadMainRequest();
        $scope.next = function () {
            console.log($scope.profile.name);
            if ($scope.profile.phoneNumber === '') {
                $scope.data = {
                    fullName: ($scope.profile.name === '') ? '' : $scope.profile.name,
                    email: ($scope.profile.email === '') ? '' : $scope.profile.email,
                    avatarPath: ($scope.profile.imageSrc === '') ? '' : $scope.profile.imageSrc,
                    identifyCard: ($scope.profile.identifyNumber === '') ? '' : $scope.profile.identifyNumber,
                    identifyCardDate: ($scope.profile.identifyDate === '') ? '' : $scope.profile.identifyDate,
                    identifyCardPlace: ( $scope.profile.identifyPlace === null) ? $scope.profile.identifyPlace : $scope.profile.identifyPlace.address_components[0].long_name,
                    identifyCardFront: ($scope.profile.imageFront === '') ? '' : $scope.profile.imageFront,
                    identifyCardBack: ($scope.profile.imageBack === '') ? '' : $scope.profile.imageBack
                }
            } else {
                $scope.data = {
                    phone: $scope.profile.phoneNumber,
                    fullName: ($scope.profile.name === '') ? '' : $scope.profile.name,
                    email: ($scope.profile.email === '') ? '' : $scope.profile.email,
                    avatarPath: ($scope.profile.imageSrc === '') ? '' : $scope.profile.imageSrc,
                    identifyCard: ($scope.profile.identifyNumber === '') ? '' : $scope.profile.identifyNumber,
                    identifyCardDate: ($scope.profile.identifyDate === '') ? '' : $scope.profile.identifyDate,
                    identifyCardPlace: ( $scope.profile.identifyPlace === null) ? $scope.profile.identifyPlace : $scope.profile.identifyPlace.address_components[0].long_name,
                    identifyCardFront: ($scope.profile.imageFront === '') ? '' : $scope.profile.imageFront,
                    identifyCardBack: ($scope.profile.imageBack === '') ? '' : $scope.profile.imageBack
                }
            }
            var data = JSON.stringify($scope.data);
            var options = {
                showLoad: true,
                method: 'post',
                url: $rootScope.config.url + '/clients/' + window.localStorage['clientId'],
                data: data,
                headers: {
                    'Content-Type': undefined
                },
                timeout: 15000,

            };
            GlobalTpl.showLoading();
            $http(options)
                .success(function (response) {
                    GlobalTpl.hideLoading();
                    GlobalTpl.showAlert({template: "Chỉnh sửa thông tin thành công"});
                    $timeout(function () {
                        $state.go('tab.running');
                    });
                })
                .error(function (response) {
                    GlobalTpl.hideLoading();
                    GlobalTpl.showAlert({template: response.moreInfo});
                })
                .finally(function () {
                });
        }
    })

    .controller('RunningCtrl', function ($scope, $location, $rootScope, GlobalTpl) {
        $scope.values = [{
            id: 0,
            name: 'Tất cả',
            type: 'undone'
        }, {
            id: 1,
            name: 'Giao dịch chờ thực hiện',
            type: 'waiting'
        }, {
            id: 2,
            name: 'Giao dịch đang thực hiện',
            type: 'working'
        }];

        $scope.selected = $scope.values[0];
        $scope.requests = [];
        $scope.page = 1;
        $scope.moreDataCanBeLoaded = false;
        $scope.type = 'undone';
        $scope.first = true;

        $scope.doRefresh = function () {
            $scope.first = false;
            $scope.page = 1;
            $scope.requests = [];
            LoadMainRequest($scope.type);
        };

        $scope.loadMoreData = function () {
            LoadMainRequest($scope.type);
        };

        $scope.loadData = function (type) {
            $scope.requests = [];
            $scope.page = 1;
            $scope.type = type;
            LoadMainRequest(type);
            $scope.first = false;
        }
        function LoadMainRequest(type) {
            var options = {
                showLoad: ($scope.page === 1) ? true : false,
                showAlert: true,
                method: 'get',
                url: $rootScope.config.url + "/clients/"
                + window.localStorage['clientId'] + "/requests?page="
                + $scope.page + "&type=" + type
            };

            GlobalTpl.request(options, function (response) {
                // Check there is existing data to load
                $scope.moreDataCanBeLoaded =
                    (response && response.data && response.data.length > 0) ? true : false;

                if (response.data && response.data.length > 0) {
                    // Fetch new requests
                    for (var i in response.data) {
                        var req = response.data[i];
                        if (typeof req.driver === 'undefined') {
                            $scope.requests.push({
                                requestId: (typeof req.detail.id === 'undefined') ? '' : req.detail.id,
                                description: (typeof req.detail.description === 'undefined') ? '' : req.detail.description,
                                time: (typeof req.detail.createdAt === 'undefined') ? '' : req.detail.createdAt,
                                price: (typeof req.price === 'undefined') ? '' : req.price,
                                status: (typeof req.detail.status === 'undefined') ? '' : req.detail.status,
                                timeReturn: (typeof req.receiveTime === 'undefined') ? '' : req.location[1].time,
                                totalBid: (typeof req.totalBid === 'undefined') ? '' : req.totalBid,
                                sendAddress: (typeof req.location[0].address === 'undefined') ? '' : req.location[0].address,
                                receiveAddress: (typeof req.location[1].address === 'undefined') ? '' : req.location[1].address,
                                stuffImagePath: (typeof req.detail.stuffImagePath === 'undefined') ? '' : req.detail.stuffImagePath,
                            });
                        } else {
                            $scope.requests.push({
                                requestId: (typeof req.detail.id === 'undefined') ? '' : req.detail.id,
                                description: (typeof req.detail.description === 'undefined') ? '' : req.detail.description,
                                fullName: (typeof req.driver.fullName === 'undefined') ? '' : req.driver.fullName,
                                time: (typeof req.detail.createdAt === 'undefined') ? '' : req.detail.createdAt,
                                price: (typeof req.price === 'undefined') ? '' : req.price,
                                status: (typeof req.detail.status === 'undefined') ? '' : req.detail.status,
                                timeReturn: (typeof req.receiveTime === 'undefined') ? '' : req.location[1].time,
                                totalBid: (typeof req.totalBid === 'undefined') ? '' : req.totalBid,
                                sendAddress: (typeof req.location[0].address === 'undefined') ? '' : req.location[0].address,
                                receiveAddress: (typeof req.location[1].address === 'undefined') ? '' : req.location[1].address,
                                stuffImagePath: (typeof req.detail.stuffImagePath === 'undefined') ? '' : req.detail.stuffImagePath,
                            });
                        }
                    }

                    $scope.page++;
                }
            }, function () {
                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        }

        if ($scope.first === true) {
            LoadMainRequest($scope.type);
        }
        $scope.goDetail = function (req) {
            if (req.status === "1") {
                $location.path("/tab/holder/" + req.requestId);
            } else if (req.status === "3") {
                $location.path("/tab/running/" + req.requestId);
            }
        }
    })

    .controller('HistoryCtrl', function ($scope, $location, $rootScope, GlobalTpl) {
        $scope.values = [{
            id: 0,
            name: 'Tất cả',
            type: "all"
        }, {
            id: 1,
            name: 'Giao dịch chờ thực hiện',
            type: "waiting"
        }, {
            id: 2,
            name: 'Giao dịch đang thực hiện',
            type: "working"
        }, {
            id: 3,
            name: 'Giao dịch thành công',
            type: "success"
        }, {
            id: 4,
            name: 'Giao dịch thất bại',
            type: "fail"
        }, {
            id: 5,
            name: 'Giao dịch đã hủy',
            type: "cancel"
        }];

        $scope.selected = $scope.values[0];
        $scope.requests = [];
        $scope.page = 1;
        $scope.moreDataCanBeLoaded = false;
        $scope.type = 'all';
        $scope.first = true;

        $scope.doRefresh = function () {
            $scope.first = false;
            $scope.page = 1;
            $scope.requests = [];
            LoadMainRequest($scope.type);
        };

        $scope.loadMoreData = function () {
            LoadMainRequest($scope.type);
        };

        $scope.loadData = function (type) {
            $scope.requests = [];
            $scope.page = 1;
            $scope.type = type;
            LoadMainRequest(type);
            $scope.first = false;
        }
        function LoadMainRequest(type) {
            var options = {
                showLoad: ($scope.page === 1) ? true : false,
                showAlert: true,
                method: 'get',
                url: $rootScope.config.url + "/clients/"
                + window.localStorage['clientId'] + "/requests?page="
                + $scope.page + "&type=" + type
            };

            GlobalTpl.request(options, function (response) {
                // Check there is existing data to load
                $scope.moreDataCanBeLoaded =
                    (response && response.data && response.data.length > 0) ? true : false;

                if (response.data && response.data.length > 0) {

                    // Fetch new requests
                    for (var i in response.data) {
                        var req = response.data[i];
                        if (typeof req.driver === 'undefined') {
                            $scope.requests.push({
                                requestId: (typeof req.detail.id === 'undefined') ? '' : req.detail.id,
                                description: (typeof req.detail.description === 'undefined') ? '' : req.detail.description,
                                time: (typeof req.detail.createdAt === 'undefined') ? '' : req.detail.createdAt,
                                price: (typeof req.price === 'undefined') ? '' : req.price,
                                status: (typeof req.detail.status === 'undefined') ? '' : req.detail.status,
                                timeReturn: (typeof req.receiveTime === 'undefined') ? '' : req.location[1].time,
                                totalBid: (typeof req.totalBid === 'undefined') ? '' : req.totalBid,
                                sendAddress: (typeof req.location[0].address === 'undefined') ? '' : req.location[0].address,
                                receiveAddress: (typeof req.location[1].address === 'undefined') ? '' : req.location[1].address,
                                stuffImagePath: (typeof req.detail.stuffImagePath === 'undefined') ? '' : req.detail.stuffImagePath,
                            });
                        } else {
                            $scope.requests.push({
                                requestId: (typeof req.detail.id === 'undefined') ? '' : req.detail.id,
                                description: (typeof req.detail.description === 'undefined') ? '' : req.detail.description,
                                fullName: (typeof req.driver.fullName === 'undefined') ? '' : req.driver.fullName,
                                time: (typeof req.detail.createdAt === 'undefined') ? '' : req.detail.createdAt,
                                price: (typeof req.price === 'undefined') ? '' : req.price,
                                status: (typeof req.detail.status === 'undefined') ? '' : req.detail.status,
                                timeReturn: (typeof req.receiveTime === 'undefined') ? '' : req.location[1].time,
                                totalBid: (typeof req.totalBid === 'undefined') ? '' : req.totalBid,
                                sendAddress: (typeof req.location[0].address === 'undefined') ? '' : req.location[0].address,
                                receiveAddress: (typeof req.location[1].address === 'undefined') ? '' : req.location[1].address,
                                stuffImagePath: (typeof req.detail.stuffImagePath === 'undefined') ? '' : req.detail.stuffImagePath,
                            });
                        }
                    }
                    $scope.page++;
                }
            }, function () {
                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        }

        if ($scope.first === true) {
            LoadMainRequest($scope.type);
        }
        $scope.goDetail = function (req) {
            if (req.status === "1") {
                $location.path("/tab/holder/" + req.requestId);
            } else if (req.status === "3") {
                $location.path("/tab/running/" + req.requestId);
            } else if (req.status === "4" || req.status === "5") {
                $location.path("/tab/historyDetails/" + req.requestId);
                $rootScope.status = req.status;
            } else if (req.status === "2") {
                $location.path("/tab/cancel/" + req.requestId);
            }
        }
    })

    .controller('HolderDetailsCtrl', function ($scope, $stateParams, $location, GlobalTpl, $rootScope, $http) {
        $scope.id = $stateParams.id;
        $scope.requests = [];
        $scope.page = 1;
        $scope.moreDataCanBeLoaded = false;

        $scope.type = {};

        $scope.doRefresh = function () {
            $scope.page = 1;
            $scope.requests = [];
            $scope.type = {};
            LoadDetail();
            LoadMainRequest();
        };

        $scope.loadMoreData = function () {
            LoadMainRequest({
                showLoad: false,
                showAlert: false
            });
        };
        $scope.getGender = function (id) {
            if (id === '1') {
                return "Nam";
            } else if (id === '0') {
                return "Nữ";
            }
            return '';
        };
        $scope.getVehicles = function (id) {
            if (id === "0") {
                return "Xe tải";
            } else if (id === "1") {
                return "Xe có cẩu";
            } else if (id === "2") {
                return "Xe container";
            }
        }
        function LoadDetail() {
            var options = {
                method: 'get',
                url: $rootScope.config.url + "/requests/" + $scope.id
            };

            GlobalTpl.request(options, function (response) {
                // Check there is existing data to load

                if (response.data && response.data !== null) {

                    // Fetch new requests
                    var req = response.data;


                    $scope.type.sendAddress = (typeof req.location[0].address === 'undefined') ? '' : req.location[0].address;
                    $scope.type.receiveAddress = (typeof req.location[1].address === 'undefined') ? '' : req.location[1].address;
                    $scope.type.time = (typeof req.detail.createdAt === 'undefined') ? '' : req.detail.createdAt;
                    $scope.type.description = (typeof req.detail.description === 'undefined') ? '' : req.detail.description;
                    $scope.type.vehicleType = (typeof req.detail.vehicleType === 'undefined') ? '' : req.detail.vehicleType;
                    $scope.type.weight = (typeof req.detail.weight === 'undefined') ? '' : req.detail.weight;
                    $scope.type.length = (typeof req.detail.length === 'undefined') ? '' : req.detail.length;
                    $scope.type.width = (typeof req.detail.width === 'undefined') ? '' : req.detail.width;
                    $scope.type.height = (typeof req.detail.height === 'undefined') ? '' : req.detail.height;
                    $scope.type.feature = (typeof req.detail.feature === 'undefined') ? '' : req.detail.feature;
                    $scope.type.receiverName = ( typeof req.detail.receiverName === 'undefined') ? '' : req.detail.receiverName;
                    $scope.type.receiverGender = ( typeof req.detail.receiverGender === 'undefined') ? '' : req.detail.receiverGender;
                    $scope.type.receiverDatetime = ( typeof req.location[1].time === 'undefined') ? '' : req.location[1].time;
                    $scope.type.receiverPhone = ( typeof req.detail.receiverPhone === 'undefined') ? '' : req.detail.receiverPhone;
                    $scope.type.stuffImagePath = (typeof req.detail.stuffImagePath === 'undefined') ? '' : req.detail.stuffImagePath;
                    $scope.type.receiverImagePath = (typeof req.detail.receiverImagePath === 'undefined') ? '' : req.detail.receiverImagePath;
                    $scope.type.receiverIdentify = (typeof req.detail.receiverIdentify === 'undefined') ? '' : req.detail.receiverIdentify;


                }
            }, function () {
                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            });
        }


        function LoadMainRequest(opts) {
            opts = (typeof opts !== 'undefined') ? opts : {};

            var options = {
                showLoad: (typeof opts.showLoad === 'undefined') ? true : opts.showLoad,
                showAlert: (typeof opts.showAlert === 'undefined') ? true : opts.showAlert,
                method: (typeof opts.method === 'undefined') ? 'get' : opts.method,
                url: (typeof opts.url === 'undefined')
                    ? ($rootScope.config.url + "/bids/list?requestId=" + $scope.id + "&page=" + $scope.page)
                    : opts.url
            };

            GlobalTpl.request(options, function (response) {
                // Check there is existing data to load
                $scope.moreDataCanBeLoaded =
                    (response && response.data && response.data.length > 0) ? true : false;

                if (response.data && response.data !== null) {

                    // Fetch new requests
                    for (var i in response.data) {
                        var req = response.data[i];


                        $scope.requests.push({
                            driverId: (typeof req.dId === 'undefined') ? '' : req.dId,
                            bidId: (typeof req.bidId === 'undefined') ? '' : req.bidId,
                            fullName: (typeof req.fullName === 'undefined') ? '' : req.fullName,
                            phone: (typeof req.phone === 'undefined') ? '' : req.phone,
                            price: (typeof req.price === 'undefined') ? '' : req.price,
                            rating: (typeof req.rating === 'undefined') ? '' : Math.floor(req.rating),
                            username: (typeof req.username === 'undefined') ? '' : req.username,
                            time: (typeof req.createdAt === 'undefined') ? '' : req.createdAt
                        });
                    }

                    $scope.page++;
                }
            }, function () {
                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        }

        LoadDetail();
        LoadMainRequest();
        $scope.goDetail = function (req) {
            $location.path('/tab/driverDetails/' + $scope.id);
            $rootScope.driverDetails = {
                driverId: req.driverId,
                username: req.username,
                time: req.time,
                fullName: req.fullName,
                phone: req.phone,
                price: req.price,
                rating: Math.floor(req.rating),
                bidId: req.bidId
            }
        }
        $scope.cancel = function () {

            var data = {
                clientId: window.localStorage['clientId'],
                requestId: $scope.id,
            }
            var options = {
                showLoad: true,
                method: 'post',
                url: $rootScope.config.url + '/requests/cancel',
                data: JSON.stringify(data),
                headers: {
                    'Content-Type': undefined
                },
                timeout: 15000,
            };
            GlobalTpl.showLoading();
            $http(options)
                .success(function (response) {
                    GlobalTpl.hideLoading();
                    GlobalTpl.showAlert({template: "Hủy giao dịch thành công"});
                    $state.go('tab.running');
                })
                .error(function (response) {
                    GlobalTpl.hideLoading();
                    GlobalTpl.showAlert({template: response.moreInfo});
                })
                .finally(function () {
                });
        }
    })

    .controller('RunningDetailsCtrl', function ($scope, $stateParams, $rootScope, $state, GlobalTpl, $http) {
        $scope.id = $stateParams.id;
        $scope.type = {};

        $scope.doRefresh = function () {
            $scope.type = {};
            LoadDetail();
        };

        $scope.getGender = function (id) {
            if (id === '1') {
                return "Nam";
            } else if (id === '0') {
                return "Nữ";
            }
            return '';
        };
        $scope.getVehicles = function (id) {
            if (id === "0") {
                return "Xe tải";
            } else if (id === "1") {
                return "Xe có cẩu";
            } else if (id === "2") {
                return "Xe container";
            }
        }
        function LoadDetail() {
            $scope.$on('mapInitialized', function (event, map) {
                var options = {
                    method: 'get',
                    url: $rootScope.config.url + "/requests/" + $scope.id
                };

                GlobalTpl.request(options, function (response) {
                    // Check there is existing data to load

                    if (response.data && response.data !== null) {

                        // Fetch new requests

                        var req = response.data;

                        $scope.type.sendAddress = (typeof req.location[0].address === 'undefined') ? '' : req.location[0].address;
                        $scope.type.receiveAddress = (typeof req.location[1].address === 'undefined') ? '' : req.location[1].address;
                        $scope.type.time = (typeof req.detail.createdAt === 'undefined') ? '' : req.detail.createdAt;
                        $scope.type.description = (typeof req.detail.description === 'undefined') ? '' : req.detail.description;
                        $scope.type.vehicleType = (typeof req.detail.vehicleType === 'undefined') ? '' : req.detail.vehicleType;
                        $scope.type.weight = (typeof req.detail.weight === 'undefined') ? '' : req.detail.weight;
                        $scope.type.length = (typeof req.detail.length === 'undefined') ? '' : req.detail.length;
                        $scope.type.width = (typeof req.detail.width === 'undefined') ? '' : req.detail.width;
                        $scope.type.height = (typeof req.detail.height === 'undefined') ? '' : req.detail.height;
                        $scope.type.feature = (typeof req.detail.feature === 'undefined') ? '' : req.detail.feature;
                        $scope.type.receiverName = (typeof req.detail.receiverName === 'undefined') ? '' : req.detail.receiverName;
                        $scope.type.receiverGender = (typeof req.detail.receiverGender === 'undefined') ? '' : req.detail.receiverGender;
                        $scope.type.receiverDatetime = (typeof req.location[1].time === 'undefined') ? '' : req.location[1].time;
                        $scope.type.receiverPhone = (typeof req.detail.receiverPhone === 'undefined') ? '' : req.detail.receiverPhone;
                        $scope.type.stuffImagePath = (typeof req.detail.stuffImagePath === 'undefined') ? '' : req.detail.stuffImagePath;
                        $scope.type.receiverImagePath = (typeof req.detail.receiverImagePath === 'undefined') ? '' : req.detail.receiverImagePath;
                        $scope.type.receiverIdentify = (typeof req.detail.receiverIdentify === 'undefined') ? '' : req.detail.receiverIdentify;

                        $scope.type.driverId = (typeof req.drivers.driverId === 'undefined') ? '' : req.drivers.driverId;
                        $scope.type.username = (typeof req.drivers.username === 'undefined') ? '' : req.drivers.username;
                        $scope.type.fullName = (typeof req.drivers.fullName === 'undefined') ? '' : req.drivers.fullName;
                        $scope.type.phone = (typeof req.drivers.phone === 'undefined') ? '' : req.drivers.phone;
                        $scope.type.price = (typeof req.drivers.price === 'undefined') ? '' : req.drivers.price;
                        $scope.type.transportAt = (typeof req.drivers.transportAt === 'undefined') ? '' : req.drivers.transportAt;
                        $scope.type.transportMethod = (typeof req.drivers.transportMethod === 'undefined') ? '' : req.drivers.transportMethod;
                        $scope.type.moreInfo = (typeof req.drivers.moreInfo === 'undefined') ? '' : req.drivers.moreInfo;


                        var options1 = {
                            method: 'get',
                            url: $rootScope.config.url + "/driver_location?requestId=" + $scope.id + "&driverId=" + $scope.type.driverId
                        };

                        GlobalTpl.request(options1, function (response) {
                            // Check there is existing data to load

                            if (response.data && response.data !== null) {

                                // Fetch new requests

                                var req = response.data;

                                $scope.lat = req.currentLat;
                                $scope.lng = req.currentLng;

                                // var mainMap= map;
                                // var Marker = new google.maps.Marker({
                                // position: new google.maps.LatLng(req.currentLat, req.currentLng),
                                // map: mainMap,
                                // icon: 'img/taxi_marker.png'
                                // });

                                map.setCenter(new google.maps.LatLng($scope.lat, $scope.lng));

                            }

                        }, function () {
                        });

                    }
                }, function () {
                    // Stop the ion-refresher from spinning
                    $scope.$broadcast('scroll.refreshComplete');
                });
            })
        }

        LoadDetail();
        $scope.success = function () {
            var data = {
                clientId: window.localStorage['clientId'],
                requestId: $scope.id
            }
            var options = {
                showLoad: true,
                method: 'post',
                url: $rootScope.config.url + '/requests/report_success',
                data: JSON.stringify(data),
                headers: {
                    'Content-Type': undefined
                },
                timeout: 15000,
            };
            GlobalTpl.showLoading();
            $http(options)
                .success(function (response) {
                    GlobalTpl.hideLoading();
                    GlobalTpl.showAlert({template: "Giao dịch của bạn đã thành công!"});
                    $state.go('tab.running');
                })
                .error(function (response) {
                    GlobalTpl.hideLoading();
                    GlobalTpl.showAlert({template: response.moreInfo});
                })
                .finally(function () {
                });
        }
    })

    .controller('HistoryDetailsCtrl', function ($scope, $ionicPopup, $stateParams, $state, $rootScope, GlobalTpl, $http) {
        $scope.id = $stateParams.id;
        $scope.rating = 1;
        $scope.comment = '';
        $scope.type = {};

        $scope.title = ($rootScope.status === '4') ? 'Giao dịch thành công' : 'Giao dịch thất bại';
        function clearData() {
            $scope.rating = 1;
            $scope.comment = '';
            $scope.type = {};
        }

        $scope.doRefresh = function () {
            $scope.rating = 1;
            $scope.comment = '';
            $scope.type = {};
            LoadDetail();
        };

        $scope.getGender = function (id) {
            if (id === '1') {
                return "Nam";
            } else if (id === '0') {
                return "Nữ";
            }
            return '';
        };
        $scope.getVehicles = function (id) {
            if (id === "0") {
                return "Xe tải";
            } else if (id === "1") {
                return "Xe có cẩu";
            } else if (id === "2") {
                return "Xe container";
            }
        }

        function LoadDetail() {

            var options = {
                method: 'get',
                url: $rootScope.config.url + "/requests/" + $scope.id
            };


            GlobalTpl.request(options, function (response) {
                // Check there is existing data to load

                if (response.data && response.data !== null) {

                    // Fetch new requests

                    var req = response.data;

                    $scope.type.sendAddress = (typeof req.location[0].address === 'undefined') ? '' : req.location[0].address;
                    $scope.type.receiveAddress = (typeof req.location[1].address === 'undefined') ? '' : req.location[1].address;
                    $scope.type.time = (typeof req.detail.createdAt === 'undefined') ? '' : req.detail.createdAt;
                    $scope.type.description = (typeof req.detail.description === 'undefined') ? '' : req.detail.description;
                    $scope.type.vehicleType = (typeof req.detail.vehicleType === 'undefined') ? '' : req.detail.vehicleType;
                    $scope.type.weight = (typeof req.detail.weight === 'undefined') ? '' : req.detail.weight;
                    $scope.type.length = (typeof req.detail.length === 'undefined') ? '' : req.detail.length;
                    $scope.type.width = (typeof req.detail.width === 'undefined') ? '' : req.detail.width;
                    $scope.type.height = (typeof req.detail.height === 'undefined') ? '' : req.detail.height;
                    $scope.type.feature = (typeof req.detail.feature === 'undefined') ? '' : req.detail.feature;
                    $scope.type.receiverName = (typeof req.detail.receiverName === 'undefined') ? '' : req.detail.receiverName;
                    $scope.type.receiverGender = (typeof req.detail.receiverGender === 'undefined') ? '' : req.detail.receiverGender;
                    $scope.type.receiverDatetime = (typeof req.location[1].time === 'undefined') ? '' : req.location[1].time;
                    $scope.type.receiverPhone = (typeof req.detail.receiverPhone === 'undefined') ? '' : req.detail.receiverPhone;
                    $scope.type.stuffImagePath = (typeof req.detail.stuffImagePath === 'undefined') ? '' : req.detail.stuffImagePath;
                    $scope.type.receiverImagePath = (typeof req.detail.receiverImagePath === 'undefined') ? '' : req.detail.receiverImagePath;
                    $scope.type.receiverIdentify = (typeof req.detail.receiverIdentify === 'undefined') ? '' : req.detail.receiverIdentify;

                    $scope.type.driverId = (typeof req.drivers.driverId === 'undefined') ? '' : req.drivers.driverId;
                    $scope.type.username = (typeof req.drivers.username === 'undefined') ? '' : req.drivers.username;
                    $scope.type.fullName = (typeof req.drivers.fullName === 'undefined') ? '' : req.drivers.fullName;
                    $scope.type.phone = (typeof req.drivers.phone === 'undefined') ? '' : req.drivers.phone;
                    $scope.type.price = (typeof req.drivers.price === 'undefined') ? '' : req.drivers.price;
                    $scope.type.transportAt = (typeof req.drivers.transportAt === 'undefined') ? '' : req.drivers.transportAt;
                    $scope.type.transportMethod = (typeof req.drivers.transportMethod === 'undefined') ? '' : req.drivers.transportMethod;
                    $scope.type.moreInfo = (typeof req.drivers.moreInfo === 'undefined') ? '' : req.drivers.moreInfo;


                }

            }, function () {
                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            });

        }

        LoadDetail();
        $scope.recommend = {};

        $scope.rateFunction = function (rating) {
            $scope.rating = rating;
        };

        $scope.ratingDriver = function (data) {

            $scope.data = {
                clientId: window.localStorage['clientId'],
                driverId: data.driverId,
                requestId: $scope.id
            }

            $ionicPopup.show({
                templateUrl: 'templates/popup.html',
                title: 'Đánh giá lái xe',
                scope: $scope,
                buttons: [
                    {text: 'Hủy'},
                    {
                        text: '<b>Lưu</b>',
                        type: 'button-positive',
                        onTap: function (e) {
                            var data = {
                                clientId: $scope.data.clientId,
                                driverId: $scope.data.driverId,
                                requestId: $scope.data.requestId,
                                rating: $scope.rating,
                                comment: $scope.recommend.comment
                            }
                            var options = {
                                showLoad: true,
                                method: 'post',
                                url: $rootScope.config.url + '/driver_rates',
                                data: JSON.stringify(data),
                                headers: {
                                    'Content-Type': undefined
                                },
                                timeout: 15000,
                            };
                            GlobalTpl.showLoading();
                            $http(options)
                                .success(function (response) {
                                    GlobalTpl.hideLoading();
                                    GlobalTpl.showAlert({template: "Đánh giá lái xe thành công"});
                                    //$state.go('tab.main');
                                })
                                .error(function (response) {
                                    GlobalTpl.hideLoading();
                                    if (response.status === '400' && response.errorCode === 1) {
                                        GlobalTpl.showAlert({template: "Lái xe đã được bạn đánh giá!"});
                                    }
                                    else {
                                        GlobalTpl.showAlert({template: response.moreInfo});
                                    }
                                })
                                .finally(function () {
                                });
                        }
                    }
                ]
            });
        }

    })

    .controller('CancelDetailsCtrl', function ($scope, $stateParams, $state, $rootScope, GlobalTpl, $http) {
        $scope.id = $stateParams.id;
        $scope.type = {};

        $scope.doRefresh = function () {
            $scope.type = {};
            LoadDetail();
        };

        $scope.getGender = function (id) {
            if (id === '1') {
                return "Nam";
            } else if (id === '0') {
                return "Nữ";
            }
            return '';
        };
        $scope.getVehicles = function (id) {
            if (id === "0") {
                return "Xe tải";
            } else if (id === "1") {
                return "Xe có cẩu";
            } else if (id === "2") {
                return "Xe container";
            }
        }
        function LoadDetail() {

            var options = {
                method: 'get',
                url: $rootScope.config.url + "/requests/" + $scope.id
            };


            GlobalTpl.request(options, function (response) {
                // Check there is existing data to load

                if (response.data && response.data !== null) {

                    // Fetch new requests

                    var req = response.data;


                    $scope.type.sendAddress = (typeof req.location[0].address === 'undefined') ? '' : req.location[0].address;
                    $scope.type.receiveAddress = (typeof req.location[1].address === 'undefined') ? '' : req.location[1].address;
                    $scope.type.time = (typeof req.detail.createdAt === 'undefined') ? '' : req.detail.createdAt;
                    $scope.type.description = (typeof req.detail.description === 'undefined') ? '' : req.detail.description;
                    $scope.type.vehicleType = (typeof req.detail.vehicleType === 'undefined') ? '' : req.detail.vehicleType;
                    $scope.type.weight = (typeof req.detail.weight === 'undefined') ? '' : req.detail.weight;
                    $scope.type.length = (typeof req.detail.length === 'undefined') ? '' : req.detail.length;
                    $scope.type.width = (typeof req.detail.width === 'undefined') ? '' : req.detail.width;
                    $scope.type.height = (typeof req.detail.height === 'undefined') ? '' : req.detail.height;
                    $scope.type.feature = (typeof req.detail.feature === 'undefined') ? '' : req.detail.feature;
                    $scope.type.receiverName = (typeof req.detail.receiverName === 'undefined') ? '' : req.detail.receiverName;
                    $scope.type.receiverGender = (typeof req.detail.receiverGender === 'undefined') ? '' : req.detail.receiverGender;
                    $scope.type.receiverDatetime = (typeof req.location[1].time === 'undefined') ? '' : req.location[1].time;
                    $scope.type.receiverPhone = (typeof req.detail.receiverPhone === 'undefined') ? '' : req.detail.receiverPhone;
                    $scope.type.stuffImagePath = (typeof req.detail.stuffImagePath === 'undefined') ? '' : req.detail.stuffImagePath;
                    $scope.type.receiverImagePath = (typeof req.detail.receiverImagePath === 'undefined') ? '' : req.detail.receiverImagePath;
                    $scope.type.receiverIdentify = (typeof req.detail.receiverIdentify === 'undefined') ? '' : req.detail.receiverIdentify;

                    $scope.type.time = (typeof req.detail.cancelAt === 'undefined') ? '' : req.detail.cancelAt;


                }
            }, function () {
                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            });

        }

        LoadDetail();


    })

    .controller('DriverDetailsCtrl', function ($scope, $rootScope, $stateParams, GlobalTpl, $state, $ionicPopup, $http) {
        $scope.id = $stateParams.id;
        $scope.type = $rootScope.driverDetails;
        $scope.data = {
            requestId: $scope.id,
            driverId: $scope.type.driverId
        }
        function clearData() {
            $rootScope.driverDetails = '';
            $scope.type = '';
            $scope.data = '';
        }

        $scope.choose = function () {
            var data = JSON.stringify($scope.data);
            var options = {
                showLoad: true,
                method: 'post',
                url: $rootScope.config.url + '/bids/accept',
                data: data,
                headers: {
                    'Content-Type': undefined
                },
                timeout: 15000,
            };
            GlobalTpl.showLoading();
            $http(options)
                .success(function (response) {
                    GlobalTpl.hideLoading();
                    GlobalTpl.showAlert({template: "Chọn lái xe thành công"});
                    $state.go('tab.running');
                })
                .error(function (response) {
                    GlobalTpl.hideLoading();
                    GlobalTpl.showAlert({template: response.moreInfo});
                })
                .finally(function () {

                });
        }
    })