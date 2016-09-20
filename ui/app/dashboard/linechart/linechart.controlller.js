(function () {
  'use strict';

  angular.module('dashboard.linechart')
      .controller('DashboardLineChartCtrl', DashboardLineChartCtrl);

  /** @ngInject */
  function DashboardLineChartCtrl($scope, baConfig, layoutPaths, baUtil, MLRest) {

    $scope.selectedBook = {};
    $scope.updateSelectedBook = function() {
       getPositionSummary($scope.selectedBook);
    }
    var chart = createChart();
    
    //load the list of books
    getBooks();

    //functions

    function getPositionSummary(book) {
      var settings = {};
      settings.params = {"rs:book": book};
      settings.params.format = 'json';
      settings.method = 'GET';
      settings.headers = {};
      //settings.headers['Accept'] = 'multipart/mixed; boundary=BOUNDARY';

      MLRest.request('/resources/positions', settings).then(function(response) {
        console.log(response);
        chart.dataProvider = mapPositionsToAmChartFormat(response.data);
        chart.titles = [{
            "text": book
        }];
        chart.validateData();
      }, function(error) {
        console.error(error);
      });
    }

    function getBooks() {
      var settings = {};
      settings.params = {};
      settings.params.format = 'json';
      settings.method = 'GET';
      settings.headers = {};
      //settings.headers['Accept'] = 'multipart/mixed; boundary=BOUNDARY';

      MLRest.request('/resources/books', settings).then(function(response) {
        console.log(response);
        $scope.books = response.data.books;
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
        categoryField: 'date',
        categoryAxis: {
          parseDates: true,
          //equalSpacing: true,
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
            lineColor: baUtil.hexToRGB(graphColor, 0.5),
            lineThickness: 1,
            negativeLineColor: layoutColors.danger,
            type: 'smoothedLine',
            valueField: 'value',
            fillAlphas: 1,
            fillColorsField: 'lineColor'
          }
        ],
        chartCursor: {
          categoryBalloonDateFormat: 'YYYY-MM-DD',
          categoryBalloonColor: '#4285F4',
          categoryBalloonAlpha: 0.7,
          cursorAlpha: 0,
          valueLineEnabled: true,
          valueLineBalloonEnabled: true,
          valueLineAlpha: 0.5
        },
        dataDateFormat: 'YYYY-MM-DD',
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
