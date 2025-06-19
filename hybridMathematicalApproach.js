/*
 * In order to maintain optimal speed, this solution uses only mathematical calculations for most cases, instead of looping over cells. However, the
 * mathematical approach currently is not advanced enough to handle cases where the cells are both overlapping and out of bounds at the same time or
 * where there are more than 2 cells overlapping each other. For those cases, we are looping over the cells in the neighborhood, but not the whole grid.
 *
 * Case 1) Neighborhood fits within grid ----> Mathematical solution
 * Case 2) Neighborhood falls off edge but has no overlap with other neighborhoods ----> Mathematical solution
 * Case 3) Neighborhood has overlap with one other neighborhood and all cells are within the bounds of the grid ----> Mathematical solution
 * Case 4) Neighborhood has overlap with two other neighborhoods ----> Neighborhood Cell Mapping solution
 * Case 5) Neighborhood has overlap with one other neighborhood and also falls off the edge of the grid ----> Neighborhood Cell Mapping solution
 */

// Parameters
// collXCount: number - number of columns
// rowYCount: number - number of rows
// n: number - distance threshold
// positiveCellsXYArray: Array<Array>> - array of [x,y] arrays. Ex: [[1,3], [5,5], [5,8]]
function main(collXCount, rowYCount, n, positiveCellsXYArray) {
  const positivePoints = cleanData(collXCount, rowYCount, positiveCellsXYArray);

  if (guaranteedFullCoverage(collXCount, rowYCount, n))
    return collXCount * rowYCount;

  // If there are no positive cells, return 0
  if (positivePoints.length === 0) return 0;

  // If the distance threshold is 0, return the number of positive cells.
  if (n === 0) return positivePoints.length;

  const maxCells = maxCellsPerNeighborhood(n) * positivePoints.length;

  /*
   * The mathematical approach is very performant since it's not looping over cells but it's not yet advanced enough to handle cases where the cells
   * are both overlapping and out of bounds at the same time. We need to fall back to the less performant neighborhoodCellMappingApproach
   * for these cases. Getting the mathematical approach to work for these cases is probably possible but I haven't had time to implement
   * that part yet.
   */
  try {
    const cellsLost = attemptMathematicalApproach(
      collXCount,
      rowYCount,
      n,
      positivePoints
    );

    return maxCells - cellsLost;
  } catch {
    return neighborhoodCellMappingApproach(
      collXCount,
      rowYCount,
      n,
      positivePoints
    );
  }
}

// This approach is very fast because it's not looping through the grid cells.
function attemptMathematicalApproach(collXCount, rowYCount, n, positivePoints) {
  let cellsLost = 0;

  for (let i = 0; i < positivePoints.length; i++) {
    // We need to keep track of this because the mathematical approach can only handle overlap between 2 neighborhoods.
    let overlapped = false;

    // Adjust for when any cells of a neighborhood are out of bounds.
    const numCellsOutsideGrid = cellsOutsideGrid(
      collXCount,
      rowYCount,
      n,
      positivePoints[i]
    );

    cellsLost += numCellsOutsideGrid;

    // Check if any neighborhoods overlap
    for (let j = i + 1; j < positivePoints.length; j++) {
      if (hasOverlap(positivePoints[i], positivePoints[j], n)) {
        if (
          isCutOff(collXCount, rowYCount, n, positivePoints[i]) ||
          isCutOff(collXCount, rowYCount, n, positivePoints[j]) ||
          overlapped === true
        ) {
          /*
           * The very performant mathematical approach is not yet advanced enough to handle cases where the cells are both overlapping
           * and out of bounds at the same time. It also can't handle cases where one neighborhood overlaps with multiple other neighborhoods.
           * We need to fall back to the less performant neighborhoodCellMappingApproach for these 2 cases.
           */
          throw new Error();
        }
        overlapped = true;

        cellsLost += calculateOverlap(positivePoints[i], positivePoints[j], n);
      }
    }
  }

  return cellsLost;
}

