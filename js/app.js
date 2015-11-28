var app = angular.module('ng-swapi', []);

app.controller('planets', ['$scope', '$sce', function($scope, $sce) {

  var progressSymbol = '&#xf188;';

  $scope.minResidents = 3;
  $scope.progress = undefined;
  $scope.error = false;
  $scope.loading = false;

  $scope.planetsRequested = function() {
    $scope.progress = $sce.trustAsHtml(progressSymbol);
    $scope.loading = true;
    $scope.error = false;
    $scope.$broadcast('planetsRequested');
  }

  $scope.$on('httpsError', function($event, message) {
    $event.preventDefault();
    $scope.error = true;
    $scope.progress = message;
    $scope.loading = false;
  });

  $scope.$on('httpsProgress', function($event, percent) {
    $event.preventDefault();
    if (percent > 100) {
      $scope.progress = undefined;
      $scope.loading = false;
    }
    else {
      $scope.progress = $sce.trustAsHtml(
       Array(Math.ceil(percent)).join(progressSymbol));
    }
  });

}]);

app.directive('swapiPlanetsSelector', function() {

  return {
    restrict: 'E',
    templateUrl: 'partials/swapi-planet-selector.html',
    require: 'ngModel',
    scope: {
      minResidents: '@',
      ngModel: '='
    },
    controller: ['$scope', '$http', controller]
  };

  function controller($scope, $http) {

    $scope.planets = [];
    var planets = [];
    var progressCount = 0;

    $scope.$on('planetsRequested', function($event) {
      $event.preventDefault();
      $scope.planets = [];
      progressCount = 0;
      planets = [{name: '---Select planet---'}];
      getPlanets('http://swapi.co/api/planets/?format=json');
    });

    function getPlanets(url) {
      $http.get(url).then(function(res) {
        progressCount += 10 * 100;
        $scope.$emit('httpsProgress', progressCount / res.data.count);
        res.data.results.forEach(function(planet) {
          if (planet.residents.length >= $scope.minResidents) {
            planets.push({id: planet.url.match(/\/(\d+)\/$/)[1], name: planet.name});
          }
        });
        if (res.data.next) {
          getPlanets(res.data.next);
        }
        else {
          $scope.planets = planets;
        }
      },
      function(err){
        $scope.$emit('httpsError', 'Failed to download planets data. Error number: ' + err.status);
      });
    }

    $scope.planetSelected = function() {
      $scope.ngModel = $scope.planet;
    }
  }

});

app.directive('swapiPlanet', function() {

  return {
    restrict: 'E',
    transclude: true,
    templateUrl: 'partials/swapi-planet.html',
    scope: {
      id: '@',
      ngModel: '='
    },
    controller: ['$scope', '$http', controller]
  };

  function controller($scope, $http) {
    $scope.planet;

    $scope.$watch('id', function(id) {
      if (id) {
        $http.get('http://swapi.co/api/planets/' + $scope.id + '/?format=json').then(function(res) {
          $scope.planet = res.data;
          $scope.ngModel = $scope.planet;
        },
        function(err){
          $scope.$emit('httpsError', 'Failed to download planet data. Error number: ' + err.status);
        });
      }
    });
  }
});

app.directive('swapiResident', function() {
  return {
    restrict: 'E',
    templateUrl: 'partials/swapi-resident.html',
    scope: {
      id: '@',
    },
    controller: ['$scope', '$http', controller]
  };

  function controller($scope, $http) {
    $scope.resident = {name: 'Loading data...'};

    $scope.$watch('id', function(id) {
      if (id) {
        $http.get(id + '?format=json').then(function(res) {
          $scope.resident = res.data;
        },
        function(err){
          $scope.$emit('httpsError', 'Failed to download resident data. Error number: ' + err.status);
        });
      }
    });
  }
});

