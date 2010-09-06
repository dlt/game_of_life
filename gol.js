Array.prototype.isEmpty = function () {
  return this.length === 0;
}

Array.prototype.map = function(fn) {
  var result = [];

  for (var i = 0; i < this.length; i++) {
    result.push(fn(this[i]));
  }

  return result;
}

Array.prototype.select = function(fn) {
  var result = [];

  for (var i = 0; i < this.length; i++) {
    if (fn(this[i])) {
      result.push(this[i]);
    }
  }

  return result;
}

Array.prototype.partition = function(fn) {
  var trues = [];
  var falses = [];

  for (var i = 0; i < this.length; i++) {
    if (fn(this[i])) {
      trues.push(this[i]);
    } else {
      falses.push(this[i]);
    }
  }

  return [trues, falses];
}

function Board(options) {
  var squareSize = options.squareSize || 30;
  var left = options.left || 50;
  var top = options.top || 50;
  var lines = options.lines || 20;
  var columns = options.columns || 20;

  var canvas = document.getElementById(options.canvasId);
  var context = canvas.getContext("2d");

  var black = "rgb(0, 0, 0)";
  var white = "rgb(255, 255, 255)";
  var gray = "rgb(100, 100, 100)";

  var gameCells = [];

  function initCells() {
    for (var i = 0; i < lines; i ++) {
      gameCells[i] = new Array(columns);

      for (var j = 0; j < columns; j++) {
        gameCells[i][j] = 0; 
      }
    }
  }

  function isAlive(cell) {
    return gameCells[cell[0]][cell[1]] === 1;
  }

  initCells();

  function buildLine(left, top, size, squareColor, squareSize) {
    context.fillStyle = squareColor;

    while (size > 0) {
      context.fillRect(left, top, squareSize, squareSize);
      left += squareSize;
      size -= 1;
    }
  }

  return {
    draw : function() {
      for (var i = 1; i <= lines; i++) {
        buildLine(left, top * i, columns, gray, squareSize);
      }
    },

    changeSquareColor : function(line, column, color) {
      context.fillStyle = color;
      context.fillRect((column + 1) * left, (line + 1) * top, squareSize, squareSize);
      gameCells[line][column] = (color === black ? 1 : 0);
    },
    
    fillInitialCells : function(cells) {
      for (var i = 0; i < cells.length; i++) {
        var cell = cells[i];
        this.changeSquareColor(cell[0], cell[1], black);
        gameCells[cell[0]][cell[1]] = 1;
      }
    }, 

    neighbours : function (cell) {
      return [
        [cell.x - 1, cell.y - 1],
        [cell.x - 1, cell.y + 1],
        [cell.x - 1, cell.y],
        [cell.x + 1, cell.y],
        [cell.x + 1, cell.y - 1],
        [cell.x + 1, cell.y + 1],
        [cell.x, cell.y + 1],
        [cell.x, cell.y - 1]
      ].select(function(cell) {
          return gameCells[cell[0]] !== undefined && gameCells[cell[0]][cell[1]] !== undefined;
      });
    },

    refresh : function() {
      var changedCells = [];

      for (var i = 0; i < lines; i++) {
        for (var j = 0; j < columns; j++) {
          var cell = [i, j];
          var neighbours = this.neighbours({ x : i, y : j}).partition(function(c) { return isAlive(c); });

          var liveNeighbours = neighbours[0],
              deadNeighbours = neighbours[1];

          if (isAlive(cell)) {
            if (liveNeighbours.length === 2 || liveNeighbours.length === 3) {
              changedCells.push([i, j, black]);
            } else {
              changedCells.push([i, j, gray]);
            }
          } else {
            if (liveNeighbours.length === 3) {
              changedCells.push([i, j, black]);
            }
          }
        }
      }

      var that = this;
      changedCells.map(function(params) {
        that.changeSquareColor(params[0], params[1], params[2]); 
      });
    }
  };
}

var board;

function initialize() {
  board = new Board({ lines : 32, columns : 32, left : 10, top : 10, squareSize : 10, canvasId : "board_canvas" });
  board.draw();
  board.fillInitialCells([[5, 5], [5, 6], [5, 7]]);
}

function refresh() {
  board.refresh();
}