// #region Helper Functions
// If this is true, every neighborhood will cover the full grid regardless of location.
function guaranteedFullCoverage(collXCount, rowYCount, n) {
  // These are the largest rectangle sizes when the point is located in the corner, which is the worst-case position.
  // The rectangles marked by the brackets are just examples of max-sized rectangles. There can be multiple different
  // rectangle dimensions with the max-size. But when you add the row count to the col count of any max-sized
  // rectangle, it is always equal to n + 2.

  // n = 2
  // row count + col count = 4 = n + 2
  // [x 1]1
  // [1 1]
  //  1

  // n = 3
  // row count + col count = 5 = n + 2
  // [x 1 1]1
  // [1 1 1]
  //  1 1
  //  1

  // n = 4
  // row count + col count = 6 = n + 2
  // [x 1 1]1 1
  // [1 1 1]1
  // [1 1 1]
  //  1 1
  //  1

  // n = 5
  // row count + col count = 7 = n + 2
  // [x 1 1 1]1 1
  // [1 1 1 1]1
  // [1 1 1 1]
  //  1 1 1
  //  1 1
  //  1
  return n + 2 >= collXCount + rowYCount;
}

function isWithinGrid(collXCount, rowYCount, point) {
  return (
    point[0] >= 0 &&
    point[0] < rowYCount &&
    point[1] >= 0 &&
    point[1] < collXCount
  );
}

// Remove any duplicates and points that are outside the grid
const cleanData = (collXCount, rowYCount, positiveCellsXYArray) => {
  const points = new Set();

  return positiveCellsXYArray.filter((point) => {
    const key = `${point[0]},${point[1]}`;

    if (points.has(key) || !isWithinGrid(collXCount, rowYCount, point))
      return false;

    points.add(key);
    return true;
  });
};

// This is the manhattan distance equation given in the PDF
function manhattanDistance(pointA, pointB) {
  return Math.abs(pointA[0] - pointB[0]) + Math.abs(pointA[1] - pointB[1]);
}

