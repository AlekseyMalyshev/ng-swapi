var app = angular.module('ng-swapi', []);

app.controller('planets', ['$scope', function($scope) {

  $scope.minResidents = 3;

  $scope.planetsRequested = function() {
    $scope.$broadcast('planetsRequested');
  }

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

//    $scope.planets = [{name: '---Use request---'}];
   $scope.planets = [{id: 23, name: 'Planet 23'}, {id: 2, name: 'Planet 2'}];
    var planets = [];

    $scope.$on('planetsRequested', function($event) {
      $event.preventDefault();

      $scope.planets = [{name: '---Loading planets---'}];
      getPlanets('http://swapi.co/api/planets/?format=json');
    });

    function getPlanets(url) {
      $http.get(url).then(function(res) {
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
        console.error(err);
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
          console.error(err);
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
    $scope.resident;

    $scope.$watch('id', function(id) {
      if (id) {
        $http.get(id + '?format=json').then(function(res) {
          $scope.resident = res.data;
        },
        function(err){
          console.error(err);
        });
      }
    });
  }
});

