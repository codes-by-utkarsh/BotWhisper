var app = angular.module('ecoStoreApp', []);

app.controller('MainCtrl', function ($scope, $http, $window) {
    $scope.view = 'login';
    $scope.user = {};
    $scope.loginData = {};
    $scope.ticketData = {};
    $scope.createdTicket = null;

    $scope.login = function () {
        $http.post('/api/login', $scope.loginData)
            .then(function (response) {
                if (response.data.success) {
                    $scope.user.role = response.data.role;
                    $scope.user.loggedIn = true;
                    if ($scope.user.role === 'admin') {
                        $window.location.href = '/admin';
                    } else {
                        $scope.view = 'shop';
                    }
                }
            }, function (error) {
                alert('Login failed: ' + (error.data.message || 'Unknown error'));
            });
    };

    $scope.createTicket = function () {
        $http.post('/api/tickets', $scope.ticketData)
            .then(function (response) {
                if (response.data.success) {
                    $window.location.href = '/ticket-view/' + response.data.ticket.id;
                }
            }, function (error) {
                alert('Error creating ticket');
            });
    };

    $scope.reportTicket = function () {
        if (!$scope.createdTicket) return;
        $http.post('/api/report', { ticketId: $scope.createdTicket.id })
            .then(function (response) {
                alert(response.data.message);
            });
    };

    $scope.setView = function (view) {
        $scope.view = view;
    };
});
