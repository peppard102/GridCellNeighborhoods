function main(collXCount, rowYCount, n, positiveCellsXYArray) {
  console.log("--------------------------------");
  let numCells = 0;

  positiveCellsXYArray = removeOutOfBoundsPoints(
    collXCount,
    rowYCount,
    positiveCellsXYArray
  );

  // If there are no positive cells, return 0
  if (positiveCellsXYArray.length === 0) return 0;

  // If the distance threshold is 0, return 1
  if (n === 0) return 1;

  numCells = maxCellsPerNeighborhood(n) * positiveCellsXYArray.length;
  console.log("maximumCells", numCells);

  // Check if any neighborhoods are cut off
  positiveCellsXYArray.forEach((point) => {
    if (isCutOff(collXCount, rowYCount, n, point)) console.log("* Cut off *");
  });

  // Check if any neighborhoods overlap
  if (positiveCellsXYArray.length > 1) {
    for (let i = 0; i < positiveCellsXYArray.length; i++) {
      for (let j = i + 1; j < positiveCellsXYArray.length; j++) {
        if (hasOverlap(positiveCellsXYArray[i], positiveCellsXYArray[j], n))
          numCells -= calculateOverlap(
            positiveCellsXYArray[i],
            positiveCellsXYArray[j],
            n
          );
        console.log("* Overlap *");
      }
    }
  }

  // Adjust for when any cells of a neighborhood are out of bounds.
  positiveCellsXYArray.forEach((point) => {
    const numCellsOutsideGrid = cellsOutsideGrid(
      collXCount,
      rowYCount,
      n,
      point
    );

    console.log("numCellsOutsideGrid: ", numCellsOutsideGrid);
    numCells -= numCellsOutsideGrid;
  });

  return numCells;
}

// Remove any points that are outside the grid
function removeOutOfBoundsPoints(collXCount, rowYCount, positiveCellsXYArray) {
  return positiveCellsXYArray.filter((point) => {
    return (
      point[0] >= 0 &&
      point[0] < rowYCount &&
      point[1] >= 0 &&
      point[1] < collXCount
    );
  });
}

// This is the manhattan distance equation given in the PDF
function manhattanDistance(pointA, pointB) {
  return Math.abs(pointA[0] - pointB[0]) + Math.abs(pointA[1] - pointB[1]);
}

// The number of cells in the neighborhood if nothing is out of bounds or overlapping.
function maxCellsPerNeighborhood(n) {
  // Add up the cells in the two pyramids.
  return cellsInPyramid(n) + cellsInPyramid(n + 1);
}

// Check if two points are within eachother's neighborhoods.
function hasOverlap(pointA, pointB, n) {
  return manhattanDistance(pointA, pointB) <= n * 2;
}

// Check if anything in the neighborhood is out of bounds.
function isCutOff(collXCount, rowYCount, n, point) {
  if (
    point[0] < n || // Too high
    point[0] > rowYCount - n - 1 || // Too low
    point[1] < n || // Too far to the left
    point[1] > collXCount - n - 1 // Too far to the right
  )
    return true;

  return false;
}

// https://www.geeksforgeeks.org/sum-of-odd-numbers/
// The number of cells in a pyramid is a sum of odds, which is n^2.
function cellsInPyramid(numRows) {
  return numRows ** 2;
}

// The triangular number sequence is defined as n(n+1)/2 and is useful for when the neighborhood is in the corner of the grid.
// https://www.geeksforgeeks.org/triangular-numbers/
function triangularNumberSequence(triangleHeight) {
  return (triangleHeight * (triangleHeight + 1)) / 2;
}

// This calculates the number of cells lost from either the right or left side of the neighborhood being out of bounds.
function numCellsLostOnSide(
  rowsLostOnSide,
  rowsLostOnTop,
  rowsLostOnBottom,
  n
) {
  if (rowsLostOnSide) {
    const maxCompleteRowsLost = n + 1;

    // The total cells lost before removing duplicates.
    let cellsLostOnSide = cellsInPyramid(rowsLostOnSide);

    // Check if any of the cells lost on the right were already accounted for in the top or bottom cell loss calculations.
    const lostRowsOverlapTop = Math.max(
      0,
      rowsLostOnSide + rowsLostOnTop - maxCompleteRowsLost
    );
    const lostRowsOverlapBottom = Math.max(
      0,
      rowsLostOnSide + rowsLostOnBottom - maxCompleteRowsLost
    );

    // Remove the cells that were already accounted for in the top and bottom cell loss calculations.
    cellsLostOnSide -= triangularNumberSequence(lostRowsOverlapTop);
    cellsLostOnSide -= triangularNumberSequence(lostRowsOverlapBottom);

    return cellsLostOnSide;
  }

  return 0;
}

// The total number of cells outside the grid. We don't want to count these towards our total.
function cellsOutsideGrid(collXCount, rowYCount, n, point) {
  let totalCellsLost = 0; // The final answer for this function.

  // This first n + 1 rows lost are complete rows. Any additional rows lost are partial rows.
  const rowsLostOnTop = point[0] < n ? n - point[0] : 0;
  const rowsLostOnRight =
    point[1] > collXCount - n - 1 ? point[1] - (collXCount - n - 1) : 0;
  const rowsLostOnBottom =
    point[0] > rowYCount - n - 1 ? point[0] - (rowYCount - n - 1) : 0;
  const rowsLostOnLeft = point[1] < n ? n - point[1] : 0;

  // Add all the cutoff cells from each angle. The numCellsLostOnSide function will handle duplicates.
  totalCellsLost += cellsInPyramid(rowsLostOnTop);
  totalCellsLost += cellsInPyramid(rowsLostOnBottom);
  totalCellsLost += numCellsLostOnSide(
    rowsLostOnRight,
    rowsLostOnTop,
    rowsLostOnBottom,
    n
  );
  totalCellsLost += numCellsLostOnSide(
    rowsLostOnLeft,
    rowsLostOnTop,
    rowsLostOnBottom,
    n
  );

  return totalCellsLost;
}

