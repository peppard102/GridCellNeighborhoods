function main(collXCount, rowYCount, n, positiveCellsXYArray) {
  console.log("--------------------------------");
  let numCells = 0;

  // If there are no positive cells, return 0
  if (positiveCellsXYArray.length === 0) return 0;

  // If the distance threshold is 0, return 1
  if (n === 0) return 1;

  numCells = maxCellsPerNeighborhood(n) * positiveCellsXYArray.length;
  console.log("maximumCells", numCells);

  // Check if any neighborhoods are cut off
  positiveCellsXYArray.forEach((point) => {
    if (isCutOff(collXCount, rowYCount, n, point)) console.log("Cut off");
  });

  // Check if any neighborhoods overlap
  if (positiveCellsXYArray.length > 1) {
    for (let i = 0; i < positiveCellsXYArray.length; i++) {
      for (let j = i + 1; j < positiveCellsXYArray.length; j++) {
        if (hasOverlap(positiveCellsXYArray[i], positiveCellsXYArray[j], n))
          console.log("Overlap");
      }
    }
  }

  // Adjust for when one side of the neighborhood is cut off
  positiveCellsXYArray.forEach((point) => {
    const numCellsOutsideGrid = cellsOutsideGrid(
      collXCount,
      rowYCount,
      n,
      point
    );
    if (numCellsOutsideGrid) {
      console.log("numCellsOutsideGrid: ", numCellsOutsideGrid);
      numCells -= numCellsOutsideGrid;
    }
  });

  return numCells;
}

// This is the manhattan distance equation given in the PDF
function manhattanDistance(pointA, pointB) {
  return Math.abs(pointA[0] - pointB[0]) + Math.abs(pointA[1] - pointB[1]);
}

function maxCellsPerNeighborhood(n) {
  return n ** 2 + (n + 1) ** 2;
}

function hasOverlap(pointA, pointB, n) {
  return manhattanDistance(pointA, pointB) <= n * 2;
}

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

function cellsInCompleteRows(numRows) {
  return numRows ** 2;
}

// https://www.geeksforgeeks.org/triangular-numbers/
// The triangular number sequence is normally defined as n(n+1)/2, but we need to chop off part of the triangle.
// This function is useful for when the neighborhood is in the corner of the grid.
function truncatedTriangularNumberSequence(triangleHeight, numRowsToRemove) {
  return (
    (triangleHeight * (triangleHeight + 1)) / 2 -
    (numRowsToRemove * (numRowsToRemove + 1)) / 2
  );
}

function cellsOutsideGrid(collXCount, rowYCount, n, point) {
  // This first n + 1 rows lost are complete rows. Any additional rows lost are partial rows.
  const maxCompleteRowsLost = n + 1;
  let totalCellsLost = 0;
  const rowsLostOnTop = point[0] < n ? n - point[0] : 0;
  const rowsLostOnRight =
    point[1] > collXCount - n - 1 ? point[1] - (collXCount - n - 1) : 0;
  const rowsLostOnBottom =
    point[0] > rowYCount - n - 1 ? point[0] - (rowYCount - n - 1) : 0;
  const rowsLostOnLeft = point[1] < n ? n - point[1] : 0;

  // The rows on top that we lost will all be considered complete rows.
  if (rowsLostOnTop) totalCellsLost += cellsInCompleteRows(rowsLostOnTop);

  if (rowsLostOnRight) {
    // If the total rows lost is less than or equal to n + 1, then all the rows lost on the right are complete rows.
    if (rowsLostOnRight + rowsLostOnTop <= maxCompleteRowsLost)
      totalCellsLost += cellsInCompleteRows(rowsLostOnRight);
    else {
      // How many partial vs complete?
      const completeRows = maxCompleteRowsLost - rowsLostOnTop;
      totalCellsLost += cellsInCompleteRows(completeRows);

      const cellsInPartialRows = truncatedTriangularNumberSequence(
        rowsLostOnRight,
        completeRows
      );

      totalCellsLost += cellsInPartialRows;
    }
  }

  if (rowsLostOnBottom) {
    // If the total rows lost is less than or equal to n + 1, then all the rows lost on the right are complete rows.
    if (rowsLostOnBottom + rowsLostOnRight <= maxCompleteRowsLost)
      totalCellsLost += cellsInCompleteRows(rowsLostOnBottom);
    else {
      // How many partial vs complete?
      const completeRows = maxCompleteRowsLost - rowsLostOnRight;
      totalCellsLost += cellsInCompleteRows(completeRows);

      const cellsInPartialRows = truncatedTriangularNumberSequence(
        rowsLostOnBottom,
        completeRows
      );

      totalCellsLost += cellsInPartialRows;
    }
  }

  if (rowsLostOnLeft) {
    // If the total rows lost is less than or equal to n + 1, then all the rows lost on the right are complete rows.
    if (rowsLostOnLeft + rowsLostOnBottom <= maxCompleteRowsLost)
      totalCellsLost += cellsInCompleteRows(rowsLostOnLeft);
    else {
      // How many partial vs complete?
      const completeRows = maxCompleteRowsLost - rowsLostOnBottom;
      totalCellsLost += cellsInCompleteRows(completeRows);

      const cellsInPartialRows = truncatedTriangularNumberSequence(
        rowsLostOnLeft,
        completeRows
      );

      totalCellsLost += cellsInPartialRows;
    }
  }

  return totalCellsLost;
}

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
test(main(2, 11, 3, [[0, 0]]), 7);
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
    [15, 15],
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
  500001000001 // TODO: Fix this answer
);
// #endregion
