angular.module('catchBaby.controllers', [])

.controller('MainController', function($scope, Grid, Baby, Env) {
    
    var gridWidth = 50;
    var steps = 0;
    var offsetOdd = 35;
    var offsetEven = 15;
    Env.init();

    $scope.units = Grid.units;
    $scope.baby = Baby;

    $scope.global = {
        gameState: 'start'
    };    

    $scope.startGame = function() {
        $scope.global.gameState = 'running';
        steps = 0;
        Baby.reset();
        Grid.reset();
    };

    $scope.handleClick = function(event) {
        var row, col;
        row = Math.floor((event.y - Env.main.getBoundingClientRect().top) / (gridWidth * Env.ratio));
        if (row % 2 === 1) {
            col = Math.floor((event.x - Env.main.getBoundingClientRect().left - offsetOdd * Env.ratio) / (gridWidth * Env.ratio));
        } else {
            col = Math.floor((event.x - Env.main.getBoundingClientRect().left - offsetEven * Env.ratio) / (gridWidth * Env.ratio));
        }
        var unit = Grid.findGridUnit(row, col);
        if (unit) {
            goToTheGrid(unit);
        }
    };

    $scope.getEveryGridStyle = function(unit) {
        var bottom = (9 - unit.row) * gridWidth;
        var left = unit.col * gridWidth;
        if (unit.row % 2 === 1) {
            left += offsetOdd;
        } else {
            left += offsetEven;
        }

        var backgroundImage = 'url(/images/circle1.png)';

        if (unit.ocupied) {
            backgroundImage = 'url(/images/circle2.png)';
        }

        return {
            bottom: bottom + 'px',
            left: left + 'px',
            width: gridWidth + 'px',
            height: gridWidth + 'px',
            backgroundImage: backgroundImage
        };
    };

    $scope.getBabyStyle = function() {
        var bottom = (9 - Baby.row) * gridWidth + gridWidth / 3;
        var left = Baby.col * gridWidth - (60 - gridWidth) / 2;
        if (Baby.row % 2 == 1) {
            left += offsetOdd;
        } else {
            left += offsetEven;
        }
        return {
            bottom: bottom,
            left: left,
        }
    };

    var goToTheGrid = function(unit) {
        if (unit.ocupied) {
            return;
        }
        steps += 1;
        unit.ocupied = true;

        if (Grid.almostOut(Baby.row, Baby.col)) {
            $scope.global.gameState = "end";
            $scope.global.gameResult = {
                state: 'fail'
            }
            return;
        }
        var babyNextStep = Grid.getNextStep(Baby.row, Baby.col);
        var babyNextRandomStep = Grid.getRandomStep(Baby.row, Baby.col);

        if (!babyNextStep) {
            $scope.baby.state = 'caught';
        }
        var nextStep = babyNextStep || babyNextRandomStep;
        if (nextStep) {
            Baby.row = nextStep.row;
            Baby.col = nextStep.col;

            //one more check to see if there is any need to go on
            var nextStepAfterwards=Grid.getRandomStep(Baby.row, Baby.col);
            if(nextStepAfterwards){
                return;
            }
        }

        $scope.global.gameState = "end";
        $scope.global.gameResult = {
            state: "success",
            steps: steps
        }
        return;
    };

});