// #region Functions for calculating overlap

// Each diagonal bar needs to be numbered starting at 1. This number will be used to calculate the overlapping cells.
function calcDiagonalBarNum(
  rightMostPointFirstDiamond,
  leftMostPointSecondDiamond
) {
  const offset =
    leftMostPointSecondDiamond[1] - leftMostPointSecondDiamond[0] - 1;
  const diagBarNum =
    rightMostPointFirstDiamond[1] - rightMostPointFirstDiamond[0] - offset;
  return diagBarNum;
}

// This will calculate the point that is the furthest north-west for the specific diagonal bar number.
function findfirstStepInDiagBar(diagNum, leftMostPointSecondDiamond) {
  const colOffset = Math.trunc(diagNum / 2); // Use Math.trunc to get rid of the remainder.
  const rowOffset = Math.trunc((diagNum - 1) / 2);

  return [
    leftMostPointSecondDiamond[0] - rowOffset,
    leftMostPointSecondDiamond[1] + colOffset,
  ];
}

// The num steps diagonally you are from the point furthest north-west.
function findStepNumForPoint(diagNum, point, leftMostPointSecondDiamond) {
  const firstStepInDiagBar = findfirstStepInDiagBar(
    diagNum,
    leftMostPointSecondDiamond
  );
  const md = manhattanDistance(firstStepInDiagBar, point);

  const stepNum = 1 + md / 2;
  return stepNum;
}

// Calculate the number of cells that overlap between two diamonds.
function calculateOverlap(pointA, pointB, n) {
  let cellCount = 0;
  const firstDiamondCenter = pointA[1] > pointB[1] ? pointB : pointA;
  const secondDiamondCenter = pointA[1] > pointB[1] ? pointA : pointB;
  const rightMostPointFirstDiamond = [
    firstDiamondCenter[0],
    firstDiamondCenter[1] + n,
  ];
  const leftMostPointSecondDiamond = [
    secondDiamondCenter[0],
    secondDiamondCenter[1] - n,
  ];
  let diagNum = calcDiagonalBarNum(
    rightMostPointFirstDiamond,
    leftMostPointSecondDiamond
  );

  const stepNum = findStepNumForPoint(
    diagNum,
    rightMostPointFirstDiamond,
    leftMostPointSecondDiamond
  );

  // Odd numbered diag bars are part of the big square and even numbered diag bars are part of the small square.
  const isBigSquare = diagNum % 2 === 1;

  if (isBigSquare) {
    cellCount = (diagNum + 1) / 2 + (stepNum - 1) * diagNum;
  } else {
    cellCount = stepNum * diagNum;
  }

  return cellCount;
}

// Might not be helpful. Delete this function if unused.
function isOnEdge(rightMostPointFirstDiamond, centerSecondDiamond, n) {
  return (
    manhattanDistance(rightMostPointFirstDiamond, centerSecondDiamond) === n
  );
}
// #endregion

function test(received, expected) {
  const passed = expected === received ? "O" : "X";
  console.log(passed + " - Expected: " + expected + ", Received: " + received);
  console.log("--------------------------------");
}

//#region Tests
test(main(5, 5, 2, [[2, 2]]), 13);
test(main(11, 11, 3, [[5, 5]]), 25);
test(main(11, 11, 3, [[5, 1]]), 21);
test(
  main(11, 11, 2, [
    [7, 3],
    [3, 7],
  ]),
  26
);
test(
  main(11, 11, 2, [
    [7, 3],
    [6, 5],
  ]),
  22
);
test(main(1, 1, 1, [[0, 0]]), 1);
test(main(11, 11, 3, [[0, 0]]), 10);
test(main(11, 2, 3, [[0, 0]]), 7);
test(main(1, 11, 3, [[0, 0]]), 4);
test(main(2, 11, 3, [[0, 0]]), 7);
test(main(3, 11, 3, [[0, 0]]), 9);
test(main(4, 11, 3, [[0, 0]]), 10);
test(main(10, 10, 2, [[0, 0]]), 6);
test(
  main(10, 10, 2, [
    [1, 1],
    [1, 1],
  ]),
  11
);
test(
  main(10, 10, 2, [
    [1, 1],
    [0, 0],
  ]),
  11
);
test(
  main(10, 10, 3, [
    [15, 15], // This point is outside the grid.
    [1, 1],
  ]),
  17
);
test(
  main(10, 10, 3, [
    [0, 0],
    [9, 9],
  ]),
  20
);
test(
  main(10000000, 10000000, 3, [
    [50000, 50000],
    [1, 1],
  ]),
  42
);
test(main(10000000, 10000000, 500000, [[500000, 500000]]), 500001000001);
test(
  main(10000000, 10000000, 500000, [
    [50000, 50000],
    [1, 1],
  ]),
  0 // TODO: Fix this answer
);
// #endregion
