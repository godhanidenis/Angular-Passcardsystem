// var baseURL = 'http://165.227.86.165/api/';
// var baseURL = 'https://connect.s-onedigital.com/api/';
//var baseURL = 'https://connect.s-onedigital.com/api/';
var baseURL = 'http://127.0.0.1:8000/api/';
//var baseURL = 'https://passmanagmentapi.herokuapp.com/api/';
var localStorage = window.localStorage;

moment.locale('fr');

var app = angular.module('myApp', ["ngRoute", "moment-picker", 'ngTagsInput', '720kb.socialshare', 'wt.responsive']);

app.config(function ($routeProvider) {
  $routeProvider
    .when("/", {
      templateUrl: "screens/dash.html",
      controller: 'dashCtrl'
    })
    .when("/locations", {
      templateUrl: "screens/locations.html",
      controller: 'locationsCtrl'
    })
    .when("/accesspass", {
      templateUrl: "screens/access-pass.html",
      controller: 'accesspassCtrl'
    })
    .when("/accesstype", {
      templateUrl: "screens/access-type.html",
      controller: 'accesstypeCtrl'
    })
    .when("/visitortype", {
      templateUrl: "screens/visitor-type.html",
      controller: 'visitortypeCtrl'
    })
    .when("/connections", {
      templateUrl: "screens/connections.html",
      controller: 'connectionsCtrl'
    })
    .when("/residents", {
      templateUrl: "screens/residents.html",
      controller: 'connectionsCtrl'
    })
    .when("/monitor", {
      templateUrl: "screens/monitor.html",
      controller: 'monitorCtrl'
    })
    .when("/users", {
      templateUrl: "screens/users.html",
      controller: 'usersCtrl'
    })
    .when("/agents", {
      templateUrl: "screens/agents.html",
      controller: 'agentsCtrl'
    })
    ;
});




app.filter('utc', function () {

  return function (val) {
    var date = new Date(val);
    return new Date(date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours() + 4,
      date.getUTCMinutes(),
      date.getUTCSeconds());
  };

});



app.filter('timezone', function () {

  return function (val, offset) {
    if (val != null && val.length > 16) {
      return val.substring(0, 16)
    }
    return val;
  };
});


app.directive("ngConfirmClick", ["$parse", "$interpolate", function ($parse, $interpolate) {
  return {
    restrict: "A",
    priority: -1,
    compile: function (ele, attr) {
      var fn = $parse(attr.ngConfirmClick, null, true);
      return function ngEventHandler(scope, ele) {
        ele.on('click', function (event) {
          var callback = function () {
            fn(scope, { $event: "confirm" });
          };
          var message = $interpolate(attr.ngConfirmMessage)(scope) || 'Are you sure?';
          if (confirm(message)) {
            if (scope.$root.$$phase) {
              scope.$evalAsync(callback);
            } else {
              scope.$apply(callback);
            }
          }
        });
      }
    }
  }
}]);


app.directive('rruleRecurringSelect', [function() {
  return {
    restrict: 'E',
    scope: {
      rule: "=",
      okClick: "=",
      cancelClick: "=",
      showButtons: "=",
    },
    templateUrl: 'pages/examples/rrule_recurring_select.html',
    link: function(scope, elem, attrs) {

      scope.init = function() {
        scope.currentDate = new Date();
        scope.minDateMoment = moment();
        scope.minDateString = moment().subtract(1, 'day').format('YYYY-MM-DD');
        scope.parent = {dateFrom:'', dateTo:'',timeFrom:'', timeTo:''};
        scope.initFrequencies();
        scope.initWeekOrdinals();
        scope.selectedMonthFrequency = 'day_of_month';
        scope.resetData();
        scope.$watch(scope.currentRule, scope.ruleChanged);
        if(!_.isEmpty(scope.rule))
          scope.parseRule(scope.rule);
        else
          scope.calculateRRule();
      };

      scope.onChange = function (newValue, oldValue) {
        scope.calculateRRule();
      };

      scope.approveResident = function() {
        scope.calculateRRule();
        var recurrance_data = { 
          "recurrance_str"     : scope.recurrenceRule.toString(), 
          'recurrance_fromTime': scope.parent.timeFrom ? moment.utc(scope.parent.timeFrom).format() : null, 
          'recurrance_toTime'  : scope.parent.timeTo ? moment.utc(scope.parent.timeTo).format() : null,  
        }
        scope.$emit('recurrance_data', recurrance_data);
        //scope.resetData();
      };

      scope.resetForm = function(){
        scope.resetData();
        scope.myForm.$dirty = false;
        scope.myForm.$pristine = true;
        scope.myForm.$submitted = false;
        scope.parent = {dateFrom:'', dateTo:'',timeFrom:'', timeTo:''};
      }


      scope.initFrequencies = function() {
        scope.frequencies = [
          { name: 'Daily', rruleType: RRule.DAILY, type: 'day' },
          { name: 'Weekly', rruleType: RRule.WEEKLY, type: 'week' },
          { name: 'Monthly', rruleType: RRule.MONTHLY, type: 'month' },
          { name: 'Yearly', rruleType: RRule.YEARLY, type: 'year' }
        ];
        scope.selectedFrequency = scope.frequencies[0];
      };

      scope.initMonthlyDays = function() {
        scope.monthDays = [];
        scope.yearMonthDays = [];

        _.times(31, function(index) {
          var day = { day: index + 1, value: index + 1, selected: false }
          scope.monthDays.push(day);
          scope.yearMonthDays.push(day);
        });
        var lastDay = { day: 'Last Day', value: -1, selected: false };
        scope.monthDays.push(lastDay);
        scope.yearMonthDays.push(lastDay);
      };

      scope.initWeekOrdinals = function() {
        scope.weekOrdinals = ['st', 'nd', 'rd', 'th'];
      };

      scope.initMonthlyWeeklyDays = function() {
        scope.monthWeeklyDays = [];

        _.times(4, function(index) {
          var days = _.map(scope.daysOfWeek(), function(dayOfWeek){
            dayOfWeek.value = dayOfWeek.value.nth(index + 1);
            return dayOfWeek;
          });
          scope.monthWeeklyDays.push(days);
        });
      };

      scope.changeRecurranceFrequency = function(){
        scope.resetData();
        scope.calculateRRule();
      }

      scope.resetData = function() {
        scope.weekDays = scope.daysOfWeek();
        scope.initMonthlyDays();
        scope.initMonthlyWeeklyDays();
        scope.initYearlyMonths();
        scope.selectedYearMonth = 1;
        scope.selectedYearMonthDay = 1;
        scope.interval = '';
      };

      scope.daysOfWeek = function() {
        return [
          { name: 'S', value: RRule.SU, selected: false },
          { name: 'M', value: RRule.MO, selected: false },
          { name: 'T', value: RRule.TU, selected: false },
          { name: 'W', value: RRule.WE, selected: false },
          { name: 'T', value: RRule.TH, selected: false },
          { name: 'F', value: RRule.FR, selected: false },
          { name: 'S', value: RRule.SA, selected: false },
        ];
      };

      scope.initYearlyMonths = function() {
        scope.yearMonths = [
          { name: 'Jan', value: 1, selected: false },
          { name: 'Feb', value: 2, selected: false },
          { name: 'Mar', value: 3, selected: false },
          { name: 'Apr', value: 4, selected: false },
          { name: 'May', value: 5, selected: false },
          { name: 'Jun', value: 6, selected: false },
          { name: 'Jul', value: 7, selected: false },
          { name: 'Aug', value: 8, selected: false },
          { name: 'Sep', value: 9, selected: false },
          { name: 'Oct', value: 10, selected: false },
          { name: 'Nov', value: 11, selected: false },
          { name: 'Dec', value: 12, selected: false }
        ];
      };

      scope.selectMonthFrequency = function(monthFrequency) {
        scope.selectedMonthFrequency = monthFrequency;
        scope.resetData();
        scope.calculateRRule();
      };

      scope.toggleSelected = function(day) {
        day.selected = !day.selected;
        scope.calculateRRule();
      };

      scope.calculateRRule = function() {
        switch(scope.selectedFrequency.type) {
          case 'day':
            scope.calculateDailyRRule();
            break;
          case 'week':
            scope.calculateWeeklyRRule();
            break;
          case 'month':
            scope.calculateMonthlyRRule();
            break;
          case 'year':
            scope.calculateYearlyRRule();
        }
        if(!_.isUndefined(scope.rule))
          scope.rule = scope.recurrenceRule.toString();
      };

      scope.calculateInterval = function() {
        var interval = parseInt(scope.interval);
        if (!interval)
          interval = 1;
        return interval;
      };

      scope.calculateDailyRRule = function() {
        scope.recurrenceRule = new RRule({
          freq: RRule.DAILY,
          interval: scope.calculateInterval(),
          wkst: RRule.SU,
          dtstart: scope.parent.dateFrom ? moment(scope.parent.dateFrom).toDate() : null,
          until:   scope.parent.dateTo   ? moment(scope.parent.dateTo).toDate()   : null,
        });
      };

      scope.calculateWeeklyRRule = function() {
        var selectedDays = _(scope.weekDays).select(function(day) {
          return day.selected;
        }).pluck('value').value();

        scope.recurrenceRule = new RRule({
          freq: RRule.WEEKLY,
          interval: scope.calculateInterval(),
          wkst: RRule.SU,
          byweekday: selectedDays,
          dtstart: scope.parent.dateFrom ? moment(scope.parent.dateFrom).toDate() : null,
          until:   scope.parent.dateTo   ? moment(scope.parent.dateTo).toDate()   : null,
        });
      };

      scope.calculateMonthlyRRule = function() {
        if(scope.selectedMonthFrequency == 'day_of_month')
          scope.calculateDayOfMonthRRule();
        else
          scope.calculateDayOfWeekRRule();
      };

      scope.calculateDayOfMonthRRule = function() {
        var selectedDays = _(scope.monthDays).select(function(day) {
          return day.selected;
        }).pluck('value').value();

        scope.recurrenceRule = new RRule({
          freq: RRule.MONTHLY,
          interval: scope.calculateInterval(),
          wkst: RRule.SU,
          bymonthday: selectedDays,
          dtstart: scope.parent.dateFrom ? moment(scope.parent.dateFrom).toDate() : null,
          until:   scope.parent.dateTo   ? moment(scope.parent.dateTo).toDate()   : null,
        });
      };

      scope.calculateDayOfWeekRRule = function() {
        var selectedDays = _(scope.monthWeeklyDays).flatten().select(function(day) {
          return day.selected;
        }).pluck('value').value();

        scope.recurrenceRule = new RRule({
          freq: RRule.MONTHLY,
          interval: scope.calculateInterval(),
          wkst: RRule.SU,
          byweekday: selectedDays,
          dtstart: scope.parent.dateFrom ? moment(scope.parent.dateFrom).toDate() : null,
          until:   scope.parent.dateTo   ? moment(scope.parent.dateTo).toDate()   : null,
        });
      };

      scope.calculateYearlyRRule = function() {

        var selectedMonths = _(scope.yearMonths).flatten().sortBy(function(month){
          return month.value;
        }).select(function(month) {
          return month.selected;
        }).pluck('value').value();

        var selectedDays = _(scope.yearMonthDays).flatten().sortBy(function(day){
          return day.value;
        }).select(function(day) {
          return day.selected;
        }).pluck('value').value();

        scope.recurrenceRule = new RRule({
          freq: RRule.YEARLY,
          interval: scope.calculateInterval(),
          dtstart: scope.parent.dateFrom ? moment(scope.parent.dateFrom).toDate() : null,
          until:   scope.parent.dateTo   ? moment(scope.parent.dateTo).toDate()   : null,
          bymonth: selectedMonths,
          bymonthday: selectedDays
        });

        var rule = RRule.fromString(scope.recurrenceRule.toString());
        // Convert all dates into UTC before comparison
        var todayutc          = moment().utc().startOf('day'); // today in UTC
        var nextOccurrence    = rule.after(todayutc, true); // next rule date including today
        var nextOccurutc      = moment(nextOccurrence).utc(); // convert today into utc
        var match             = moment(nextOccurutc).isSame(todayutc, 'day'); // check if 'DAY' is same
      };

      scope.parseRule = function(rRuleString) {
        scope.recurrenceRule = RRule.fromString(rRuleString);

        scope.interval = scope.recurrenceRule.options.interval;

        scope.selectedFrequency = _.select(scope.frequencies, function(frequency) {
          return frequency.rruleType == scope.recurrenceRule.options.freq;
        })[0];

        switch(scope.selectedFrequency.type) {
          case 'week':
            scope.initFromWeeklyRule();
          case 'month':
            scope.initFromMonthlyRule();
        }
      };

      scope.initFromWeeklyRule = function() {
        var ruleSelectedDays = scope.recurrenceRule.options.byweekday;

        _.each(scope.weekDays, function(weekDay) {
          if (_.contains(ruleSelectedDays, weekDay.value.weekday))
            weekDay.selected = true;
        });
      };

      scope.initFromMonthlyRule = function() {
        if(!_.isEmpty(scope.recurrenceRule.options.bymonthday) || !_.isEmpty(scope.recurrenceRule.options.bynmonthday))
          scope.initFromMonthDays();
        else if(!_.isEmpty(scope.recurrenceRule.options.bynweekday))
          scope.initFromMonthWeekDays();
      };

      scope.initFromMonthDays = function() {
        var ruleMonthDays = scope.recurrenceRule.options.bymonthday;
        scope.selectedMonthFrequency = 'day_of_month';

        _.each(scope.monthDays, function(weekDay) {
          if(_.contains(ruleMonthDays, weekDay.value))
            weekDay.selected = true;
        });

        if(scope.recurrenceRule.options.bynmonthday.length > 0 && scope.recurrenceRule.options.bynmonthday[0] == -1)
          scope.monthDays[31].selected = true;
      };

      scope.initFromMonthWeekDays = function() {
        var ruleWeekMonthDays = scope.recurrenceRule.options.bynweekday;
        scope.selectedMonthFrequency = 'day_of_week';

        _.each(ruleWeekMonthDays, function(ruleArray) {
          var dayIndex = ruleArray[0];
          var weekIndex = ruleArray[1] - 1;

          var week = scope.monthWeeklyDays[weekIndex];
          _.each(week, function(day) {
            if (day.value.weekday == dayIndex) {
              day.selected = true;
              return;
            }
          });
        });
      };

      scope.ruleChanged = function() {
        if (!_.isEmpty(scope.rule)) {
          scope.parseRule(scope.rule);
        }
      };

      scope.currentRule = function() {
        return scope.rule;
      };

      scope.init();
    }
  }
}]);


