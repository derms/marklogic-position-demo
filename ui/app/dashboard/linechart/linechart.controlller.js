(function () {
  'use strict';

  angular.module('dashboard.linechart')
      .controller('DashboardLineChartCtrl', DashboardLineChartCtrl);

  /** @ngInject */
  function DashboardLineChartCtrl($scope, baConfig, layoutPaths, baUtil, MLRest) {

    $scope.selectedBook = {};
    $scope.year = "2015"; //default
    $scope.updateSelectedBook = function() {
       getPositionSummary($scope.selectedBook,$scope.validEnd,$scope.systemEnd);
    }

    $scope.validRangeFinishCallback = function(sliderObj) {
      var newMonth = sliderObj.from+1;
      if (newMonth<10) {
        newMonth = "0" + newMonth;
      }
      $scope.validEnd = $scope.year + "-" + newMonth + "-02T00:00:00Z";
      getPositionSummary($scope.selectedBook,$scope.validEnd,$scope.systemEnd);
    }

    $scope.systemRangeFinishCallback = function(sliderObj) {
      var newMonth = sliderObj.from+1;
      if (newMonth<10) {
        newMonth = "0" + newMonth;
      }
      $scope.systemEnd = $scope.year + "-" + newMonth + "-02T00:00:00Z";
      getPositionSummary($scope.selectedBook,$scope.validEnd,$scope.systemEnd);
    }

    var chart = createChart();

    //load the list of books
    doInitialBookLoad();

    //functions

    function getPositionSummary(book, validEnd, systemEnd) {
      if (!book) {
        return;
      }
      var settings = {};
      settings.params = {"rs:book": book};
      if (validEnd) {
        settings.params["rs:validEnd"] = validEnd;
      }
      if (systemEnd) {
        settings.params["rs:systemEnd"] = systemEnd;
      }
      settings.params.format = 'json';
      settings.method = 'GET';
      settings.headers = {};
      //settings.headers['Accept'] = 'multipart/mixed; boundary=BOUNDARY';

      MLRest.request('/resources/positions', settings).then(function(response) {
        console.log(response);
        $scope.positions = response.data;
        chart.dataProvider = mapPositionsToAmChartFormat(response.data);
        chart.titles = [{
            "text": book
        }];

        chart.validateData();
        chart.validateSize();
        chart.handleResize();

      }, function(error) {
        console.error(error);
      });

    }

    function doInitialBookLoad() {
      var settings = {};
      settings.params = {};
      settings.params.format = 'json';
      settings.method = 'GET';
      settings.headers = {};
      //settings.headers['Accept'] = 'multipart/mixed; boundary=BOUNDARY';

      MLRest.request('/resources/books', settings).then(function(response) {
        console.log(response);
        $scope.books = response.data.books;
        if ($scope.books.length>0) {
          $scope.selectedBook = $scope.books[0];
          getPositionSummary($scope.selectedBook,$scope.validEnd,$scope.systemEnd);
        }
      }, function(error) {
        console.error(error);
      });
    }


    function mapPositionsToAmChartFormat(positionSummary) {
      var results = [];
      var positions = positionSummary.positions;
      for(var i in positions) {
        var result = {date: new Date(positions[i].date)};
        result["value"] = positions[i].position;
        result["value0"] = positions[i].projected;
        results.push(result);
      }
      console.log(results);
      return results;
    }

    function createChart() {
      var layoutColors = baConfig.colors;
      var graphColor = baConfig.theme.blur ? '#000000' : layoutColors.primary;

      var args = {
      type: 'serial',
      theme: 'blur',
      marginTop: 15,
      marginRight: 15,
      dataProvider: null,
      categoryField: 'date',
      categoryAxis: {
        parseDates: true,
        gridAlpha: 0,
        color: layoutColors.defaultText,
        axisColor: layoutColors.defaultText
      },
      valueAxes: [
        {
          minVerticalGap: 50,
          gridAlpha: 0,
          color: layoutColors.defaultText,
          axisColor: layoutColors.defaultText
        }
      ],
      graphs: [
        {
          id: 'g0',
          bullet: 'none',
          useLineColorForBulletBorder: true,
          lineColor: baUtil.hexToRGB(graphColor, 0.3),
          lineThickness: 1,
          negativeLineColor: layoutColors.danger,
          type: 'smoothedLine',
          valueField: 'value0',
          fillAlphas: 1,
          fillColorsField: 'lineColor'
        },
        {
          id: 'g1',
          bullet: 'none',
          useLineColorForBulletBorder: true,
          lineColor: baUtil.hexToRGB(graphColor, 0.7),
          lineThickness: 1,
          negativeLineColor: layoutColors.danger,
          type: 'smoothedLine',
          valueField: 'value',
          fillAlphas: 1,
          fillColorsField: 'lineColor'
        }
      ],
      chartCursor: {
        categoryBalloonDateFormat: 'MM YYYY',
        categoryBalloonColor: '#4285F4',
        categoryBalloonAlpha: 0.7,
        cursorAlpha: 0,
        valueLineEnabled: true,
        valueLineBalloonEnabled: true,
        valueLineAlpha: 0.5
      },
      "legend": {
        "data":  [{
            title: "Actual Position",
            color: baUtil.hexToRGB(graphColor, 0.7)
        }, {
            title: "Projected Position",
            color: baUtil.hexToRGB(graphColor, 0.3)
          }]
     },
      dataDateFormat: 'MM YYYY',
      export: {
        enabled: true
      },
      creditsPosition: 'bottom-right',
      zoomOutButton: {
        backgroundColor: '#fff',
        backgroundAlpha: 0
      },
      zoomOutText: '',
      pathToImages: layoutPaths.images.amChart
    };

      var chart = AmCharts.makeChart('amchart', args);


      function zoomChart() {
        chart.zoomToDates(new Date(2015, 1), new Date(2015, 12));
      }

      chart.addListener('rendered', zoomChart);
      zoomChart();
      if (chart.zoomChart) {
        chart.zoomChart();
      }

      return chart;
    }

  }
})();