// The number of cells in the neighborhood if nothing is out of bounds or overlapping.
function maxCellsPerNeighborhood(n) {
  // Add up the cells in the two pyramids.
  return cellsInPyramid(n) + cellsInPyramid(n + 1);
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
// #endregion

// #region Functions for checking if a neighborhood has out of bounds cells. Uses math for speed instead of looping over all cells.
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
// #endregion

// #region Functions for calculating overlap. Uses math for speed instead of looping over all cells.
// Check if two points are within eachother's neighborhoods.
function hasOverlap(pointA, pointB, n) {
  return manhattanDistance(pointA, pointB) <= n * 2;
}

// Each diagonal bar needs to be numbered starting at 1. This number will be used to calculate the overlapping cells.
//        7
//      5 6 7
//    3 4 5 6 7
//  1 2 3 4 5 6 7
//    1 2 3 4 5
//      1 2 3
//        1
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
//          [7]
//       [5][6] 7
//    [3][4] 5  6  7
// [1][2] 3  4  5  6  7
//     1  2  3  4  5
//        1  2  3
//           1
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

  const diagNum = calcDiagonalBarNum(
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
  const maxDiags = 2 * n + 1;
  const numDiagsOffNortheastEdge = Math.max(0, diagNum - maxDiags);
  const totalDiagsOverlapping = diagNum - numDiagsOffNortheastEdge * 2;

  if (isBigSquare) {
    const maxSteps = n + 1;
    const numStepsOffSoutheastEdge = Math.max(0, stepNum - maxSteps);

    /*
     * For the first step onto the big square, the number of overlapping cells is smaller than all the other steps because
     * the small square doesn't extend up that far, so we're not getting any cells from the small square on the first step.
     * For all the other steps past the first step, we're getting cells from both squares, so we're adding a larger number
     * of cells per step.
     */
    const cellsFromFirstStep = (totalDiagsOverlapping + 1) / 2;
    const cellsFromRemainingSteps = (stepNum - 1) * totalDiagsOverlapping;

    // We need to subtract any cells dangling off the edge of the square.
    const cellsOffSoutheastEdge =
      numStepsOffSoutheastEdge * totalDiagsOverlapping;

    cellCount =
      cellsFromFirstStep + cellsFromRemainingSteps - cellsOffSoutheastEdge;
  } else {
    const maxSteps = n;
    const numStepsOffSoutheastEdge = Math.max(0, stepNum - maxSteps);

    cellCount = (stepNum - numStepsOffSoutheastEdge) * totalDiagsOverlapping;
  }

  return cellCount;
}
// #endregion

// #region Neighborhood Cell Mapping Approach
// This will loop through all cells in each neighborhood and add them to a set. It's fast with very large grids but slow for very large distance thresholds.
function neighborhoodCellMappingApproach(
  collXCount,
  rowYCount,
  n,
  positiveCellsXYArray
) {
  const cellsInAllNeighborhoods = new Set(); // Use a set to avoid duplicate values

  // Run the loop once for each positive value
  for (let i = 0; i < positiveCellsXYArray.length; i++) {
    const [centerpointRow, centerpointCol] = positiveCellsXYArray[i];

    addCell(
      centerpointRow,
      centerpointCol,
      rowYCount,
      collXCount,
      cellsInAllNeighborhoods
    ); // Add the centerpoint to the set

    // Add each diamond layer to the set. The number of diamond layers is equal to the distance
    // threshold. We will start with the innermost diamond around the centerpoint/positive cell and move
    // outward.

    // Iteration 1:
    //         [1]
    //       [1]X[1]
    //         [1]

    // Iteration 2:
    //         [1]
    //       [1]1[1]
    //     [1]1 X 1[1]
    //       [1]1[1]
    //         [1]

    // Iteration 3:
    //         [1]
    //       [1]1[1]
    //     [1]1 1 1[1]
    //   [1]1 1 X 1 1[1]
    //     [1]1 1 1[1]
    //       [1]1[1]
    //         [1]

    // Iteration 4:
    //         [1]
    //       [1]1[1]
    //     [1]1 1 1[1]
    //   [1]1 1 1 1 1[1]
    // [1]1 1 1 x 1 1 1[1]
    //   [1]1 1 1 1 1[1]
    //     [1]1 1 1[1]
    //       [1]1[1]
    //         [1]
    for (
      let distanceFromCenter = 1;
      distanceFromCenter <= n;
      distanceFromCenter++
    ) {
      traverseDiamondLayer(
        rowYCount,
        collXCount,
        centerpointRow,
        centerpointCol,
        distanceFromCenter,
        cellsInAllNeighborhoods
      );
    }
  }

  return cellsInAllNeighborhoods.size;
}

function traverseDiamondLayer(
  rowYCount,
  collXCount,
  startingPointRow,
  startingPointCol,
  distance,
  cellsInAllNeighborhoods
) {
  // Find the 4 corners of this diamond layer
  //    [1]
  //   1 1 1
  //[1]1 X 1[1]
  //   1 1 1
  //    [1]
  const corners = {
    north: [startingPointRow - distance, startingPointCol],
    east: [startingPointRow, startingPointCol + distance],
    south: [startingPointRow + distance, startingPointCol],
    west: [startingPointRow, startingPointCol - distance],
  };

  for (let i = 0; i < distance; i++) {
    // Add all cells in this diamond layer to the set
    Object.values(corners).forEach((point) => {
      addCell(
        point[0],
        point[1],
        rowYCount,
        collXCount,
        cellsInAllNeighborhoods
      );
    });

    // Move all points clockwise around the diamond
    //       [1]                   1                  1
    //      1 1 1                1 1[1]            [1]1 1
    //    1 1 1 1 1           [1]1 1 1 1          1 1 1 1[1]
    // [1]1 1 X 1 1[1] --->  1 1 1 X 1 1 1 ---> 1 1 1 X 1 1 1
    //    1 1 1 1 1            1 1 1 1[1]        [1]1 1 1 1
    //      1 1 1               [1]1 1              1 1[1]
    //       [1]                   1                  1
    corners.north[0]++;
    corners.north[1]++;
    corners.east[0]++;
    corners.east[1]--;
    corners.south[0]--;
    corners.south[1]--;
    corners.west[0]--;
    corners.west[1]++;
  }
}

// Add a cell to the set if it is inside the bounds of the grid
function addCell(row, col, rowYCount, collXCount, cellsInAllNeighborhoods) {
  if (row >= 0 && row < rowYCount && col >= 0 && col < collXCount) {
    cellsInAllNeighborhoods.add(`${row},${col}`);
  }
}
// #endregion

// #region Tests
function test(received, expected) {
  const passed = expected === received ? "O" : "X";
  console.log(passed + " - Expected: " + expected + ", Received: " + received);
}

const startTime = performance.now();

// No points
test(main(5, 5, 2, []), 0);

// No overlap. Nothing out of bounds.
test(main(5, 5, 2, [[2, 2]]), 13);

// No overlap. Nothing out of bounds.
test(main(11, 11, 3, [[5, 5]]), 25);

// 4 cells out of bounds.
test(main(11, 11, 3, [[5, 1]]), 21);

// Two cells. No overlap. Nothing out of bounds.
test(
  main(11, 11, 2, [
    [7, 3],
    [3, 7],
  ]),
  26
);

// Two cells with overlap. Nothing out of bounds.
test(
  main(11, 11, 2, [
    [7, 5],
    [6, 5],
  ]),
  18
);

// Two cells with overlap. Nothing out of bounds.
test(
  main(11, 11, 2, [
    [7, 3],
    [6, 5],
  ]),
  22
);

// Two cells with overlap. 1 cell out of bounds.
test(
  main(11, 11, 4, [
    [3, 5],
    [5, 6],
  ]),
  57
);

// Two cells with overlap. 1 cell out of bounds.
test(
  main(11, 11, 4, [
    [3, 6],
    [5, 6],
  ]),
  56
);

// Two cells with overlap. Nothing out of bounds.
test(
  main(11, 11, 4, [
    [4, 6],
    [5, 6],
  ]),
  50
);

// Two cells with overlap. Nothing out of bounds.
test(
  main(11, 11, 4, [
    [5, 5],
    [5, 6],
  ]),
  50
);

// All cells are out of bounds except the positive cell.
test(main(1, 1, 1, [[0, 0]]), 1);

// Full coverage because row + col <= n + 2.
test(main(2, 8, 8, [[0, 0]]), 16);

// Positive cell in corner. 15 cells out of bounds.
test(main(11, 11, 3, [[0, 0]]), 10);

// Positive cell in corner. 18 cells out of bounds.
test(main(11, 2, 3, [[0, 0]]), 7);

// Positive cell in corner. 7 cells out of bounds.
test(main(10, 10, 2, [[0, 0]]), 6);

// Grid is only 1 column and positive cell is at the top. All cells are out of bounds except n + 1.
test(main(1, 11, 3, [[0, 0]]), 4);

// Very narrow grid with positive cell in top corner.
test(main(2, 11, 3, [[0, 0]]), 7);

// Narrow grid with cell in top center.
test(main(3, 11, 3, [[0, 1]]), 10);

// Positive cells are the same.
test(
  main(10, 10, 2, [
    [1, 1],
    [1, 1],
  ]),
  11
);

// Neighborhoods overlap and have out of bounds cells
test(
  main(10, 10, 2, [
    [1, 1],
    [0, 0],
  ]),
  11
);

// One point is outside the grid and the other has cells that are out of bounds.
test(
  main(10, 10, 3, [
    [15, 15], // This point is outside the grid.
    [1, 1],
  ]),
  17
);

// Distance threshold of 0.
test(
  main(10, 10, 0, [
    [5, 5],
    [1, 1],
    [1, 0],
  ]),
  3
);

// 3 adjacent cells.
test(
  main(20, 20, 4, [
    [5, 6],
    [5, 7],
    [5, 8],
  ]),
  59
);

// Both neighborhoods are cut off.
test(
  main(10, 10, 3, [
    [0, 0],
    [9, 9],
  ]),
  20
);

// Extremely large grid with no overlap. One neightborhood is cut off.
test(
  main(10000000, 10000000, 3, [
    [50000, 50000],
    [1, 1],
  ]),
  42
);

// Huge distance threshold.
test(
  main(100000000, 100000000, 5000000, [[50000000, 50000000]]),
  50000010000001
);

// N >> max(W​, H​)
test(
  main(10, 10, 5000000, [
    [5, 5],
    [4, 4],
  ]),
  100
);
// #endregion

const endTime = performance.now();
console.log(`Time to complete: ${endTime - startTime} milliseconds`);
