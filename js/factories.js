angular.module('catchBaby.factories', [])
    
    .factory('GridUnit', function() {
        return {
            init: function(row, col) {
                this.row = row;
                this.col = col;
                this.ocupied = false;
                return this;
            }
        };
    })
    
    .factory('NodeProto', function() {
        var init = function(value) {
            this.adj = [];
            this.value = value;

            return this;
        };

        var connectTo = function(node) {
            if (!_.contains(this.adj, node)) {
                this.adj.push(node);
            }
        };
        return {
            init: init,
            connectTo: connectTo
        };
    })
    .factory('GraphProto', function(NodeProto) {
        var init = function(n) {
            self = this;
            self.adj = [];

            _.each(_.range(n), function(i) {
                self.adj[i] = [];
            });

            return self;
        };
        var connect = function(s, v) {

            if (!_.contains(this.adj[s], v)) {
                this.adj[s].push(v);
            }

            if (!_.contains(this.adj[v], s)) {
                this.adj[v].push(s);
            }
        };

        var shortestPath = function(s, v) {
            var mem = {};
            var queue = [];
            var visitedNodes = [];
            var found = false;
            var path = null;

            queue.unshift(s);
            visitedNodes.push(s);

            while (queue.length !== 0 && !found) {
                var temp = queue.pop();

                if (temp === v) {
                    found = true;
                } else {
                    var newNodes = _.difference(this.adj[temp], visitedNodes);
                    visitedNodes = newNodes.concat(visitedNodes);
                    queue = newNodes.concat(queue);

                    _.each(newNodes, function(node) {
                        mem[node] = temp;
                    });
                }

            }

            if (found) {
                path = [v];
                var pathNode = v;

                while (pathNode !== s) {
                    pathNode = mem[pathNode];
                    path.unshift(pathNode);
                }
            }
            return path;
        };
        return {
            init: init,
            connect: connect,
            shortestPath: shortestPath
        };
    })
    .factory('Baby', function() {
        var reset = function() {
            this.row = 4;
            this.col = 4;
            this.isFree = true;
            this.state = 'happy';
        }

        return {
            isFree: true,
            row: 4,
            col: 4,
            state: 'happy',
            reset: reset
        }

    })
    .factory('Grid', function(GridUnit, GraphProto) {

        var rowCount = 9;
        var colCount = 9;
        var unitCount = rowCount * colCount;

        var difficultyRate = 0.2;

        var units = _.range(rowCount * colCount).map(function(i) {
            var row = parseInt(i / colCount);
            var col = i % colCount;

            var unit = Object.create(GridUnit).init(row, col);
            return unit;
        });

        var reset = function() {
            _.each(units, function(unit) {
                if (Math.random() < difficultyRate) {
                    unit.ocupied = true;
                } else {
                    unit.ocupied = false;
                }
            });
            //make the baby position non-ocupied
            units[rowCount * Math.floor(rowCount / 2) + Math.floor(colCount / 2)].ocupied = false;
        };

        var isInGrid = function(row, col) {
            return row < rowCount && row >= 0 && col < colCount & col >= 0;
        }

        var findGridUnit = function(row, col) {
            return isInGrid(row, col) ? units[row * rowCount + col] : null;
        };

        var findAdjacentGridUnits = function(row, col) {
            var results = [];
            _.each(['left', 'right', 'topRight', 'topLeft', 'bottomRight', 'bottomLeft'], function(direction) {
                var adjacentGridUnit = findAdjacentGridUnitByDirection(row, col, direction);
                if (adjacentGridUnit) {
                    results.push(adjacentGridUnit);
                }
            });
            return results;
        };

        var almostOut = function(row, col) {
            return row === 0 || row === (rowCount - 1) || col === 0 || col === (colCount - 1);
        };

        var findAdjacentGridUnitByDirection = function(row, col, direction) {
            switch (direction) {
                case 'left':
                    col--;
                    return findGridUnit(row, col);
                case 'right':
                    col++;
                    return findGridUnit(row, col);
                case 'topRight':
                    row--;
                    if (row % 2 === 0) {
                        col++;
                    }
                    return findGridUnit(row, col);
                case 'topLeft':
                    row--;
                    if (row % 2 === 1) {
                        col--;
                    }
                    return findGridUnit(row, col);
                case 'bottomRight':
                    row++;
                    if (row % 2 === 0) {
                        col++;
                    }
                    return findGridUnit(row, col);
                case 'bottomLeft':
                    row++;
                    if (row % 2 === 1) {
                        col--;
                    }
                    return findGridUnit(row, col);
                default:
                    return null;
            };

        };

        var getNextStep = function(row, col) {
            var visualNodeValue = unitCount;

            var graph = Object.create(GraphProto).init(unitCount + 1);
            var unitToValue = function(unit) {
                return unit.row * colCount + unit.col;
            };
            _.each(units, function(unit) {
                if (unit.ocupied) {
                    if (unit.row !== row || unit.col !== col) {
                        return;
                    }
                }
                _.each(findAdjacentGridUnits(unit.row, unit.col), function(adjUnit) {
                    if (adjUnit.ocupied) {
                        return;
                    }

                    graph.connect(unitToValue(unit), unitToValue(adjUnit));

                    if (almostOut(unit.row, unit.col)) {
                        graph.connect(unitToValue(unit), visualNodeValue);
                    }
                });
            });
            var path = graph.shortestPath(row * colCount + col, visualNodeValue);

            if (path) {
                var nextStepValue = path[1];
                return {
                    row: Math.floor(nextStepValue / colCount),
                    col: nextStepValue % colCount
                }
            } else {
                return null;
            }

        };

        var getRandomStep = function(row, col) {

            var unit = _.find(findAdjacentGridUnits(row, col), function(unit) {
                return !unit.ocupied;
            });

            return unit ? {
                row: unit.row,
                col: unit.col
            } : null;
        }


        return {
            units: units,
            isInGrid: isInGrid,
            reset: reset,
            getNextStep: getNextStep,
            findAdjacentGridUnits: findAdjacentGridUnits,
            almostOut: almostOut,
            getRandomStep: getRandomStep,
            findGridUnit: findGridUnit

        };
    }).factory('Env', function($window, $timeout) {
        var init = function() {
            var ratio = $window.innerWidth / 600;
            ratio = ratio < 1 ? ratio : 1;
            var styleElm = document.createElement('style');
            styleElm.innerHTML =
                '.scale-x{ transform: scale(' + ratio + ', 1)}' +
                '.scale-y{ transform: scale(1, ' + ratio + ')}';
            $window.document.querySelector('head').appendChild(styleElm);
            this.ratio = ratio;
            this.main = $window.document.querySelector('.main-container');
        };

        return {
            init: init
        };
    });