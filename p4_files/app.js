var HOST = "http://ionicbackend-plaul.rhcloud.com"
//var HOST = "http://localhost:3000";

angular.module('starter', ['ionic'])

  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      if (window.cordova && window.cordova.plugins.Keyboard) {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

        // Don't remove this line unless you know what you are doing. It stops the viewport
        // from snapping when text inputs are focused. Ionic handles this internally for
        // a much nicer keyboard experience.
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }
    });
  }).factory('Projects', function ($http) {

    function getLastActiveIndex () {
      return parseInt(window.localStorage['lastActiveProject']) || 0;
    }

    return {
      getAll: function ($scope,done) {
        $http.get(HOST + "/api/projects").then(
          function OK(response) {
            $scope.projects = response.data;
            $scope.activeProject = $scope.projects[getLastActiveIndex()];
            done();
          },
          function Error(response) {
            console.log("Error");
          })
      },
      save: function (projects, $scope) {
        $http.post(HOST + "/api/projects", projects).then(
          function ok(res) {
            var project = res.data;
            $scope.projects.push(project);
            $scope.selectProject(project, $scope.projects.length - 1);
          },
          function error(res) {
            console.log("Todo: handle error");
          });
        window.localStorage['projects'] = angular.toJson(projects);
      },
      newProject: function (projectTitle) {
        // Add a new project
        return {
          title: projectTitle,
          tasks: []
        };
      },
      updateProject: function (project) {
        //Todo Handle response, especially for errors (new task is already added to client list)
        $http.put(HOST + "/api/projects", project);
      },
      getLastActiveIndex: getLastActiveIndex,
      setLastActiveIndex: function (index) {
        window.localStorage['lastActiveProject'] = index;
      }
    }
  })

  .controller('TodoCtrl', function ($scope, $timeout, $ionicModal, Projects, $ionicSideMenuDelegate) {

    // A utility function for creating a new project
    // with the given projectTitle
    var createProject = function (projectTitle) {
      var newProject = Projects.newProject(projectTitle);
      Projects.save(newProject, $scope);
    }


    // Load or initialize projects
    //$scope.projects = Projects.all();
    Projects.getAll($scope,function(){
      if ($scope.projects.length == 0) {
        //Create first project before we can start
        while (true) {
          var projectTitle = prompt('Your first project title:');
          if (projectTitle) {
            createProject(projectTitle);
            break;
          }
        }
      }
    });

    // Called to create a new project
    $scope.newProject = function () {
      var projectTitle = prompt('Project name');
      if (projectTitle) {
        createProject(projectTitle);
      }
    };

    // Called to select the given project
    $scope.selectProject = function (project, index) {
      $scope.activeProject = project;
      Projects.setLastActiveIndex(index);
      $ionicSideMenuDelegate.toggleLeft(false);
    };

    // Create our modal
    $ionicModal.fromTemplateUrl('new-task.html', function (modal, Project) {
      $scope.taskModal = modal;
    }, {
      scope: $scope
    });

    $scope.createTask = function (task) {
      if (!$scope.activeProject || !task) {
        return;
      }
      $scope.activeProject.tasks.push({
        title: task.title
      });

      Projects.updateProject($scope.activeProject);
      $scope.taskModal.hide();

      task.title = "";
    };

    $scope.newTask = function () {
      $scope.taskModal.show();
    };

    $scope.closeNewTask = function () {
      $scope.taskModal.hide();
    }

    $scope.toggleProjects = function () {
      $ionicSideMenuDelegate.toggleLeft();
    };
  });