app.controller('dashCtrl', function ($scope, $http, $rootScope, $window) {

  $rootScope.mainLoading = false;

  $scope.connections = [];
  // $scope.connectionst = [];
  $scope.inout = [];

  var myUser = localStorage.getItem('myUser');
  if (myUser == null || myUser.length < 5) {
    window.location = "./";
  }
  var is_child;
  var residence_area;
  var accesstype;
  var usertype;
  var isAdmin;

  $http.get(myUser)
    .then(function (response) {
      // console.log(response);
      $scope.actualUser = response.data.url;
      is_child = response.data.is_child;
      residence_area = response.data.residence_area;
      accesstype = response.data.accesstype;
      usertype = response.data.usertype;
      if (usertype == baseURL + "appusertype/1/") {
        isAdmin = true;
        $scope.isAdmin = true;
      } else {
        isAdmin = false;
        $scope.isAdmin = false;
      }
      $http.get(accesstype)
        .then(function (response) {
          // console.log(response.data);
          $rootScope.myAccessType = response.data;
          if (response.data.can_access_website == false) {
            window.location = "./";
          }
        });

      initInOut();

      initMasterUser();

    });


  $scope.limit = 4;
  $scope.loadMore = function () {
    $scope.limit = $scope.limit + 12;
  }


  var initMasterUser = function () {
    if (isAdmin == true) {
      $http.get(baseURL + "residents")
        .then(function (response) {
          angular.forEach(response.data, function (value2, key) {
            var connection = value2;
            $http.get(connection.residence_area).then(function (resarea) {
              $http.get(resarea.data.residence).then(function (resar) {
                $scope.connections.push({
                  "connection": connection,
                  "status": connection.status,
                  "area": resarea.data,
                  "residence": resar.data
                });
              })
            })
            $rootScope.mainLoading = false;
          })
        });
    } else {
      $http.get(myUser)
        .then(function (responsea) {
          var myUserTa = responsea.data.residence_area.split("/");
          var myUsera = myUserTa[5];
          $http.get(baseURL + "residentsbyarea?area=" + myUsera)
            .then(function (response) {
              angular.forEach(response.data, function (value2, key) {
                var connection = value2;
                $http.get(connection.residence_area).then(function (resarea) {
                  $http.get(resarea.data.residence).then(function (resar) {
                    $scope.connections.push({
                      "connection": connection,
                      "status": connection.status,
                      "area": resarea.data,
                      "residence": resar.data
                    });
                    $rootScope.mainLoading = false;
                  })
                });
              });

            });
        });
    }



  }





  var initInOut = function () {

    if (isAdmin == true) {
      $http.get(baseURL + "inouts")
        .then(function (response) {
          $scope.inouts = response.data;
          //  console.log(response.data);

          setTimeout(() => {
            $('.monitortable').tablePagination({
              perPage: 5,
              initPage: 1,
              position: 'bottom'
            });
          }, 100);

        });
    } else {

    }


    //  if(isAdmin == true) {

    //   setTimeout(() => {
    //     $('.monitortable').tablePagination({
    //       perPage: 5,
    //       initPage: 1,
    //       position: 'bottom'
    //   });
    //   }, 5000);
    //     $http.get(baseURL+"visitors")
    //     .then(function(response) {
    //       angular.forEach(response.data, function(value2, key){
    //         var connection = value2;
    //         $http.get(connection.type)
    //         .then(function(response) {
    //           var type = response.data.visitor_type;
    //           $http.get(connection.status)
    //           .then(function(response) {
    //             var status = response.data.name;


    //             if(connection.resident != null) {
    //             $http.get(connection.resident)
    //             .then(function(response) {
    //               var resident = response.data;
    //               $http.get(connection.residence_area)
    //               .then(function(response) {
    //                 var residence = response.data;
    //                 $http.get(residence.residence)
    //               .then(function(response) {
    //                 var resdat = response.data;
    //                 if(connection.checkin_agent == null) {

    //                 } else if(connection.checkout_agent == null) {
    //                   $http.get(connection.checkin_agent)
    //                   .then(function(response) {
    //                     var checkin_agent = response.data;

    //                         $scope.inout.push({
    //                           "connection": connection,
    //                           "type": type,
    //                           "status": status,
    //                           "resident": resident,
    //                           "residence": residence,
    //                           "checkin_agent": checkin_agent,
    //                           "checkout_agent": null,
    //                           "resdat": resdat
    //                         });
    //                   });
    //                 } else {
    //                   $http.get(connection.checkin_agent)
    //                   .then(function(response) {
    //                     var checkin_agent = response.data;
    //                     $http.get(connection.checkout_agent)
    //                     .then(function(response) {
    //                       var checkout_agent = response.data;

    //                         $scope.inout.push({
    //                           "connection": connection,
    //                           "type": type,
    //                           "status": status,
    //                           "resident": resident,
    //                           "residence": residence,
    //                           "checkin_agent": checkin_agent,
    //                           "checkout_agent": checkout_agent,
    //                           "resdat": resdat
    //                         });

    //                         $scope.inout.push({
    //                           "connection": connection,
    //                           "type": type,
    //                           "status": status,
    //                           "resident": resident,
    //                           "residence": residence,
    //                           "checkin_agent": checkin_agent,
    //                           "checkout_agent": null,
    //                           "resdat": resdat
    //                         });

    //                         $rootScope.mainLoading = false;
    //                     });
    //                   });

    //                 }
    //               });
    //             });
    //             });
    //             } else if(connection.user != null) {
    //             $http.get(connection.user)
    //             .then(function(response) {
    //               var resident = response.data;
    //               $http.get(connection.residence_area)
    //               .then(function(response) {
    //                 var residence = response.data;
    //                 $http.get(residence.residence)
    //               .then(function(response) {
    //                 var resdat = response.data;
    //                 if(connection.checkin_agent == null) {

    //                 } else if(connection.checkout_agent == null) {
    //                   $http.get(connection.checkin_agent)
    //                   .then(function(response) {
    //                     var checkin_agent = response.data;

    //                         $scope.inout.push({
    //                           "connection": connection,
    //                           "type": type,
    //                           "status": status,
    //                           "resident": resident,
    //                           "residence": residence,
    //                           "checkin_agent": checkin_agent,
    //                           "checkout_agent": null,
    //                           "resdat": resdat
    //                         });
    //                   });
    //                 } else {
    //                   $http.get(connection.checkin_agent)
    //                   .then(function(response) {
    //                     var checkin_agent = response.data;
    //                     $http.get(connection.checkout_agent)
    //                     .then(function(response) {
    //                       var checkout_agent = response.data;

    //                         $scope.inout.push({
    //                           "connection": connection,
    //                           "type": type,
    //                           "status": status,
    //                           "resident": resident,
    //                           "residence": residence,
    //                           "checkin_agent": checkin_agent,
    //                           "checkout_agent": checkout_agent,
    //                           "resdat": resdat
    //                         });

    //                         $scope.inout.push({
    //                           "connection": connection,
    //                           "type": type,
    //                           "status": status,
    //                           "resident": resident,
    //                           "residence": residence,
    //                           "checkin_agent": checkin_agent,
    //                           "checkout_agent": null,
    //                           "resdat": resdat
    //                         });

    //                         $rootScope.mainLoading = false;
    //                     });
    //                   });

    //                 }
    //               });
    //             });
    //             });
    //           }











    //           });
    //         });
    //       })
    //     });


    // } else {
    //   setTimeout(() => {
    //     $('.monitortable').tablePagination({
    //       perPage: 5,
    //       initPage: 1,
    //       position: 'bottom'
    //   });
    //   }, 5000);

    //   $http.get(myUser).then(function(mu) {
    //     var resdat = '';
    //     var masterResidenceURL = mu.data.residence;
    //     $http.get(masterResidenceURL).then(function(rd) {
    //       resdat = rd.data;
    //     });
    //     var masterAreaURL = mu.data.residence_area;
    //     var myAreaT = masterAreaURL.split("/");
    //     var myArea = myAreaT[5];
    //     $http.get(baseURL+"connectionsbyarea/?area="+myArea)
    //     .then(function(response) {
    //       angular.forEach(response.data, function(value2, key){
    //         var connection = value2;
    //         $http.get(connection.type)
    //         .then(function(response) {
    //           var type = response.data.visitor_type;
    //           $http.get(connection.status)
    //           .then(function(response) {
    //             var status = response.data.name;

    //             if(connection.resident != null) {

    //             $http.get(connection.resident)
    //             .then(function(response) {
    //               var resident = response.data;
    //               $http.get(connection.residence_area)
    //               .then(function(response) {
    //                 var residence = response.data;
    //                 if(connection.checkin_agent == null) {

    //                 } else if(connection.checkout_agent == null) {
    //                   $http.get(connection.checkin_agent)
    //                   .then(function(response) {
    //                     var checkin_agent = response.data;

    //                         $scope.inout.push({
    //                           "connection": connection,
    //                           "type": type,
    //                           "status": status,
    //                           "resident": resident,
    //                           "residence": residence,
    //                           "checkin_agent": checkin_agent,
    //                           "checkout_agent": null,
    //                           "resdat": resdat
    //                         });
    //                   });
    //                 } else {
    //                   $http.get(connection.checkin_agent)
    //                   .then(function(response) {
    //                     var checkin_agent = response.data;
    //                     $http.get(connection.checkout_agent)
    //                     .then(function(response) {
    //                       var checkout_agent = response.data;

    //                         $scope.inout.push({
    //                           "connection": connection,
    //                           "type": type,
    //                           "status": status,
    //                           "resident": resident,
    //                           "residence": residence,
    //                           "checkin_agent": checkin_agent,
    //                           "checkout_agent": checkout_agent,
    //                           "resdat": resdat
    //                         });

    //                         $scope.inout.push({
    //                           "connection": connection,
    //                           "type": type,
    //                           "status": status,
    //                           "resident": resident,
    //                           "residence": residence,
    //                           "checkin_agent": checkin_agent,
    //                           "checkout_agent": null,
    //                           "resdat": resdat
    //                         });
    //                         $rootScope.mainLoading = false;
    //                     });
    //                   });                          
    //                 }
    //               });
    //             });

    //             } else if(connection.user != null) {

    //             $http.get(connection.user)
    //             .then(function(response) {
    //               var resident = response.data;
    //               $http.get(connection.residence_area)
    //               .then(function(response) {
    //                 var residence = response.data;
    //                 if(connection.checkin_agent == null) {

    //                 } else if(connection.checkout_agent == null) {
    //                   $http.get(connection.checkin_agent)
    //                   .then(function(response) {
    //                     var checkin_agent = response.data;

    //                         $scope.inout.push({
    //                           "connection": connection,
    //                           "type": type,
    //                           "status": status,
    //                           "resident": resident,
    //                           "residence": residence,
    //                           "checkin_agent": checkin_agent,
    //                           "checkout_agent": null,
    //                           "resdat": resdat
    //                         });
    //                   });
    //                 } else {
    //                   $http.get(connection.checkin_agent)
    //                   .then(function(response) {
    //                     var checkin_agent = response.data;
    //                     $http.get(connection.checkout_agent)
    //                     .then(function(response) {
    //                       var checkout_agent = response.data;

    //                         $scope.inout.push({
    //                           "connection": connection,
    //                           "type": type,
    //                           "status": status,
    //                           "resident": resident,
    //                           "residence": residence,
    //                           "checkin_agent": checkin_agent,
    //                           "checkout_agent": checkout_agent,
    //                           "resdat": resdat
    //                         });

    //                         $scope.inout.push({
    //                           "connection": connection,
    //                           "type": type,
    //                           "status": status,
    //                           "resident": resident,
    //                           "residence": residence,
    //                           "checkin_agent": checkin_agent,
    //                           "checkout_agent": null,
    //                           "resdat": resdat
    //                         });
    //                         $rootScope.mainLoading = false;
    //                     });
    //                   });                          
    //                 }
    //               });
    //             });

    //             }




    //           });
    //         });
    //       })
    //     });

    //   });


    //   // console.log($scope.inout);




    // }


  }





  $scope.connectionApprove = function (connection, email, passcode, push_id, connectionarr) {

    // console.log(connectionarr);

    $http.get("push.php?push_id=" + push_id + "&passcode=" + passcode)
      .then(function (response) {
        // // // console.log(response);
      });

    $scope.connections = [];
    $http({
      method: 'PUT',
      url: connection,
      headers: { "Content-Type": "application/json;charset=UTF-8" },
      data: { "status": "APPROVED" }
    }).then(function (resp) {
      Swal.fire({
        title: 'Awesome!',
        text: 'You have confirmed the connection.',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      // process the form
      $http({
        method: 'POST',
        url: 'contact.php',
        data: {
          subject: 'Here is your passcode',
          emailTo: email,
          message: passcode,
          name: connectionarr.connection.name,
          email: connectionarr.connection.email,
          phone: connectionarr.connection.phone,
          location: connectionarr.residence.name + ', ' + connectionarr.area.area_name,
          passport: connectionarr.connection.id_passport_number,
          address: connectionarr.connection.address,
          vehicle: connectionarr.connection.vehicle_number,
          residents: connectionarr.connection.number_of_resident,


        },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).then(function (resp) {
        // // // console.log(resp);
        $scope.connections = [];
        // initMasterUser();
        $window.location.reload();
      });



    });
  }

});

app.controller('locationsCtrl', function ($scope, $http, $rootScope, $window) {

  $rootScope.mainLoading = false;

  var myUser = localStorage.getItem('myUser');
  if (myUser == null || myUser.length < 5) {
    window.location = "./";
  }
  var is_child;
  var residence_area;
  var accesstype;
  var usertype;
  var isAdmin;

  var myUserIDT = myUser.split("/");
  var myUserID = myUserIDT[5];

  $http.get(myUser)
    .then(function (response) {
      // console.log(response);
      is_child = response.data.is_child;
      residence_area = response.data.residence_area;
      accesstype = response.data.accesstype;
      usertype = response.data.usertype;
      if (usertype == baseURL + "appusertype/1/") {
        isAdmin = true;
      } else {
        isAdmin = false;
      }
      $http.get(accesstype)
        .then(function (response) {
          // console.log(response.data);
          $rootScope.myAccessType = response.data;
          if (response.data.can_access_website == false) {
            window.location = "./";
          }
        });

      getResidences();

    });



  var getResidences = function () {

    // // console.log(isAdmin);

    if (isAdmin == true) {
      $scope.residences = [];
      $http.get(baseURL + "residences")
        .then(function (response) {
          $scope.residences = response.data;
          // // console.log($scope.residences);
          $rootScope.mainLoading = false;
          setTimeout(() => {
            $('table').tablePagination({
              perPage: 8,
              initPage: 1,
              position: 'bottom'
            });
          }, 100);
        });
    } else {
      $scope.residences = [];
      $http.get(myUser)
        .then(function (response) {
          $http.get(response.data.residence)
            .then(function (responser) {
              $scope.residences.push(responser.data);
              // // console.log($scope.residences);
              $rootScope.mainLoading = false;
              setTimeout(() => {
                $('table').tablePagination({
                  perPage: 8,
                  initPage: 1,
                  position: 'bottom'
                });
              }, 100);
            });
        });
    }

  }




  $scope.limit = 12;
  $scope.loadMore = function () {
    $scope.limit = $scope.limit + 12;
  }


  $scope.printToCart = function (printSectionId) {
    // // // console.log('start printingg');
    var innerContents = document.getElementById(printSectionId).innerHTML;
    var popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="style.css" /></head><body onload="window.print()">' + innerContents + '</html>');
    popupWinindow.document.close();
  }


  var getResidenceTypes = function () {
    $http.get(baseURL + "residence_type")
      .then(function (response) {
        $scope.residence_type = response.data;
      });


  }
  getResidenceTypes();


  $scope.step = 1;
  $scope.setStep = function (s) {
    $scope.step = s;
  }


  $scope.syndicsList = [];

  $scope.addSyndics = function (sin) {
    $scope.syndicsList.push({
      "name": sin.name,
      "email": sin.email,
      "phone": sin.phone,
    });
    $scope.syndics = [];
  }

  $scope.removeSyndics = function (sindex) {
    $scope.syndicsList.splice(sindex, 1);
  }


  $scope.areasList = [];

  $scope.addArea = function (sin) {
    $scope.areasList.push({
      "name": sin.name,
      "prefix": sin.prefix,
      "allotmentsFrom": sin.allotmentsFrom,
      "allotmentsTo": sin.allotmentsTo,
    });
    $scope.area = [];
  }

  $scope.removeArea = function (sindex) {
    $scope.areasList.splice(sindex, 1);
  }




  $scope.setAreaForQRCode = function (ar) {
    // // // console.log(ar);
    $scope.areaForQRCode = ar;
  }


  $scope.getMonthz = function (date) {
    var month = date.getMonth() + 1;
    return month < 10 ? '0' + month : '' + month;
  }

  $scope.office = [];

  $scope.addResidence = function (name, address, contact_person, contact_email, contact_phone, type, syndics, area, company, floor) {
    var ndt = new Date();
    var month = $scope.getMonthz(ndt);

    //   console.log(myUserID);

    $http({
      method: 'POST',
      url: baseURL + "residences/",
      data: {
        'name': name,
        'address': address,
        'contact_person': contact_person,
        'contact_email': contact_email,
        'contact_phone': contact_phone,
        'company': company,
        'floor': floor,
        'type': type,
        'user': myUserID
      }
    }).then(function (resp) {

      var residenc = resp.data.url;

      for (var x = 0; x < area.length; x++) {
        var nameforcode = name.replace(/\s+/g, '');
        var difference = parseInt(area[x].allotmentsTo) - parseInt(area[x].allotmentsFrom);
        var code = name.substr(nameforcode.length - 5) + area[x].prefix + difference + month + ndt.getFullYear().toString().substr(-2);
        var codeforapp = name.substr(nameforcode.length - 5) + area[x].prefix;
        $http({
          method: 'POST',
          url: baseURL + "residenceareas/",
          data: {
            'residence': residenc,
            'area_name': area[x].name,
            'area_prefix': area[x].prefix,
            'area_allotments_from': area[x].allotmentsFrom,
            'area_allotments_to': area[x].allotmentsTo,
            'code': code,
            'code_for_app': codeforapp
          }
        }).then(function (resp) {

          // // // console.log(resp.data);

        },
          function (error) {
            // // // console.log(error.data);
            $scope.errors = error.data;
          });
      }

      for (var y = 0; y < syndics.length; y++) {
        $http({
          method: 'POST',
          url: baseURL + "residencesyndics/",
          data: {
            'residence': residenc,
            'syndics_name': syndics[y].name,
            'syndics_email': syndics[y].email,
            'syndics_phone': syndics[y].phone,
          }
        }).then(function (resp) {

          // // // console.log(resp.data);

        },
          function (error) {
            // // // console.log(error.data);
            $scope.errors = error.data;
          });
      }


      Swal.fire({
        title: 'Awesome!',
        text: 'New location is added.',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      $scope.name = '';
      $scope.address = '';
      $scope.contact_person = '';
      $scope.contact_email = '';
      $scope.type = '';
      $('#myModal').modal('hide');
      $('body').removeClass('modal-open');
      $window.location.reload();
    },
      function (error) {
        // // // console.log(error.data);
        $scope.errors = error.data;
      });
  }


  $scope.setResidenceForModal = function (resurl) {
    // // // console.log(resurl);

    $scope.mainResidenceFromModal = resurl;

    var idResidenceT = resurl.split("/");
    var idResidence = idResidenceT[5];

    $http.get(baseURL + 'syndicsbyresidence/?residence=' + idResidence)
      .then(function (response) {
        $scope.residenceSyndics = response.data;
        // // // console.log($scope.residenceSyndics);
      });
    $http.get(baseURL + 'areasbyresidence/?residence=' + idResidence)
      .then(function (response) {
        $scope.residenceAreas = response.data;
        // // // console.log($scope.residenceAreas);
      });
  }



  $scope.setLocationForEdit = function (locforedit) {
    // // // console.log(locforedit);
    $scope.locationSelectedForEdit = locforedit;
  }



  $scope.setLocationForEdit = function (locforedit) {
    // // // console.log(locforedit);
    $scope.locationSelectedForEdit = locforedit;
  }


  $scope.editResidence = function (newlocation) {
    // // // console.log(newlocation);
    $http({
      method: 'PUT',
      url: $scope.locationSelectedForEdit.url,
      headers: { "Content-Type": "application/json;charset=UTF-8" },
      data: newlocation
    }).then(function (resp) {
      // // // console.log(resp.data);
      Swal.fire({
        title: 'Awesome!',
        text: 'You have edited location details.',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      $('#editLocationModal').modal('hide');
      $('body').removeClass('modal-open');
      $window.location.reload();


    });
  }



  $scope.addNewArea = function (area) {

    var ndt = new Date();

    var getMonthz = function (date) {
      var month = date.getMonth() + 1;
      return month < 10 ? '0' + month : '' + month;
    }

    var month = getMonthz(ndt);

    var nameforcode = area.name.replace(/\s+/g, '');
    var difference = parseInt(area.allotmentsTo) - parseInt(area.allotmentsFrom);
    var code = name.substr(nameforcode.length - 5) + area.prefix + difference + month + ndt.getFullYear().toString().substr(-2);
    var codeforapp = name.substr(nameforcode.length - 5) + area.prefix;

    // // // console.log(code);
    // // // console.log(codeforapp);

    $http({
      method: 'POST',
      url: baseURL + "residenceareas/",
      data: {
        'residence': $scope.mainResidenceFromModal,
        'area_name': area.name,
        'area_prefix': area.prefix,
        'area_allotments_from': area.allotmentsFrom,
        'area_allotments_to': area.allotmentsTo,
        'code': code,
        'code_for_app': codeforapp
      }
    }).then(function (resp) {
      Swal.fire({
        title: 'Awesome!',
        text: 'You have added a new area.',
        icon: 'success',
        confirmButtonText: 'OK'
      });
    });
    //   $window.location.reload();
    $('#addAreaModal').modal('hide');
    $('#areasModal').modal('hide');
    $('body').removeClass('modal-open');
  }


  $scope.addNewSyndic = function (syndic) {
    $http({
      method: 'POST',
      url: baseURL + "residencesyndics/",
      data: {
        'residence': $scope.mainResidenceFromModal,
        'syndics_name': syndic.name,
        'syndics_email': syndic.email,
        'syndics_phone': syndic.phone
      }
    }).then(function (resp) {
      Swal.fire({
        title: 'Awesome!',
        text: 'You have added a new syndic.',
        icon: 'success',
        confirmButtonText: 'OK'
      });
    });

    // $window.location.reload();

    $('#addSyndicModal').modal('hide');
    $('#syndicsModal').modal('hide');
    $('body').removeClass('modal-open');


  }



  $scope.removeData = function (url) {
    $http({
      method: 'DELETE',
      url: url,
    }).then(function (resp) {
      //   getResidences();
      $('#areasModal').modal('hide');
      $('#syndicsModal').modal('hide');
      $('body').removeClass('modal-open');
    });
  }



  $scope.setSyndicToEdit = function (syndic) {
    // // // console.log(syndic);
    $scope.selectedsyndictoedit = syndic;
  }

  $scope.saveEditedSyndic = function (syn) {
    $http({
      method: 'PUT',
      url: $scope.selectedsyndictoedit.url,
      headers: { "Content-Type": "application/json;charset=UTF-8" },
      data: {
        "syndics_name": syn.syndics_name,
        "syndics_email": syn.syndics_email,
        "syndics_phone": syn.syndics_phone,
      }
    }).then(function (resp) {

      Swal.fire({
        title: 'Awesome!',
        text: 'You have edited the syndic details.',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      $('#editSyndicModal').modal('hide');
      $('body').removeClass('modal-open');


    });
  }




  $scope.setAreaToEdit = function (area) {
    $scope.selectedareatoedit = area;
  }

  $scope.saveEditedArea = function (area) {
    $http({
      method: 'PUT',
      url: $scope.selectedareatoedit.url,
      headers: { "Content-Type": "application/json;charset=UTF-8" },
      data: {
        "area_name": area.area_name,
        "area_prefix": area.area_prefix,
        "area_allotments_from": area.area_allotments_from,
        "area_allotments_to": area.area_allotments_to,
      }
    }).then(function (resp) {

      Swal.fire({
        title: 'Awesome!',
        text: 'You have edited the area details.',
        icon: 'success',
        confirmButtonText: 'OK'
      });

      $('#editAreaModal').modal('hide');
      $('body').removeClass('modal-open');
    });
  }


});

app.controller('accesspassCtrl', function ($scope, $http, $rootScope, $window) {


  //       var m = moment();
  // var keepLocalTime = true;

  // m.utc(keepLocalTime);

  $rootScope.mainLoading = false;

  var myUser = localStorage.getItem('myUser');
  $scope.myUserArea = localStorage.getItem('myUserArea');
  if (myUser == null || myUser.length < 5) {
    window.location = "./";
  }
  var is_child;
  var residence_area;
  var accesstype;
  var usertype;
  var isAdmin;
  var profile_img;
  $scope.SelectFile = function (e) {
    var inputFiles = e.target.files;
    if (inputFiles && inputFiles[0]) {
      var reader = new FileReader();

      reader.onload = function (e) {
        $('.placeholder-img')
          .attr('src', e.target.result);
      };

      reader.readAsDataURL(inputFiles[0]);
      profile_img = inputFiles[0];
    }
  }

  $scope.changestatus = function (changedAccessCard) {
    $http({
      method: 'PUT',
      url: changedAccessCard.connection.url,
      headers: { "Content-Type": "application/json;charset=UTF-8" },
      data:
      {
        "isEnable": changedAccessCard.connection.isEnable
      }
    }).then(function (resp) {
    }, function (error) {
    });
  }

  $http.get(myUser)
    .then(function (response) {
      // console.log(response);
      $scope.actualUser = response.data.url;
      is_child = response.data.is_child;
      residence_area = response.data.residence_area;
      accesstype = response.data.accesstype;
      usertype = response.data.usertype;
      if (usertype == baseURL + "appusertype/1/") {
        isAdmin = true;
        $scope.isAdmin = true;
      } else {
        isAdmin = false;
        $scope.isAdmin = false;
      }
      $http.get(accesstype)
        .then(function (response) {
          // console.log(response.data);
          $rootScope.myAccessType = response.data;
          if (response.data.can_access_website == false) {
            window.location = "./";
          }
        });

      getAccountAreas();
      getAccountAreasResidents();
      initMasterUser();

    });

  $scope.limit = 24;
  $scope.loadMore = function () {
    $scope.limit = $scope.limit + 12;
  }

  var idMasterUserT = myUser.split("/");
  var idMasterUser = idMasterUserT[5];

  var getVisitorTypes = function () {
    $http.get(baseURL + "visitortypes")
      .then(function (response) {
        $scope.visitortypes = response.data;
        //console.log($scope.visitortypes);
      });
  }

  $scope.$watch('user_type', function () {
    if ($scope.user_type) {
      $scope.isPermanent = $scope.visitortypes.filter(function (e) {
        return e.url == $scope.user_type && e.isPermanent == true;
      }).length > 0;
      if($scope.isPermanent){
        $scope.dateFrom = '';
        $scope.dateTo = '';
      }
    }
  });

  $scope.selectAreasByResidence = function (res) {
    $scope.areas = [];

    var myResidenceT = res.split("/");
    var myResidence = myResidenceT[5];

    if (isAdmin) {
      $http.get(baseURL + "areasbyresidence/?residence=" + myResidence)
        .then(function (responseareas) {
          $scope.areas = responseareas.data;
        });
    } else {
      $http.get(myUser).then(function (resp) {
        // // console.log(resp);
        $http.get(resp.data.residence_area).then(function (respa) {
          $scope.areas.push(respa.data);
        });
      });
    }

  }

  $scope.currentVehicles = [];

  var convertToMU = function (val) {
    var date = new Date(val);
    return new Date(date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours() - 0,
      date.getUTCMinutes());
  }

  var convertToMUZ = function (val) {
    var date = new Date(val);
    return new Date(date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours() - 0,
      date.getUTCMinutes(),
      date.getUTCSeconds());
  }

  var convertToMUZZ = function (val) {
    var date = new Date(val);
    return new Date(date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours() - 0,
      date.getUTCMinutes(),
      date.getUTCSeconds());
  }

  var convertToMUEDX = function (val) {
    var s = new Date(val);
    let [y, m, d, H, M] = s.split(/\D/);
    return new Date(Date.UTC(y, m - 1, d, H + 2, M));

    //  return new Date(date.getUTCFullYear(), 
    //                  date.getUTCMonth(), 
    //                  date.getUTCDate(),  
    //                  date.getUTCHours()-0, 
    //                  date.getUTCMinutes(), 
    //                  date.getUTCSeconds());
  }


  var convertToMUED = function (val) {
    var date = new Date(val);
    return new Date(date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours() - 0,
      date.getUTCMinutes(),
      date.getUTCSeconds());
  }


  var convertToMa = function (val) {
    var date = new Date(val);
    return new Date(date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours() + 4,
      date.getUTCMinutes(),
      date.getUTCSeconds());
  }


  $scope.setCurrentAccessPass = function (conn) {
    $scope.currentVehicles = [];
    $scope.currentAccessPassToEdit = conn;

    // $scope.connfordatesfrom = conn.connection.timedatefrom;
    // $scope.connfordatesto = conn.connection.timedateto;

    // $scope.stringDateFrom = conn.connection.timedatefrom;
    // $scope.stringDateTo = conn.connection.timedateto;


    angular.forEach(conn.vehicles, function (veh, key) {
      $scope.currentVehicles.push(
        {
          text: veh
        }
      );
    });

  }


  $scope.resetForm = function () {
    $scope.stringDateFrom = null;
    $scope.stringDateTo = null;
    $scope.dateFrom = null;
    $scope.dateTo = null;
  }


  $scope.removeData = function (url) {
    $http({
      method: 'DELETE',
      url: url,
    }).then(function (resp) {
      // // // console.log(resp);
      $rootScope.mainLoading = false;
      // initMasterUser();
      $window.location.reload();
    });
  }


  $scope.printToCart = function (printSectionId) {
    // // // console.log('start printingg');
    var innerContents = document.getElementById(printSectionId).innerHTML;
    var popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="style.css" /></head><body onload="window.print()">' + innerContents + '</html>');
    popupWinindow.document.close();
  }


  $scope.shareByEmail = function () {


    const unix_timestampfrom = Date.parse($scope.activeConnection.connection.timedatefrom);
    var datefrom = new Date(unix_timestampfrom).toLocaleDateString("en-GB")
    var timefrom = new Date(unix_timestampfrom).toLocaleTimeString("en-US", { hour12: false, hour: '2-digit', minute: '2-digit' })
    var timedatefrom = datefrom + ', ' + timefrom;

    const unix_timestampto = Date.parse($scope.activeConnection.connection.timedateto);
    var dateto = new Date(unix_timestampto).toLocaleDateString("en-GB")
    var timeto = new Date(unix_timestampto).toLocaleTimeString("en-US", { hour12: false, hour: '2-digit', minute: '2-digit' })
    var timedateto = dateto + ', ' + timeto;



    // console.log($scope.activeConnection.connection.qr_code);
    if ($scope.emailToShare == null || $scope.emailToShare == '') {
      Swal.fire({
        // title: 'Awesome!',
        text: 'You need to put an email address first.',
        // icon: 'success',
        confirmButtonText: 'OK'
      });
    } else {

      if ($scope.activeConnection.connection.resident != null) {
        $http.get('contact_share.php?email_to=' + $scope.emailToShare + '&image=' + $scope.activeConnection.connection.qr_code + '&area=' + $scope.activeConnection.connection.visitor_area.area_name + '&visitor=' + $scope.activeConnection.connection.name + '&interval=From: ' + timedatefrom + ' - To: ' + timedateto + '&vehicles=' + $scope.activeConnection.connection.vehicle_number + '&subscriber=' + $scope.activeConnection.connection.visitor_resident.name + '&comment=' + $scope.activeConnection.connection.comment).then(function (resp) {
          Swal.fire({
            title: 'Awesome!',
            text: 'You shared the access pass by email.',
            icon: 'success',
            confirmButtonText: 'OK'
          });
        });
      } else if ($scope.activeConnection.connection.user != null) {
        $http.get('contact_share.php?email_to=' + $scope.emailToShare + '&image=' + $scope.activeConnection.connection.qr_code + '&area=' + $scope.activeConnection.connection.visitor_area.area_name + '&visitor=' + $scope.activeConnection.connection.name + '&interval=From: ' + timedatefrom + ' - To: ' + timedateto + '&vehicles=' + $scope.activeConnection.connection.vehicle_number + '&subscriber=' + $scope.activeConnection.connection.visitor_user.name + '&comment=' + $scope.activeConnection.connection.comment).then(function (resp) {
          Swal.fire({
            title: 'Awesome!',
            text: 'You shared the access pass by email.',
            icon: 'success',
            confirmButtonText: 'OK'
          });
        });
      }


    }

  }


  $scope.shareByEmailA = function () {
    //  console.log($scope.createdPass.qr_code);
    if ($scope.emailToShare == null || $scope.emailToShare == '') {
      Swal.fire({
        // title: 'Awesome!',
        text: 'You need to put an email address first.',
        // icon: 'success',
        confirmButtonText: 'OK'
      });
    } else {

      if ($scope.createdPass.resident != null) {
        $scope.subscribername = $scope.createdPass.visitor_resident.name;
      } else {
        $scope.subscribername = $scope.createdPass.visitor_user.name;
      }

      $http.get('contact_share.php?email_to=' + $scope.emailToShare + '&image=' + $scope.createdPass.qr_code + '&area=' + $scope.createdPass.visitor_area.area_name + '&visitor=' + $scope.createdPass.name + '&interval=From:' + convertToMU($scope.createdPass.timedatefrom) + '-To:' + convertToMU($scope.createdPass.timedateto) + '&vehicles=' + $scope.createdPass.vehicle_number + '&subscriber=' + $scope.subscribername + '&comment=' + $scope.createdPass.comment).then(function (resp) {
        Swal.fire({
          title: 'Awesome!',
          text: 'You shared the access pass by email.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      });
    }

  }





  $scope.accountareas = [];

  var getAccountAreas = function () {
    $scope.residences = [];

    if (isAdmin == true) {
      $http.get(baseURL + "residenceareas")
        .then(function (response) {
          var areasList = response.data;
          angular.forEach(areasList, function (areas, key) {

            $scope.accountareas.push(
              { "area": areas }
            );
          })
        });
    }

    else {
      $http.get(myUser)
        .then(function (response) {

          $http.get(response.data.residence_area).then(function (rea) {
            $scope.accountareas.push(
              { "area": rea.data }
            );
          });

          $http.get(response.data.residence).then(function (res) {
            $scope.residences.push(res.data);
          });

        });
    }
    // // console.log($scope.residences);
  }




  $scope.residentsareas = [];

  var getAccountAreasResidents = function () {

    $http.get(baseURL + "residents")
      .then(function (response) {
        var usersList = response.data;
        angular.forEach(usersList, function (userr, key) {
          $scope.residentsareas.push(
            { "user": userr }
          );
        });
      });
  }


  var initMasterUser = function () {

    $scope.connectionst = [];
    $scope.connections = [];

    // if(isAdmin == true) {

    $http.get(baseURL + "residences").then(function (resp) {
      $scope.residences = resp.data;
    })



    $http.get(baseURL + "visitors")
      .then(function (response2) {
        angular.forEach(response2.data, function (value2, key) {
          var connections = value2;


          var veh = connections.vehicle_number.substring(1, connections.vehicle_number.length - 1);
          var vehicles = veh.split(",");

          var dtt = Date.parse(connections.timedateto);
          if (!dtt || dtt > Date.now()) {
            $scope.connections.push({
              "connection": connections,

              "vehicles": vehicles
            });
          }


          // console.log($scope.connections);
          $rootScope.mainLoading = false;
        });
      });





    // } else {
    //   $http.get(myUser)
    //   .then(function(response) {

    //     var myAreaT = response.data.residence_area.split("/");
    //     var myArea = myAreaT[5];

    //     $http.get(baseURL+"connectionsbyarea/?area="+myArea) 
    //     .then(function(response2) {

    //             angular.forEach(response2.data, function(value2, key){
    //               var connections = value2;

    //               var veh = connections.vehicle_number.substring(1, connections.vehicle_number.length-1);
    //               var vehicles = veh.split(",");

    //               var dtt = Date.parse(connections.timedateto);

    //               if(dtt > Date.now()) {
    //                 $scope.connections.push({
    //                   "connection": connections,

    //                   "vehicles": vehicles
    //                 });
    //               }


    //                 // console.log($scope.connections);
    //                 $rootScope.mainLoading = false;

    //             });});});



    //                 }

    setTimeout(() => {
      $('table').tablePagination({
        perPage: 8,
        initPage: 1,
        position: 'bottom'
      });
    }, 5000);

    getVisitorTypes();

  }





  $scope.setConnection = function (conne) {
    $scope.activeConnection = conne;
    //   console.log(conne);

    //   var head = angular.element(document.querySelector('head'));
    //   head.append("<meta property='og:title' content='"+conne.connection.qr_code+"'/>"); 
    //   head.append("<meta property='og:description' content='"+conne.connection.qr_code+"'/>"); 
    //   head.append("<meta property='og:image' content='"+conne.connection.qr_code+"'/>"); 



  }



  $scope.minDateMoment = moment();
  $scope.minDateString = moment().subtract(1, 'day').format('YYYY-MM-DD');

  $scope.dateFrom;
  $scope.dateTo;

  $scope.savePass = function () {

    if ($scope.name == null || $scope.name == '') {
      Swal.fire({
        text: 'You need to specify a name.',
        confirmButtonText: 'OK'
      });
    } else if ($scope.phone == null || $scope.phone == '') {
      Swal.fire({
        text: 'You need to specify a phone.',
        confirmButtonText: 'OK'
      });
    } else if ($scope.email == null || $scope.email == '') {
      Swal.fire({
        text: 'You need to specify a email.',
        confirmButtonText: 'OK'
      });
    } else if ($scope.user_type == null || $scope.user_type == '') {
      Swal.fire({
        text: 'You need to select user_type.',
        confirmButtonText: 'OK'
      });
    } else if ($scope.isPermanent && !profile_img) {
      Swal.fire({
        text: 'You need to upload image.',
        confirmButtonText: 'OK'
      });
    } else if (!$scope.isPermanent && ($scope.dateFrom == null || $scope.dateFrom == '')) {
      Swal.fire({
        text: 'You need to specify a dateFrom.',
        confirmButtonText: 'OK'
      });
    }
    else if (!$scope.isPermanent && $scope.dateTo == $scope.dateFrom) {
      Swal.fire({
        text: 'Starting date is the same as ending date.',
        confirmButtonText: 'OK'
      });
    }
    else if (!$scope.isPermanent && ($scope.dateTo == null || $scope.dateTo == '')) {
      Swal.fire({
        text: 'You need to specify a dateTo.',
        confirmButtonText: 'OK'
      });
    }
    else if ($scope.resident_area == null || $scope.resident_area == '') {
      Swal.fire({
        text: 'You need to specify a resident_area.',
        confirmButtonText: 'OK'
      });
    } else if ($scope.no_of_guests == 0 || $scope.no_of_guests == null || $scope.no_of_guests == '') {
      Swal.fire({
        text: 'You need to specify number of guests.',
        confirmButtonText: 'OK'
      });
    }



    else {
      var passcode = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
      var tempVehicles = [];
      angular.forEach($scope.vehicle_number, function (resval, key) {
        var res = resval.text.replace('"', '');
        tempVehicles.push(res);
      })

      var newAccessPassfd = new FormData();
      newAccessPassfd.append('name', $scope.name);
      newAccessPassfd.append('phone', $scope.phone);
      newAccessPassfd.append('email', $scope.email);
      newAccessPassfd.append('vehicle_number', '['+tempVehicles.toString()+']');
      newAccessPassfd.append('type', $scope.user_type);
      newAccessPassfd.append('number_of_guests', $scope.no_of_guests);
      newAccessPassfd.append("user", myUser);
      newAccessPassfd.append('residence_area', $scope.resident_area);
      newAccessPassfd.append('code', passcode);
      newAccessPassfd.append('status', baseURL + 'statuses/1/'); 
      newAccessPassfd.append('isPermanent', $scope.isPermanent);
      newAccessPassfd.append('isEnable', true);
      if ($scope.dateFrom) {
        newAccessPassfd.append('timedatefrom', $scope.dateFrom.toISOString());
      }
      if ($scope.dateTo) {
        newAccessPassfd.append('timedateto', $scope.dateTo.toISOString());
      }
      if (profile_img) {
        newAccessPassfd.append('profile_image', profile_img);
      }
      if ($scope.company) {
        newAccessPassfd.append('company', $scope.company);
      }
      if ($scope.comment) {
        newAccessPassfd.append('comment', $scope.comment);
      }

      $http({
        method: 'POST',
        url: baseURL + "visitors/",
        data: newAccessPassfd,
        transformRequest: angular.identity,
        headers: { 'Content-Type': undefined }
      }).then(function (resp) {
        $scope.createdPass = resp.data;
        //   Swal.fire({
        //     title: 'Awesome!',
        //     text: 'You added a new access pass.',
        //     // icon: 'success',
        //     confirmButtonText: 'OK'
        //   });
        $('#shareAfterModal').modal('show');
        $('#myModal').modal('hide');
        $('body').removeClass('modal-open');
        $scope.name = '';
        $scope.phone = '';
        $scope.email = '';
        $scope.company = '';
        $scope.comment = '';
        $scope.user_type = '';
        $scope.dateFrom = '';
        $scope.dateTo = '';
        $scope.vehicle_number = '';
        $scope.no_of_guests = '';
        $scope.resident_area = '';
        $scope.searchresidence = '';
        $scope.connections = [];
        $('.actual-img').val(null);
        $('.placeholder-img').attr('src','dist/img/profile-placeholder.png');
        profile_img = '';
        $scope.isPermanent = false;
        initMasterUser();
        $window.location.reload();
      },
        function (error) {
          $scope.errors = error.data;
          if (error.data.code && error.data.code.length > 0) {
            $scope.savePass();
          };
        });
    }
  }


  $scope.editPass = function () {



    var tempVehicles = [];

    angular.forEach($scope.currentVehicles, function (resval, key) {
      var res = resval.text.replace('"', '');

      tempVehicles.push(res);
    })







    $http({
      method: 'PUT',
      url: $scope.currentAccessPassToEdit.connection.url,
      data: {
        'name': $scope.currentAccessPassToEdit.connection.name,
        'phone': $scope.currentAccessPassToEdit.connection.phone,
        'email': $scope.currentAccessPassToEdit.connection.email,
        'company': $scope.currentAccessPassToEdit.connection.company,
        'comment': $scope.currentAccessPassToEdit.connection.comment,
        'type': $scope.currentAccessPassToEdit.connection.type,
        //   'timedatefrom': $scope.currentAccessPassToEdit.connection.datefrom,
        //   'timedateto': $scope.currentAccessPassToEdit.connection.dateto,
        'vehicle_number': '[' + tempVehicles.toString() + ']',
        'number_of_guests': $scope.currentAccessPassToEdit.connection.number_of_guests,
        //   'resident': $scope.currentAccessPassToEdit.connection.resident,
        'residence_area': $scope.currentAccessPassToEdit.connection.residence_area,

      }
    }).then(function (resp) {
      Swal.fire({
        title: 'Awesome!',
        text: 'You edited the access pass.',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      $('#editconnectionModal').modal('hide');
      $('body').removeClass('modal-open');
      $scope.connections = [];
      // initMasterUser();
      $window.location.reload();
    },
      function (error) {
        $scope.errors = error.data;
        if (error.data.code && error.data.code.length > 0) {
          $scope.savePass();
        };
      });

    //     var datefromed = convertToMUED($scope.currentAccessPassToEdit.connection.timedatefrom);
    // var datetoed = convertToMUED($scope.currentAccessPassToEdit.connection.timedateto);
    // $http({
    //         method: 'PUT',
    //         url: $scope.currentAccessPassToEdit.connection.url, 
    //         data: {
    //           'name': $scope.currentAccessPassToEdit.connection.name,
    //           'phone': $scope.currentAccessPassToEdit.connection.phone,
    //           'email': $scope.currentAccessPassToEdit.connection.email,
    //           'company': $scope.currentAccessPassToEdit.connection.company,
    //           'comment': $scope.currentAccessPassToEdit.connection.comment,
    //           'type': $scope.currentAccessPassToEdit.connection.type,
    //           'timedatefrom': datefromed,
    //           'timedateto': datetoed,
    //           'vehicle_number': '['+tempVehicles.toString()+']',
    //           'number_of_guests': $scope.currentAccessPassToEdit.connection.number_of_guests,
    //         //   'resident': $scope.currentAccessPassToEdit.connection.resident,
    //           'residence_area': $scope.currentAccessPassToEdit.connection.residence_area,

    //       }
    //         }).then(function(resp) {
    //           Swal.fire({
    //             title: 'Awesome!',
    //             text: 'You edited the access type.',
    //             icon: 'success',
    //             confirmButtonText: 'OK'
    //           });
    //           $('#editconnectionModal').modal('hide');
    //           $('body').removeClass('modal-open');
    //           $scope.connections = [];
    //           initMasterUser();
    //         }, 
    //         function(error) {
    //                 $scope.errors = error.data;
    //                 if(error.data.code && error.data.code.length>0) {
    //                   $scope.savePass();
    //                 };
    //         });



  }


});





app.controller('accesstypeCtrl', function ($scope, $rootScope, $http, $window) {

  var myUser = localStorage.getItem('myUser');
  if (myUser == null || myUser.length < 5) {
    window.location = "./";
  }
  var is_child;
  var residence_area;
  var accesstype;
  var usertype;
  var isAdmin;

  $http.get(myUser)
    .then(function (response) {
      // console.log(response);
      is_child = response.data.is_child;
      residence_area = response.data.residence_area;
      accesstype = response.data.accesstype;
      usertype = response.data.usertype;
      if (usertype == baseURL + "appusertype/1/") {
        isAdmin = true;
      } else {
        isAdmin = false;
      }
      $http.get(accesstype)
        .then(function (response) {
          // console.log(response.data);
          $rootScope.myAccessType = response.data;
          if (response.data.can_access_website == false) {
            window.location = "./";
          }
        });

      getAccessTypes();

    });

  var getAccessTypes = function () {
    if (isAdmin == true) {
      $http.get(baseURL + "access_type")
        .then(function (response) {
          $scope.accesstypes = response.data;
        });
    } else {
      $http.get(baseURL + "access_type")
        .then(function (response) {
          $scope.accesstypes = response.data;
        });
    }



  }


  $scope.removeData = function (url) {
    $http({
      method: 'DELETE',
      url: url,
    }).then(function (resp) {
      // // // console.log(resp);
      // getAccessTypes();
      $window.location.reload();
    });
  }


  var myUserIDT = myUser.split("/");
  var myUserID = myUserIDT[5];

  $scope.addAccessType = function () {
    $http({
      method: 'POST',
      url: baseURL + "access_type/",
      data: {
        'main_account': myUserID,
        'access_type': $scope.name,
        'can_access_website': $scope.can_access_website,
        'can_view_dashboard': $scope.can_view_dashboard,
        'can_view_users': $scope.can_view_users,
        'can_edit_users': $scope.can_edit_users,
        'can_view_agents': $scope.can_view_agents,
        'can_edit_agents': $scope.can_edit_agents,
        'can_view_locations': $scope.can_view_locations,
        'can_edit_locations': $scope.can_edit_locations,
        'can_view_connections': $scope.can_view_connections,
        'can_edit_connections': $scope.can_edit_connections,
        'can_view_acces_types': $scope.can_view_acces_types,
        'can_edit_acces_types': $scope.can_edit_acces_types,
        'can_view_visitor_types': $scope.can_view_visitor_types,
        'can_edit_visitor_types': $scope.can_edit_visitor_types,
        'can_view_access_passes': $scope.can_view_access_passes,
        'can_edit_access_passes': $scope.can_edit_access_passes,
        'can_monitor': $scope.can_monitor,
      }
    }).then(function (resp) {
      Swal.fire({
        title: 'Awesome!',
        text: 'You added a new access type.',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      // // // console.log(resp.data);
      $('#myModal').modal('hide');
      $('body').removeClass('modal-open');
      // getAccessTypes();
      $window.location.reload();
    },
      function (error) {
        // // // console.log(error.data);
        $scope.errors = error.data;
      });
  }




  $scope.saveAccessType = function () {
    $http({
      method: 'PUT',
      url: $scope.activeAccessTypeForEdit.url,
      data: {
        'access_type': $scope.activeAccessTypeForEdit.access_type,
        'can_access_website': $scope.activeAccessTypeForEdit.can_access_website,
        'can_view_dashboard': $scope.activeAccessTypeForEdit.can_view_dashboard,
        'can_view_users': $scope.activeAccessTypeForEdit.can_view_users,
        'can_edit_users': $scope.activeAccessTypeForEdit.can_edit_users,
        'can_view_agents': $scope.activeAccessTypeForEdit.can_view_agents,
        'can_edit_agents': $scope.activeAccessTypeForEdit.can_edit_agents,
        'can_view_locations': $scope.activeAccessTypeForEdit.can_view_locations,
        'can_edit_locations': $scope.activeAccessTypeForEdit.can_edit_locations,
        'can_view_connections': $scope.activeAccessTypeForEdit.can_view_connections,
        'can_edit_connections': $scope.activeAccessTypeForEdit.can_edit_connections,
        'can_view_acces_types': $scope.activeAccessTypeForEdit.can_view_acces_types,
        'can_edit_acces_types': $scope.activeAccessTypeForEdit.can_edit_acces_types,
        'can_view_visitor_types': $scope.activeAccessTypeForEdit.can_view_visitor_types,
        'can_edit_visitor_types': $scope.activeAccessTypeForEdit.can_edit_visitor_types,
        'can_view_access_passes': $scope.activeAccessTypeForEdit.can_view_access_passes,
        'can_edit_access_passes': $scope.activeAccessTypeForEdit.can_edit_access_passes,
        'can_monitor': $scope.activeAccessTypeForEdit.can_monitor,
      }
    }).then(function (resp) {
      Swal.fire({
        title: 'Awesome!',
        text: 'You edited the access type.',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      // // // console.log(resp.data);
      $('#editModal').modal('hide');
      $('body').removeClass('modal-open');
      // getAccessTypes();
      $window.location.reload();
    },
      function (error) {
        // // // console.log(error.data);
        $scope.errors = error.data;
      });
  }


  $scope.activeAccessTypeForEdit = [];

  $scope.setActiveAccessType = function (at) {
    $scope.activeAccessTypeForEdit = at;
    // // // console.log(at);
  }




});



app.controller('visitortypeCtrl', function ($scope, $http, $rootScope, $window) {

  var myUser = localStorage.getItem('myUser');
  if (myUser == null || myUser.length < 5) {
    window.location = "./";
  }
  var is_child;
  var residence_area;
  var accesstype;
  var usertype;
  var isAdmin;

  var myUserIDT = myUser.split("/");
  var myUserID = myUserIDT[5];

  $http.get(myUser)
    .then(function (response) {
      // console.log(response);
      is_child = response.data.is_child;
      residence_area = response.data.residence_area;
      accesstype = response.data.accesstype;
      usertype = response.data.usertype;
      if (usertype == baseURL + "appusertype/1/") {
        isAdmin = true;
      } else {
        isAdmin = false;
      }
      $http.get(accesstype)
        .then(function (response) {
          // console.log(response.data);
          $rootScope.myAccessType = response.data;
          if (response.data.can_access_website == false) {
            window.location = "./";
          }
        });

      getVisitorTypes();

    });



  var getVisitorTypes = function () {
    $http.get(baseURL + "visitortypes")
      .then(function (response) {
        $scope.visitortypes = response.data;
      });
  }

  $scope.addVisitorType = function () {
    $http({
      method: 'POST',
      url: baseURL + "visitortypes/",
      data: {
        'visitor_type': $scope.name,
        'user': myUserID,
        'isPermanent': $scope.isPermanent
      }
    }).then(function (resp) {
      Swal.fire({
        title: 'Awesome!',
        text: 'Visitor type added.',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      $('#myModal').modal('hide');
      $('body').removeClass('modal-open');
      getVisitorTypes();
    });
  }






  $scope.removeData = function (url) {
    $http({
      method: 'DELETE',
      url: url,
    }).then(function (resp) {
      // getVisitorTypes();
      $window.location.reload();
    });
  }



  $scope.saveVisitorType = function () {
    $http({
      method: 'PUT',
      url: $scope.activeVisitorTypeForEdit.url,
      data: {
        'visitor_type': $scope.activeVisitorTypeForEdit.visitor_type,
        'isPermanent': $scope.activeVisitorTypeForEdit.isPermanent
      }
    }).then(function (resp) {
      Swal.fire({
        title: 'Awesome!',
        text: 'You edited the visitor type.',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      $('#editModal').modal('hide');
      $('body').removeClass('modal-open');
      $window.location.reload();
    },
      function (error) {
        $scope.errors = error.data;
      });
  }


  $scope.activeVisitorTypeForEdit = [];

  $scope.setActiveVisitorType = function (at) {
    $scope.activeVisitorTypeForEdit = at;
  }

});






app.controller('connectionsCtrl', function ($scope, $http, $rootScope, $window) {

  $rootScope.mainLoading = false;

  var myUser = localStorage.getItem('myUser');
  $scope.myUserArea = localStorage.getItem('myUserArea');
  if (myUser == null || myUser.length < 5) {
    window.location = "./";
  }
  var is_child;
  var residence_area;
  var accesstype;
  var usertype;
  var isAdmin; 
  $scope.recurrance_data = {};

  var currentConnection;
  $scope.setCurrentConnection = function(conn){
    currentConnection = conn;
  } 

  $scope.$on('recurrance_data', function(e, nv) {
    $scope.recurrance_data = nv;
    $scope.setConnectionStatus(currentConnection.url, 'approve', currentConnection.email, currentConnection.passcode, 
                              currentConnection.push_id, currentConnection, $scope.recurrance_data.recurrance_str,
                              $scope.recurrance_data.recurrance_fromTime, $scope.recurrance_data.recurrance_toTime );
  });

  $http.get(myUser)
    .then(function (response) {
      // console.log(response);
      is_child = response.data.is_child;
      residence_area = response.data.residence_area;
      accesstype = response.data.accesstype;
      usertype = response.data.usertype;
      if (usertype == baseURL + "appusertype/1/") {
        $scope.isAdmin = true;
        isAdmin = true;
      } else {
        isAdmin = false;
        $scope.isAdmin = false;
      }
      $http.get(accesstype)
        .then(function (response) {
          // console.log(response.data);
          $rootScope.myAccessType = response.data;
          if (response.data.can_access_website == false) {
            window.location = "./";
          }
        });

      initMasterUser();
      getAccountAreas();
      getVisitorTypes();

    });


  $scope.limit = 24;
  $scope.loadMore = function () {
    $scope.limit = $scope.limit + 12;
  }


  $scope.connections = [];


  $scope.connectionst = [];


  var initMasterUser = function () {

    // if(isAdmin == true) {

    $http.get(baseURL + "residents")
      .then(function (response) {
        $scope.connections = response.data;
        // console.log($scope.connections);

        setTimeout(() => {
          $('table').tablePagination({
            perPage: 8,
            initPage: 1,
            position: 'bottom'
          });
        }, 100);

      });

    // } else {
    //   $http.get(baseURL+"residents")
    //   .then(function(response) {
    //     $scope.connections = response.data;

    //     // console.log($scope.connections);

    //               setTimeout(() => {
    //                 $('table').tablePagination({
    //                   perPage: 8,
    //                   initPage: 1,
    //                   position: 'bottom'
    //               });
    //               }, 100);

    //   });
    // }



  }

  $scope.changestatus = function (changedResident) {
    $http({
      method: 'PUT',
      url: changedResident.url,
      headers: { "Content-Type": "application/json;charset=UTF-8" },
      data:
      {
        "isActive": changedResident.isActive
      }
    }).then(function (resp) {
    }, function (error) {
    });
  }



  $scope.accountareas = [];

  var getAccountAreas = function () {

    if (isAdmin == true) {

      $http.get(baseURL + "residences")
        .then(function (response) {

          $scope.residences = response.data;

          $http.get(baseURL + "residenceareas")
            .then(function (response) {
              var areasList = response.data;
              angular.forEach(areasList, function (areas, key) {

                $scope.accountareas.push(
                  { "area": areas }
                );
              })
            });

        });

    }

    else {
      $http.get(myUser)
        .then(function (response) {

          $http.get(response.data.residence_area)
            .then(function (responser) {

              $scope.accountareas.push(
                { "area": responser.data }
              );

            });

        });
    }


  }




  $scope.setConResToView = function (resid) {
    $scope.currentVehicles = [];
    //  console.log(resid);
    var veh = resid.vehicle_number.substring(1, resid.vehicle_number.length - 1);
    var vehicles = veh.split(",");

    $scope.residentForModal = resid;


    angular.forEach(vehicles, function (veh, key) {
      $scope.currentVehicles.push(
        {
          text: veh
        }
      );
    });
  }

  $scope.printToCart = function (printSectionId) {
    // // // console.log('start printingg');
    var innerContents = document.getElementById(printSectionId).innerHTML;
    var popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="style.css" /></head><body onload="window.print()">' + innerContents + '</html>');
    popupWinindow.document.close();
  }


  $scope.saveEditedResident = function (newresident) {

    var tempVehicles = [];

    angular.forEach($scope.currentVehicles, function (resval, key) {
      var res = resval.text.replace('"', '');

      tempVehicles.push(res);
    })

    $http({
      method: 'PUT',
      url: $scope.residentForModal.url,
      headers: { "Content-Type": "application/json;charset=UTF-8" },
      data:
      {
        "name": $scope.residentForModal.name,
        "phone": $scope.residentForModal.phone,
        "email": $scope.residentForModal.email,
        "address": $scope.residentForModal.address,
        "number_of_resident": $scope.residentForModal.number_of_resident,
        "id_passport_number": $scope.residentForModal.id_passport_number,
        'vehicle_number': '[' + tempVehicles.toString() + ']',
        "residence_area": $scope.residentForModal.residence_area
      }
    }).then(function (resp) {
      Swal.fire({
        title: 'Awesome!',
        text: 'You have edited resident details.',
        icon: 'success',
        confirmButtonText: 'OK'
      });

      $('#viewConModal').modal('hide');
      $('body').removeClass('modal-open');

      //       $scope.connections = [];


      // $scope.connectionst = [];


      //  initMasterUser();

      $window.location.reload();

    }, function (error) {
      Swal.fire({
        title: 'Please check your details.',
        text: 'Address: ' + error.data.address[0],
        icon: 'warning',
        confirmButtonText: 'OK'
      });
    });
  }


  var getVisitorTypes = function () {
    $http.get(baseURL + "visitortypes")
      .then(function (response) {
        $scope.visitortypes = response.data;
      });
  }


  $scope.setConnection = function (connection) {
    $scope.activeConnection = connection;
  }

  var getAppConnectionRequests = function (mur) {
    $http.get(baseURL + "connections/?residence=" + mur)
      .then(function (response) {
        response.data.forEach(d => {
          $scope.connections.push(
            { "connection": d }
          );
        })
      });
  }


  $scope.connectionApprove = function (connection, email, passcode) {

    $scope.connections = [];
    $http({
      method: 'PUT',
      url: connection,
      headers: { "Content-Type": "application/json;charset=UTF-8" },
      data: { "status": "APPROVED" }
    }).then(function (resp) {
      Swal.fire({
        title: 'Awesome!',
        text: 'You have confirmed the connection.',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      $http({
        method: 'POST',
        url: 'contact.php',
        data: {
          subject: 'Here is your passcode',
          emailTo: email,
          message: passcode
        },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).then(function (resp) {
        $scope.connections = [];
        initMasterUser();
      });

    });
  }


  $scope.setConnectionStatus = function (connection, status, email, passcode, push_id, connectionarr, recurrance_str, recurrance_fromTime, recurrance_toTime) {

    if (status == 'reject') {
      $scope.connections = [];
      $http({
        method: 'PUT',
        url: connection,
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        data: { "status": "REJECTED" }
      }).then(function (resp) {
        Swal.fire({
          title: 'Alright!',
          text: 'You have rejected the connection.',
          icon: 'success',
          confirmButtonText: 'OK'
        });

        // $scope.connections = [];
        // initMasterUser();

        $window.location.reload();




      });
    }
    if (status == 'approve') {
      $scope.connections = [];
      $http({
        method: 'PUT',
        url: connection,
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        data: { 
          "status": "APPROVED", 
          "recurrance_str":recurrance_str, 
          "time_from":recurrance_fromTime ? recurrance_fromTime : null, 
          "time_to":recurrance_toTime ? recurrance_toTime: null
        }
      }).then(function (resp) {
        Swal.fire({
          title: 'Awesome!',
          text: 'You have confirmed the connection.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        // $http({
        //   method: 'POST',
        //   url: 'contact.php',
        //   data: {
        //     subject: 'Here is your passcode',
        //     emailTo: email,
        //     message: passcode,
        //     name: connectionarr.name,
        //     email: connectionarr.email,
        //     phone: connectionarr.phone,
        //     location: connectionarr.res_area.area_name,
        //     passport: connectionarr.id_passport_number,
        //     address: connectionarr.address,
        //     vehicle: connectionarr.vehicle_number,
        //     residents: connectionarr.number_of_resident,
        //   },
        //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        // }).then(function (resp) {
        //   $http({
        //     method: 'POST',
        //     url: 'push.php?push_id=' + push_id + '&passcode=' + passcode,
        //     data: {
        //       subject: 'Here is your passcode',
        //       emailTo: email,
        //       message: passcode
        //     },
        //     headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        //   }).then(function (resp) {
        //     // $scope.connections = [];
        //     // initMasterUser();
        //     $window.location.reload();
        //   });
        // });
        $window.location.reload();
      });
    }
    if (status == 'remove') {
      $scope.connections = [];
      $http({
        method: 'DELETE',
        url: connection,
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        data: {}
      }).then(function (resp) {
        Swal.fire({
          title: 'Good!',
          text: 'You have removed the connection.',
          icon: 'success',
          confirmButtonText: 'OK'
        });

        // $scope.connections = [];
        // initMasterUser();
        $window.location.reload();
      });
    }
  }


});

app.factory('Excel', function ($window) {

  return {
    tableToExcel: function (tableId, name) {


      var uri = 'data:application/vnd.ms-excel;base64,'
        ,
        template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>'
        , base64 = function (s) {
          return window.btoa(unescape(encodeURIComponent(s)))
        }
        , format = function (s, c) {
          return s.replace(/{(\w+)}/g, function (m, p) {
            return c[p];
          })
        }
      if (!tableId.nodeType) table = document.getElementById(tableId)
      var ctx = { worksheet: name || 'Worksheet', table: table.innerHTML }
      var a = document.createElement('a');
      a.href = uri + base64(format(template, ctx))
      a.download = name + '.xls';
      a.click();
    }
  };
});



app.controller('monitorCtrl', function ($scope, $http, $interval, $rootScope, Excel, $timeout, $window) {

  $rootScope.mainLoading = false;

  var myUser = localStorage.getItem('myUser');
  if (myUser == null || myUser.length < 5) {
    window.location = "./";
  }
  var is_child;
  var residence_area;
  var accesstype;
  var usertype;
  var isAdmin;

  $http.get(myUser)
    .then(function (response) {
      // console.log(response);
      is_child = response.data.is_child;
      residence_area = response.data.residence_area;
      accesstype = response.data.accesstype;
      usertype = response.data.usertype;
      if (usertype == baseURL + "appusertype/1/") {
        isAdmin = true;
      } else {
        isAdmin = false;
      }
      $http.get(accesstype)
        .then(function (response) {
          // console.log(response.data);
          $rootScope.myAccessType = response.data;
          if (response.data.can_access_website == false) {
            window.location = "./";
          }
        });

      getVisitorTypes();
      initMasterUser();


    });

  $scope.limit = 12;
  $scope.loadMore = function () {
    $scope.limit = $scope.limit + 12;
  }




  $scope.inout = [];

  var getVisitorTypes = function () {
    $http.get(baseURL + "visitortypes")
      .then(function (response) {
        $scope.visitortypes = response.data;
        // // // console.log($scope.visitortypes);
      });


  }



  $scope.exportAsXls = function () {

    var exportHref = Excel.tableToExcel('exportable', 'DataExported');
    // $timeout(function(){location.href=exportHref;},100);



  };


  $scope.connections = [];



  var initMasterUser = function () {

    if (isAdmin == true) {
      $http.get(baseURL + "inouts")
        .then(function (response) {
          $scope.connections = response.data;

          setTimeout(() => {
            $('.monitortable').tablePagination({
              perPage: 8,
              initPage: 1,
              position: 'bottom'
            });
          }, 100);

        });
    } else {

    }

  }

  $scope.setConToView = function (con) {
    $scope.conToV = con;
  }




  // var initMasterUser = function() {

  //   if(isAdmin == true) {


  //     $http.get(baseURL+"visitors")
  //     .then(function(response) {
  //       angular.forEach(response.data, function(value2, key){
  //         var connection = value2;
  //         $http.get(connection.type)
  //         .then(function(response) {
  //           var type = response.data.visitor_type;
  //           $http.get(connection.status)
  //           .then(function(response) {
  //             var status = response.data.name;


  //             if(connection.resident != null) {
  //             $http.get(connection.resident)
  //             .then(function(response) {
  //               var resident = response.data;
  //               $http.get(connection.residence_area)
  //               .then(function(response) {
  //                 var residence = response.data;
  //                 $http.get(residence.residence)
  //               .then(function(response) {
  //                 var resdat = response.data;
  //                 if(connection.checkin_agent == null) {

  //                 } else if(connection.checkout_agent == null) {
  //                   $http.get(connection.checkin_agent)
  //                   .then(function(response) {
  //                     var checkin_agent = response.data;

  //                         $scope.connections.push({
  //                           "connection": connection,
  //                           "type": type,
  //                           "status": status,
  //                           "resident": resident,
  //                           "residence": residence,
  //                           "checkin_agent": checkin_agent,
  //                           "checkout_agent": null,
  //                           "resdat": resdat
  //                         });
  //                   });
  //                 } else {
  //                   $http.get(connection.checkin_agent)
  //                   .then(function(response) {
  //                     var checkin_agent = response.data;
  //                     $http.get(connection.checkout_agent)
  //                     .then(function(response) {
  //                       var checkout_agent = response.data;

  //                         $scope.connections.push({
  //                           "connection": connection,
  //                           "type": type,
  //                           "status": status,
  //                           "resident": resident,
  //                           "residence": residence,
  //                           "checkin_agent": checkin_agent,
  //                           "checkout_agent": checkout_agent,
  //                           "resdat": resdat
  //                         });

  //                         $scope.connections.push({
  //                           "connection": connection,
  //                           "type": type,
  //                           "status": status,
  //                           "resident": resident,
  //                           "residence": residence,
  //                           "checkin_agent": checkin_agent,
  //                           "checkout_agent": null,
  //                           "resdat": resdat
  //                         });

  //                         $rootScope.mainLoading = false;
  //                     });
  //                   });

  //                 }
  //               });
  //             });
  //             });
  //             } else if(connection.user != null) {
  //             $http.get(connection.user)
  //             .then(function(response) {
  //               var resident = response.data;
  //               $http.get(connection.residence_area)
  //               .then(function(response) {
  //                 var residence = response.data;
  //                 $http.get(residence.residence)
  //               .then(function(response) {
  //                 var resdat = response.data;
  //                 if(connection.checkin_agent == null) {

  //                 } else if(connection.checkout_agent == null) {
  //                   $http.get(connection.checkin_agent)
  //                   .then(function(response) {
  //                     var checkin_agent = response.data;

  //                         $scope.connections.push({
  //                           "connection": connection,
  //                           "type": type,
  //                           "status": status,
  //                           "resident": resident,
  //                           "residence": residence,
  //                           "checkin_agent": checkin_agent,
  //                           "checkout_agent": null,
  //                           "resdat": resdat
  //                         });
  //                   });
  //                 } else {
  //                   $http.get(connection.checkin_agent)
  //                   .then(function(response) {
  //                     var checkin_agent = response.data;
  //                     $http.get(connection.checkout_agent)
  //                     .then(function(response) {
  //                       var checkout_agent = response.data;

  //                         $scope.connections.push({
  //                           "connection": connection,
  //                           "type": type,
  //                           "status": status,
  //                           "resident": resident,
  //                           "residence": residence,
  //                           "checkin_agent": checkin_agent,
  //                           "checkout_agent": checkout_agent,
  //                           "resdat": resdat
  //                         });

  //                         $scope.connections.push({
  //                           "connection": connection,
  //                           "type": type,
  //                           "status": status,
  //                           "resident": resident,
  //                           "residence": residence,
  //                           "checkin_agent": checkin_agent,
  //                           "checkout_agent": null,
  //                           "resdat": resdat
  //                         });

  //                         $rootScope.mainLoading = false;
  //                     });
  //                   });

  //                 }
  //               });
  //             });
  //             });
  //           }











  //           });
  //         });
  //       })
  //     });


  // } else {


  //   $http.get(myUser).then(function(mu) {
  //     var resdat = '';
  //     var masterResidenceURL = mu.data.residence;
  //     $http.get(masterResidenceURL).then(function(rd) {
  //       resdat = rd.data;
  //     });
  //     var masterAreaURL = mu.data.residence_area;
  //     var myAreaT = masterAreaURL.split("/");
  //     var myArea = myAreaT[5];
  //     $http.get(baseURL+"connectionsbyarea/?area="+myArea)
  //     .then(function(response) {
  //       angular.forEach(response.data, function(value2, key){
  //         var connection = value2;
  //         $http.get(connection.type)
  //         .then(function(response) {
  //           var type = response.data.visitor_type;
  //           $http.get(connection.status)
  //           .then(function(response) {
  //             var status = response.data.name;

  //             if(connection.resident != null) {

  //             $http.get(connection.resident)
  //             .then(function(response) {
  //               var resident = response.data;
  //               $http.get(connection.residence_area)
  //               .then(function(response) {
  //                 var residence = response.data;
  //                 if(connection.checkin_agent == null) {

  //                 } else if(connection.checkout_agent == null) {
  //                   $http.get(connection.checkin_agent)
  //                   .then(function(response) {
  //                     var checkin_agent = response.data;

  //                         $scope.connections.push({
  //                           "connection": connection,
  //                           "type": type,
  //                           "status": status,
  //                           "resident": resident,
  //                           "residence": residence,
  //                           "checkin_agent": checkin_agent,
  //                           "checkout_agent": null,
  //                           "resdat": resdat
  //                         });
  //                   });
  //                 } else {
  //                   $http.get(connection.checkin_agent)
  //                   .then(function(response) {
  //                     var checkin_agent = response.data;
  //                     $http.get(connection.checkout_agent)
  //                     .then(function(response) {
  //                       var checkout_agent = response.data;

  //                         $scope.connections.push({
  //                           "connection": connection,
  //                           "type": type,
  //                           "status": status,
  //                           "resident": resident,
  //                           "residence": residence,
  //                           "checkin_agent": checkin_agent,
  //                           "checkout_agent": checkout_agent,
  //                           "resdat": resdat
  //                         });

  //                         $scope.connections.push({
  //                           "connection": connection,
  //                           "type": type,
  //                           "status": status,
  //                           "resident": resident,
  //                           "residence": residence,
  //                           "checkin_agent": checkin_agent,
  //                           "checkout_agent": null,
  //                           "resdat": resdat
  //                         });
  //                         $rootScope.mainLoading = false;
  //                     });
  //                   });                          
  //                 }
  //               });
  //             });

  //             } else if(connection.user != null) {

  //             $http.get(connection.user)
  //             .then(function(response) {
  //               var resident = response.data;
  //               $http.get(connection.residence_area)
  //               .then(function(response) {
  //                 var residence = response.data;
  //                 if(connection.checkin_agent == null) {

  //                 } else if(connection.checkout_agent == null) {
  //                   $http.get(connection.checkin_agent)
  //                   .then(function(response) {
  //                     var checkin_agent = response.data;

  //                         $scope.connections.push({
  //                           "connection": connection,
  //                           "type": type,
  //                           "status": status,
  //                           "resident": resident,
  //                           "residence": residence,
  //                           "checkin_agent": checkin_agent,
  //                           "checkout_agent": null,
  //                           "resdat": resdat
  //                         });
  //                   });
  //                 } else {
  //                   $http.get(connection.checkin_agent)
  //                   .then(function(response) {
  //                     var checkin_agent = response.data;
  //                     $http.get(connection.checkout_agent)
  //                     .then(function(response) {
  //                       var checkout_agent = response.data;

  //                         $scope.connections.push({
  //                           "connection": connection,
  //                           "type": type,
  //                           "status": status,
  //                           "resident": resident,
  //                           "residence": residence,
  //                           "checkin_agent": checkin_agent,
  //                           "checkout_agent": checkout_agent,
  //                           "resdat": resdat
  //                         });

  //                         $scope.connections.push({
  //                           "connection": connection,
  //                           "type": type,
  //                           "status": status,
  //                           "resident": resident,
  //                           "residence": residence,
  //                           "checkin_agent": checkin_agent,
  //                           "checkout_agent": null,
  //                           "resdat": resdat
  //                         });
  //                         $rootScope.mainLoading = false;
  //                     });
  //                   });                          
  //                 }
  //               });
  //             });

  //             }




  //           });
  //         });
  //       })
  //     });

  //   });





  // }


  // }






});




app.controller('usersCtrl', function ($scope, $http, $rootScope, $window) {

  var myUser = localStorage.getItem('myUser');
  if (myUser == null || myUser.length < 5) {
    window.location = "./";
  }
  $scope.agents = [];
  $scope.myUser;

  var myUser = localStorage.getItem('myUser');
  $scope.myUserArea = localStorage.getItem('myUserArea');
  var is_child;
  var residence_area;
  var accesstype;
  var usertype;
  var isAdmin;

  $http.get(myUser)
    .then(function (response) {
      // console.log(response);
      is_child = response.data.is_child;
      residence_area = response.data.residence_area;
      accesstype = response.data.accesstype;
      usertype = response.data.usertype;
      if (usertype == baseURL + "appusertype/1/") {
        isAdmin = true;
        $scope.isAdmin = true;
      } else {
        isAdmin = false;
        $scope.isAdmin = false;
      }
      $http.get(accesstype)
        .then(function (response) {
          // console.log(response.data);
          $rootScope.myAccessType = response.data;
          if (response.data.can_access_website == false) {
            window.location = "./";
          }
        });

      initMasterUser();
      getAccountAreas();
      getMyUser();
      getAppUserTypes();
      getAppUserAccessTypes();


    });


  $scope.areas = [];

  $scope.removeData = function (url, name, email) {
    $http({
      method: 'DELETE',
      url: url,
    }).then(function (resp) {
      // // // console.log(resp);
      $http({
        method: 'POST',
        url: 'contact_remove.php',
        data: {
          subject: 'User removal',
          email: email,
          name: name
        },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).then(function (resp) {
        // $scope.appusers = [];
        // getMyUser();
        $window.location.reload();
      });
    });
  }

  $scope.limit = 12;
  $scope.loadMore = function () {
    $scope.limit = $scope.limit + 12;
  }




  $scope.searchedAreas = [];


  $scope.selectAreasByResidence = function (res) {
    $scope.accountareas = [];
    var myResidenceT = res.split("/");
    var myResidence = myResidenceT[5];
    $http.get(baseURL + "areasbyresidence/?residence=" + myResidence)
      .then(function (responseareas) {
        angular.forEach(responseareas.data, function (areas, key) {
          $scope.accountareas.push(
            { "area": areas }
          );
        })
      });
  }


  var initMasterUser = function () {
    $scope.residences = [];

    if (isAdmin == true) {
      $http.get(baseURL + "residences")
        .then(function (response) {
          $scope.residences = response.data;
        });
    } else {
      $http.get(myUser)
        .then(function (response) {
          $http.get(response.data.residence)
            .then(function (responsez) {
              $scope.residences.push(responsez.data);
            });
        });
    }

  }




  $scope.accountareas = [];

  var getAccountAreas = function () {

    if (isAdmin == true) {

      $http.get(baseURL + "residenceareas")
        .then(function (response) {
          var areasList = response.data;
          angular.forEach(areasList, function (areas, key) {
            $scope.accountareas.push(
              { "area": areas }
            );
          })
        });
    }

    else {
      $http.get(myUser)
        .then(function (response) {

          $http.get(response.data.residence_area)
            .then(function (responser) {

              $scope.accountareas.push(
                { "area": responser.data }
              );

            });

        });
    }


  }




  var getMyUser = function () {
    $http.get(myUser)
      .then(function (response) {
        $scope.myUser = response.data;
        var myUserIDT = $scope.myUser.url.split("/");
        var myUserID = myUserIDT[5];
        getUsers(myUserID);
      });

  }


  $scope.baseURL = baseURL;


  var getUsers = function (mur) {
    $scope.appusers = [];

    // if(isAdmin == true) {
    // // console.log('hereezzzz i ammmm');
    $http.get(baseURL + "appuser")
      .then(function (response) {
        $scope.appusers = response.data;
        // // console.log(response);
        // response.data.forEach(d=> {
        //   if(d.usertype != null && d.usertype != baseURL+'appusertype/3/') {
        //     $http.get(d.usertype)
        //   .then(function(res) {
        //     // $scope.areaToSave = d.residence_area;
        //            $scope.appusers.push(
        //                 {"user": d,
        //               "type": res.data}
        //               );

        //   });
        //   }

        //       })
        setTimeout(() => {
          $('table').tablePagination({
            perPage: 8,
            initPage: 1,
            position: 'bottom'
          });
        }, 100);
      });
    // } else {
    //   // // console.log('heree i ammmm');
    //   $http.get(myUser)
    // .then(function(response) {
    //   $scope.myUser = response.data;
    //   var myUserIDT = $scope.myUser.url.split("/");
    //   var mas = myUserIDT[5];
    //   var myUserIDTA = response.data.residence_area.split("/");
    //   var masa = myUserIDTA[5];
    //   $http.get(baseURL+"appusersbyarea/?area="+masa)
    //   .then(function(response) {
    //     response.data.forEach(d=> {
    //       if(d.usertype != null && d.usertype != baseURL+'appusertype/3/') {
    //       $http.get(d.usertype)
    //       .then(function(res) {
    //                $scope.appusers.push(
    //                     {"user": d,
    //                   "type": res.data}
    //                   );

    //       });
    //     }
    //           })
    //           setTimeout(() => {
    //             $('table').tablePagination({
    //               perPage: 8,
    //               initPage: 1,
    //               position: 'bottom'
    //           });
    //           }, 2000);
    //   });
    // });
    // }
  }




  var getAppUserTypes = function () {
    $http.get(baseURL + "appusertype")
      .then(function (response) {
        $scope.appusertypes = response.data;
      });
  }


  var getAppUserAccessTypes = function () {
    $http.get(baseURL + "access_type")
      .then(function (response) {
        $scope.accesstypes = response.data;
        // // // console.log(response);
      });
  }


  $scope.openNewUserModal = function () {
    $scope.finalAreas = [];
    $scope.query = '';
    $scope.searchedAreas = [];
    $scope.searchresidence = null;
  }

  $scope.userarea = [];
  $scope.userresidence = [];

  $scope.addUserz = function (usertype, accesstype, areatoo) {
    // console.log('area: ',areatoo);
  }


  $scope.addUser = function (usertype, accesstype, areatoo, residencetoo) {

    //  console.log(areatoo, $scope.userarea.areaToSave);

    $http.get(areatoo)
      .then(function (response) {
        $scope.areaname = response.data.area_name;
        // console.log($scope.areaname);




        var passcode = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);

        var myUserIDT = $scope.myUser.url.split("/");
        var myUserID = myUserIDT[5];

        if (
          !$scope.name ||
          !$scope.email ||
          !$scope.phone ||
          !$scope.passport ||
          !$scope.vehicle ||
          !$scope.address ||
          $scope.usertype == null ||
          $scope.accesstype == null) {
          Swal.fire({
            title: 'Please check your details.',
            text: 'You got to fill in all the fields.',
            icon: 'warning',
            confirmButtonText: 'OK'
          });
        } else {


          $http({
            method: 'POST',
            url: baseURL + "appuser/",
            data: {
              'name': $scope.name,
              'email': $scope.email,
              'phone': $scope.phone,
              'id_passport_number': $scope.passport,
              'vehicle_number': $scope.vehicle,
              'address': $scope.address,
              'passcode': passcode,
              'usertype': $scope.usertype,
              'accesstype': $scope.accesstype,
              'is_child': true,
              'parent_user': myUserID,
              'parent_user_url': $scope.myUser.url,
              'residence': residencetoo,
              'residence_area': areatoo
            }
          }).then(function (resp) {


            $http({
              method: 'POST',
              url: 'contact_user.php',
              data: {
                subject: 'Here is your passcode',
                emailTo: $scope.email,
                message: passcode,
                name: $scope.name,
                email: $scope.email,
                phone: $scope.phone,
                address: $scope.address,
                vehicle: $scope.vehicle,
                location: $scope.areaname


              },
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).then(function (resp) {


              $scope.name = '';
              $scope.email = '';
              $scope.phone = '';
              $scope.passport = '';
              $scope.vehicle = '';
              $scope.address = '';
              $scope.usertype = null;
              $scope.accesstype = null;
              $('#myModal').modal('hide');
              $('body').removeClass('modal-open');
              // getMyUser();
              $window.location.reload();
              Swal.fire({
                title: 'Awesome!',
                text: 'User profile is created.',
                icon: 'success',
                confirmButtonText: 'OK'
              });


            });


          },
            function (error) {
              // // // console.log(error.data);
              if (error.data.passcode && error.data.passcode.length > 0) {
                $scope.addUser();
              };
              if (error.data.email && error.data.email.length > 0) {
                Swal.fire({
                  title: 'Please check your details.',
                  text: error.data.email[0],
                  icon: 'warning',
                  confirmButtonText: 'OK'
                });
              };
            });
        }





      });




  }


  $scope.finalAreas = [];
  $scope.query = '';

  $scope.usertordit = [];
  $scope.selectUserToEdit = function (usertoedit) {
    $scope.finalAreas = [];
    $scope.query = '';
    $scope.searchedAreas = [];
    $scope.searchresidence = null;
    // // // console.log(usertoedit);
    $scope.usertordit = usertoedit;
    //  // // console.log(usertoedit);
    var myUserAT = usertoedit.url.split("/");
    var myUserA = myUserAT[5];
    $http.get(baseURL + "appuserassignedareas/?user=" + myUserA)
      .then(function (responseareas) {


        angular.forEach(responseareas.data, function (resdata, key) {

          $http.get(resdata.residence_area)
            .then(function (resp) {

              $scope.finalAreas.push({
                "name": resp.data.area_name,
                "url": responseareas.data.url
              });

            });


        });


      });
  }

  $scope.saveEditedUser = function (newuser) {
    $http({
      method: 'PUT',
      url: $scope.usertordit.url,
      headers: { "Content-Type": "application/json;charset=UTF-8" },
      data: {
        "name": newuser.name,
        "phone": newuser.phone,
        "email": newuser.email,
        "passcode": newuser.passcode,
        "id_passport_number": newuser.id_passport_number,
        "vehicle_number": newuser.vehicle_number,
        "address": newuser.address,
        "usertype": newuser.usertype,
        "accesstype": newuser.accesstype,
        'residence': newuser.residence,
        "residence_area": newuser.residence_area,
      }
    }).then(function (resp) {
      Swal.fire({
        title: 'Awesome!',
        text: 'You have edited the user details.',
        icon: 'success',
        confirmButtonText: 'OK'
      });


      $('#editModal').modal('hide');
      $('body').removeClass('modal-open');
      $window.location.reload();

      // var myUserAT = $scope.usertordit.user.url.split("/");
      // var myUserA = myUserAT[5];

      // $http.get(baseURL+"appuserassignedareas/?user="+myUserA) 
      //   .then(function(responseareas) {


      //     angular.forEach(responseareas.data, function(resdata, key){

      //       $http({
      //         method: 'DELETE',
      //         url: resdata.url,
      //         }).then(function(resp) { 
      //         });

      //     });

      //   });



      // angular.forEach($scope.finalAreas, function(farea, key){

      //   $http({
      //     method: 'POST',
      //     url: baseURL+"user_assigned_areas/",
      //     data: {
      //       'user': resp.data.url,
      //       'residence_area': farea.url}
      //     }).then(function(resp) {

      //     });
      // });
    });
  }

});





app.controller('agentsCtrl', function ($scope, $http, $rootScope, $window) {

  var myUser = localStorage.getItem('myUser');
  if (myUser == null || myUser.length < 5) {
    window.location = "./";
  }
  $scope.agents = [];
  $scope.myUser;

  var myUser = localStorage.getItem('myUser');
  $scope.myUserArea = localStorage.getItem('myUserArea');
  var is_child;
  var residence_area;
  var accesstype;
  var usertype;
  var isAdmin;

  $http.get(myUser)
    .then(function (response) {
      // console.log(response);
      is_child = response.data.is_child;
      residence_area = response.data.residence_area;
      accesstype = response.data.accesstype;
      usertype = response.data.usertype;
      if (usertype == baseURL + "appusertype/1/") {
        isAdmin = true;
        $scope.isAdmin = true;
      } else {
        isAdmin = false;
        $scope.isAdmin = false;
      }
      $http.get(accesstype)
        .then(function (response) {
          // console.log(response.data);
          $rootScope.myAccessType = response.data;
          if (response.data.can_access_website == false) {
            window.location = "./";
          }
        });

      initMasterUser();
      getAccountAreas();
      getMyUser();
      getAppUserTypes();
      getAppUserAccessTypes();


    });


  $scope.areas = [];

  $scope.removeData = function (url, name, email) {
    $http({
      method: 'DELETE',
      url: url,
    }).then(function (resp) {
      // // // console.log(resp);
      $http({
        method: 'POST',
        url: 'contact_remove.php',
        data: {
          subject: 'User removal',
          email: email,
          name: name
        },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).then(function (resp) {
        $scope.appusers = [];
        // getMyUser();
        $window.location.reload();
      });
    });
  }

  $scope.limit = 12;
  $scope.loadMore = function () {
    $scope.limit = $scope.limit + 12;
  }




  $scope.searchedAreas = [];


  $scope.selectAreasByResidence = function (res) {
    $scope.accountareas = [];
    var myResidenceT = res.split("/");
    var myResidence = myResidenceT[5];
    $http.get(baseURL + "areasbyresidence/?residence=" + myResidence)
      .then(function (responseareas) {
        angular.forEach(responseareas.data, function (areas, key) {
          $scope.accountareas.push(
            { "area": areas }
          );
        })
      });
  }


  var initMasterUser = function () {
    $scope.residences = [];

    if (isAdmin == true) {
      $http.get(baseURL + "residences")
        .then(function (response) {
          $scope.residences = response.data;
        });
    } else {
      $http.get(myUser)
        .then(function (response) {
          $http.get(response.data.residence)
            .then(function (responsez) {
              $scope.residences.push(responsez.data);
            });
        });
    }

  }




  $scope.accountareas = [];

  var getAccountAreas = function () {

    if (isAdmin == true) {

      $http.get(baseURL + "residenceareas")
        .then(function (response) {
          var areasList = response.data;
          angular.forEach(areasList, function (areas, key) {
            $scope.accountareas.push(
              { "area": areas }
            );
          })
        });
    }

    else {
      $http.get(myUser)
        .then(function (response) {

          $http.get(response.data.residence_area)
            .then(function (responser) {

              $scope.accountareas.push(
                { "area": responser.data }
              );

            });

        });
    }


  }




  var getMyUser = function () {
    $http.get(myUser)
      .then(function (response) {
        $scope.myUser = response.data;
        var myUserIDT = $scope.myUser.url.split("/");
        var myUserID = myUserIDT[5];
        getUsers(myUserID);
      });

  }


  $scope.baseURL = baseURL;


  var getUsers = function (mur) {
    $scope.appusers = [];

    // if(isAdmin == true) {
    // // console.log('hereezzzz i ammmm');
    $http.get(baseURL + "appuser")
      .then(function (response) {
        $scope.appusers = response.data;
        // // console.log(response);
        // response.data.forEach(d=> {
        //   if(d.usertype != null && d.usertype != baseURL+'appusertype/3/') {
        //     $http.get(d.usertype)
        //   .then(function(res) {
        //     // $scope.areaToSave = d.residence_area;
        //            $scope.appusers.push(
        //                 {"user": d,
        //               "type": res.data}
        //               );

        //   });
        //   }

        //       })
        setTimeout(() => {
          $('table').tablePagination({
            perPage: 8,
            initPage: 1,
            position: 'bottom'
          });
        }, 100);
      });
    // } else {
    //   // // console.log('heree i ammmm');
    //   $http.get(myUser)
    // .then(function(response) {
    //   $scope.myUser = response.data;
    //   var myUserIDT = $scope.myUser.url.split("/");
    //   var mas = myUserIDT[5];
    //   var myUserIDTA = response.data.residence_area.split("/");
    //   var masa = myUserIDTA[5];
    //   $http.get(baseURL+"appusersbyarea/?area="+masa)
    //   .then(function(response) {
    //     response.data.forEach(d=> {
    //       if(d.usertype != null && d.usertype != baseURL+'appusertype/3/') {
    //       $http.get(d.usertype)
    //       .then(function(res) {
    //                $scope.appusers.push(
    //                     {"user": d,
    //                   "type": res.data}
    //                   );

    //       });
    //     }
    //           })
    //           setTimeout(() => {
    //             $('table').tablePagination({
    //               perPage: 8,
    //               initPage: 1,
    //               position: 'bottom'
    //           });
    //           }, 2000);
    //   });
    // });
    // }
  }




  var getAppUserTypes = function () {
    $http.get(baseURL + "appusertype")
      .then(function (response) {
        $scope.appusertypes = response.data;
      });
  }


  var getAppUserAccessTypes = function () {
    $http.get(baseURL + "access_type")
      .then(function (response) {
        $scope.accesstypes = response.data;
        // // // console.log(response);
      });
  }


  $scope.openNewUserModal = function () {
    $scope.finalAreas = [];
    $scope.query = '';
    $scope.searchedAreas = [];
    $scope.searchresidence = null;
  }

  $scope.userarea = [];
  $scope.userresidence = [];

  $scope.addUserz = function (usertype, accesstype, areatoo) {
    // console.log('area: ',areatoo);
  }


  $scope.addUser = function (usertype, accesstype, areatoo, residencetoo) {

    //  console.log(areatoo, $scope.userarea.areaToSave);

    $http.get(areatoo)
      .then(function (response) {
        $scope.areaname = response.data.area_name;
        // console.log($scope.areaname);




        // var passcode = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);

        var myUserIDT = $scope.myUser.url.split("/");
        var myUserID = myUserIDT[5];

        if (
          !$scope.name ||
          !$scope.email ||
          !$scope.phone ||
          !$scope.passport ||
          !$scope.vehicle ||
          !$scope.address) {
          Swal.fire({
            title: 'Please check your details.',
            text: 'You got to fill in all the fields.',
            icon: 'warning',
            confirmButtonText: 'OK'
          });
        } else {


          $http({
            method: 'POST',
            url: baseURL + "appuser/",
            data: {
              'name': $scope.name,
              'email': $scope.email,
              'phone': $scope.phone,
              'id_passport_number': $scope.passport,
              'vehicle_number': $scope.vehicle,
              'address': $scope.address,
              'passcode': $scope.passcode,
              'usertype': baseURL + 'appusertype/3/',
              // 'accesstype': $scope.accesstype,
              'is_child': true,
              'parent_user': myUserID,
              'parent_user_url': $scope.myUser.url,
              'residence': residencetoo,
              'residence_area': areatoo
            }
          }).then(function (resp) {


            $http({
              method: 'POST',
              url: 'contact_user.php',
              data: {
                subject: 'Here is your passcode',
                emailTo: $scope.email,
                message: passcode,
                name: $scope.name,
                email: $scope.email,
                phone: $scope.phone,
                address: $scope.address,
                vehicle: $scope.vehicle,
                location: $scope.areaname


              },
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).then(function (resp) {


              $scope.name = '';
              $scope.email = '';
              $scope.phone = '';
              $scope.passport = '';
              $scope.vehicle = '';
              $scope.address = '';
              $scope.usertype = null;
              $scope.accesstype = null;
              $('#myModal').modal('hide');
              $('body').removeClass('modal-open');
              // getMyUser();
              $window.location.reload();
              Swal.fire({
                title: 'Awesome!',
                text: 'User profile is created.',
                icon: 'success',
                confirmButtonText: 'OK'
              });


            });


          },
            function (error) {
              // // // console.log(error.data);
              if (error.data.passcode && error.data.passcode.length > 0) {
                $scope.addUser();
              };
              if (error.data.email && error.data.email.length > 0) {
                Swal.fire({
                  title: 'Please check your details.',
                  text: error.data.email[0],
                  icon: 'warning',
                  confirmButtonText: 'OK'
                });
              };
            });
        }





      });




  }


  $scope.finalAreas = [];
  $scope.query = '';

  $scope.usertordit = [];
  $scope.selectUserToEdit = function (usertoedit) {
    $scope.finalAreas = [];
    $scope.query = '';
    $scope.searchedAreas = [];
    $scope.searchresidence = null;
    // // // console.log(usertoedit);
    $scope.usertordit = usertoedit;
    //  // // console.log(usertoedit);
    var myUserAT = usertoedit.url.split("/");
    var myUserA = myUserAT[5];
    $http.get(baseURL + "appuserassignedareas/?user=" + myUserA)
      .then(function (responseareas) {


        angular.forEach(responseareas.data, function (resdata, key) {

          $http.get(resdata.residence_area)
            .then(function (resp) {

              $scope.finalAreas.push({
                "name": resp.data.area_name,
                "url": responseareas.data.url
              });

            });


        });


      });
  }

  $scope.saveEditedUser = function (newuser) {
    $http({
      method: 'PUT',
      url: $scope.usertordit.url,
      headers: { "Content-Type": "application/json;charset=UTF-8" },
      data: {
        "name": newuser.name,
        "phone": newuser.phone,
        "email": newuser.email,
        "passcode": newuser.passcode,
        "id_passport_number": newuser.id_passport_number,
        "vehicle_number": newuser.vehicle_number,
        "address": newuser.address,
        "usertype": newuser.usertype,
        "accesstype": newuser.accesstype,
        'residence': newuser.residence,
        "residence_area": newuser.residence_area,
      }
    }).then(function (resp) {
      Swal.fire({
        title: 'Awesome!',
        text: 'You have edited the user details.',
        icon: 'success',
        confirmButtonText: 'OK'
      });


      $('#editModal').modal('hide');
      $('body').removeClass('modal-open');
      $window.location.reload();

      // var myUserAT = $scope.usertordit.user.url.split("/");
      // var myUserA = myUserAT[5];

      // $http.get(baseURL+"appuserassignedareas/?user="+myUserA) 
      //   .then(function(responseareas) {


      //     angular.forEach(responseareas.data, function(resdata, key){

      //       $http({
      //         method: 'DELETE',
      //         url: resdata.url,
      //         }).then(function(resp) { 
      //         });

      //     });

      //   });



      // angular.forEach($scope.finalAreas, function(farea, key){

      //   $http({
      //     method: 'POST',
      //     url: baseURL+"user_assigned_areas/",
      //     data: {
      //       'user': resp.data.url,
      //       'residence_area': farea.url}
      //     }).then(function(resp) {

      //     });
      // });
    });
  }


});





app.controller('accessCtrl', function ($scope, $rootScope, $http) {
  var myUser = localStorage.getItem('myUser');
  if (myUser != null && myUser != 'null') {
    if (myUser.length > 5) {
      $http.get(myUser)
        .then(function (response) {
          // console.log(response);
          accesstype = response.data.accesstype;
          $http.get(accesstype)
            .then(function (response) {
              // console.log(response.data);
              $rootScope.myAccessType = response.data;
              if (response.data.can_access_website == false) {
                window.location = "./";
              } else if (response.data.can_view_dashboard == true) {
                window.location = "./home.html";
              } else if (response.data.can_view_locations == true) {
                window.location = "./home.html#!/locations";
              } else if (response.data.can_view_users == true) {
                window.location = "./home.html#!/users";
              } else if (response.data.can_view_agents == true) {
                window.location = "./home.html#!/agents";
              } else if (response.data.can_view_visitor_types == true) {
                window.location = "./home.html#!/visitortype";
              } else if (response.data.can_view_acces_types == true) {
                window.location = "./home.html#!/accesstype";
              } else if (response.data.can_view_connections == true) {
                window.location = "./home.html#!/connections";
              } else if (response.data.can_view_access_passes == true) {
                window.location = "./home.html#!/accesspass";
              } else if (response.data.can_monitor == true) {
                window.location = "./home.html#!/monitor";
              } else {
                //   window.location = "home.html"; 
              }
            });



        });
    }
  }


  var accesstype;


  $scope.login = function (email, password) {
    $http.get(baseURL + "loginappuser/?email=" + email + "&passcode=" + password)
      .then(function (response) {
        $scope.loggeduser = response.data;
        // console.log(response.data);



        if (response.data.length > 0) {


          if (response.data[0].accesstype == null) {
            Swal.fire({
              title: 'You don\'t have the rights to access this app',
              // text: 'There is no user with your details.',
              // icon: 'error',
              confirmButtonText: 'OK'
            });
          } else {
            localStorage.setItem('myUser', response.data[0].url);
            localStorage.setItem('myUserArea', response.data[0].residence_area);

            $http.get(response.data[0].url)
              .then(function (response) {
                // console.log(response);
                accesstype = response.data.accesstype;
                $http.get(accesstype)
                  .then(function (response) {
                    // console.log(response.data);
                    $rootScope.myAccessType = response.data;
                    if (response.data.can_access_website == false) {
                      window.location = "./";
                    } else if (response.data.can_view_dashboard == true) {
                      window.location = "./home.html";
                    } else if (response.data.can_view_locations == true) {
                      window.location = "./home.html#!/locations";
                    } else if (response.data.can_view_users == true) {
                      window.location = "./home.html#!/users";
                    } else if (response.data.can_view_agents == true) {
                      window.location = "./home.html#!/agents";
                    } else if (response.data.can_view_visitor_types == true) {
                      window.location = "./home.html#!/visitortype";
                    } else if (response.data.can_view_acces_types == true) {
                      window.location = "./home.html#!/accesstype";
                    } else if (response.data.can_view_connections == true) {
                      window.location = "./home.html#!/connections";
                    } else if (response.data.can_view_access_passes == true) {
                      window.location = "./home.html#!/accesspass";
                    } else if (response.data.can_monitor == true) {
                      window.location = "./home.html#!/monitor";
                    } else {
                      Swal.fire({
                        title: 'You don\'t have the rights to access this app',
                        // text: 'There is no user with your details.',
                        // icon: 'error',
                        confirmButtonText: 'OK'
                      });
                    }
                  });



              });
          }





        } else {
          Swal.fire({
            title: 'Username or password incorrect',
            // text: 'There is no user with your details.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }

      });
  }



  $scope.recoverPass = function () {



    $http.get(baseURL + 'appusersbyemail/?email=' + $scope.recoverEmail)
      .then(function (response) {
        // // console.log(response);
        if (response.data.length > 0) {
          $http({
            method: 'POST',
            url: 'recover.php',
            data: {
              subject: 'Here is your password',
              emailTo: $scope.recoverEmail,
              name: $scope.recoverName,
              passcode: response.data[0].passcode
            },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
          }).then(function (resp) {
            // // console.log(resp);
            Swal.fire({
              title: 'Awesome!',
              text: 'You should receive your password by email.',
              icon: 'success',
              confirmButtonText: 'OK'
            });
            $('#myModal').modal('hide');
            $('body').removeClass('modal-open');

          });

        } else {
          Swal.fire({
            title: 'Error!',
            text: 'There is no user registered with the email address you have provided.',
            icon: 'warning',
            confirmButtonText: 'OK'
          });
        }
      });





  }


  var getAppUserTypes = function () {
    $http.get(baseURL + "appusertype")
      .then(function (response) {
        $scope.appusertypes = response.data;
      });
  }
  // getAppUserTypes();

  var getAppUserAccessTypes = function () {
    $http.get(baseURL + "access_type")
      .then(function (response) {
        $scope.accesstypes = response.data;
      });
  }
  // getAppUserAccessTypes();



  $scope.register = function (email, password, name, phone, passport, vehicle, street, type) {
    $http({
      method: 'POST',
      url: baseURL + "appuser/",
      data: {
        'email': email,
        'password': password,
        'name': name,
        'phone': phone,
        'id_passport_number': passport,
        'vehicle_number': vehicle,
        'street_name': street,
        'type': type
      }
    }).then(function (resp) {
      Swal.fire({
        title: 'Awesome!',
        text: 'We got your submission.',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      // // // console.log(resp.data);
      window.location = "index.html";
    },
      function (error) {
        // // // console.log(error.data);
        $scope.errors = error.data;
      });
  }



});



app.controller('sidebarCtrl', function ($scope, $http, $rootScope, $window) {



  //     var myUser = localStorage.getItem('myUser');
  //     isAdmin = false;

  // var initAllMasterUser = function() {

  //       $http.get(myUser) 
  //       .then(function(response) {
  //           // console.log(response);
  //         var isUserChild = response.data.is_child;
  //         if(isUserChild == true) {
  //            // console.log('fromsidebar child');
  //           // // console.log(response);
  //           if(response.data.usertype == baseURL+"appusertype/1/") {
  //             // console.log('fromsidebar child admin');
  //             $rootScope.isMasterAccount = false;
  //             isAdmin = true;
  //             localStorage.setItem('isAdmin', true);
  //             localStorage.setItem('isMasterAccount', false);
  //             $http.get(response.data.accesstype)
  //               .then(function(response) {
  //                 // // console.log(response.data);
  //                 $rootScope.myAccessType = response.data;
  //                 if(response.data.can_access_website == false) {
  //                   window.location = "./";
  //                 }
  //               });
  //               myUser = response.data.parent_user_url;
  //               localStorage.setItem('masterAccount', response.data.parent_user_url);
  //           } else {
  //             // console.log('fromsidebar child not admin');
  //             $rootScope.isMasterAccount = false;
  //             isAdmin = false;
  //             localStorage.setItem('isMasterAccount', false);
  //             localStorage.setItem('isAdmin', false);
  //             $http.get(response.data.accesstype)
  //               .then(function(response) {
  //                 // // // console.log(response.data);
  //                 $rootScope.myAccessType = response.data;
  //                 if(response.data.can_access_website == false) {
  //                   window.location = "./";
  //                 }
  //               });
  //               myUser = response.data.url;
  //               localStorage.setItem('masterAccount', response.data.url);
  //           }

  //         } else {
  //           isAdmin = true;
  //            // console.log('fromsidebar master');
  //           $rootScope.isMasterAccount = true;
  //           myUser = myUser;
  //           localStorage.setItem('isMasterAccount', true);
  //           localStorage.setItem('isAdmin', true);
  //           localStorage.setItem('masterAccount', myUser);
  //         };
  //       });

  // myUser = localStorage.getItem('masterAccount');
  // isAdmin = localStorage.getItem('isAdmin');
  // }
  // setTimeout(function() {
  // initAllMasterUser();
  // }, 1000);



  $scope.logout = function () {
    localStorage.setItem('myUser', null);
    window.location = "./";
  }


});
