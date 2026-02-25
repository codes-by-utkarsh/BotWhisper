var app = angular.module('ecoStoreApp', []);

app.config(function ($sceProvider) {
    $sceProvider.enabled(false);
});

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
                    $window.location.href = '/ticket-view?id=' + response.data.ticket.id;
                }
            }, function (error) {
                alert('Error creating ticket');
            });
    };

    $scope.setView = function (view) {
        $scope.view = view;
    };
});

app.controller('TicketCtrl', function ($scope, $http, $window, $compile, $timeout) {
    var urlParams = new URLSearchParams(window.location.search);
    var ticketId = urlParams.get('id');

    $scope.ticket = null;
    $scope.error = null;

    if (ticketId) {
        $http.get('/api/tickets/' + ticketId)
            .then(function (response) {
                if (response.data.success) {
                    $scope.ticket = response.data.ticket;

                    $timeout(function () {
                        var container = document.getElementById('description-container');
                        if (container) {
                            container.innerHTML = $scope.ticket.description;
                            $compile(container)($scope);
                        }
                    }, 0);

                } else {
                    $scope.error = 'Ticket not found.';
                }
            }, function () {
                $scope.error = 'Error loading ticket.';
            });
    } else {
        $scope.error = 'No ticket ID provided.';
    }

    $scope.reportTicket = function () {
        if (!$scope.ticket) return;
        $http.post('/api/report', { ticketId: $scope.ticket.id })
            .then(function (response) {
                alert(response.data.message);
            });
    };

    var cookies = document.cookie.split(';');
    var hasSessionId = cookies.some(function (c) {
        return c.trim().startsWith('session_id=');
    });
    if (hasSessionId) {
        var nav = document.getElementById('main-nav');
        if (nav) {
            var adminLink = document.createElement('a');
            adminLink.className = 'nav-link';
            adminLink.href = '/admin';
            adminLink.textContent = 'Admin Dashboard';
            nav.appendChild(adminLink);
        }
    }
});
