angular.module('globaltpl', [])

        .factory('GlobalTpl', function ($http, $ionicLoading, $ionicPopup) {

            function showLoading() {
                $ionicLoading.show({
                    template: 'Loading ...'
                });
            }

            function hideLoading() {
                $ionicLoading.hide();
            }

            function showAlert(options) {
                $ionicPopup.alert({
                    title: (options.title) ? options.title : 'Thông báo',
                    template: '<div class= "text-center">' + options.template + '</div>'
                });
            }
            ;

            function _errorAlert() {
                $ionicPopup.alert({
                    title: 'Lỗi kết nối',
                    template: 'Vui lòng kiểm tra lại kết nối. Ứng dụng sẽ tự động thoát!'
                }).then(function(res) {
					navigator.app.exitApp();
				});
			}

            function request(options, callback, final) {

                var config = {
                    timeout: 15000,
                };

                var isAlert = (options.showAlert) ? true : options.showAlert;

                if (options.showLoad) {
                    showLoading();
                }

                if (options.method === 'post') {
                    $http.post(options.url, options.data, config).
                            success(function (response) {

                                if (response) {
                                    // Execute the callback
                                    if ((typeof callback !== 'undefined') && (typeof callback === 'function')) {
                                        callback(response);
                                    }
                                }

                            }).
                            error(function () {
                                if (isAlert)
                                    _errorAlert();
                            }).
                            finally(function () {
                                hideLoading();
                                if ((typeof final !== 'undefined') && (typeof final === 'function')) {
                                    final();
                                }
                            });
                    ;

                } else if ((options.method === 'get') || (options.method === 'delete')) {
                    var method = $http[options.method];
                    method(options.url, config).
                            success(function (response) {
                                // Implement callback
                                if ((typeof callback !== 'undefined') && (typeof callback === 'function')) {
                                    callback(response);
                                }

                            }).
                            error(function () {
                                if (isAlert)
                                    _errorAlert();
                            }).
                            finally(function () {
                                if (options.showLoad) {
                                    hideLoading();
                                }

                                if ((typeof final !== 'undefined') && (typeof final === 'function')) {
                                    final();
                                }
                            });
                }
            }

            return {
                showLoading: showLoading,
                hideLoading: hideLoading,
                request: request,
                showAlert: showAlert
            };

        });