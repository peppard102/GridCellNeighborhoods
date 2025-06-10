// Task: Given a 2D array, an (n) distance, and an array of [x,y] positive cell arrays
// Print out how many positive neighboring cells are found within the manhattan distance threshhold of the original positive cells.
// example: X is the original positive cell. 0 = negative; 1 = positive. n = 2; There are 13 positive cells - 12 neighbors (1), 1 original (X)
// 0 0 1 0 0
// 0 1 1 1 0
// 1 1 X 1 1
// 0 1 1 1 0
// 0 0 1 0 0

// Hint: Manhattan distance: [x1 - x2] + [y1 - y2]

// Refer back to the grid cell neighborhood PDF for more details, assumptions, and examples
// Please do not hesistate to reach out with questions!

// Parameters
// collXCount: number - number of columns
// rowYCount: number - number of rows
// n: number - distance threshold
// positiveCellsXYArray: Array<Array>> - array of [x,y] arrays. Ex: [[1,3], [5,5], [5,8]]
function main(collXCount, rowYCount, n, positiveCellsXYArray) {
  // If there are no positive cells, return 0
  if (positiveCellsXYArray.length === 0) return 0;

  // If the distance threshold is 0, return 1
  if (n === 0) return 1;

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
  const corners = {
    north: [startingPointRow - distance, startingPointCol],
    east: [startingPointRow, startingPointCol + distance],
    south: [startingPointRow + distance, startingPointCol],
    west: [startingPointRow, startingPointCol - distance],
  };

  for (let i = 0; i < distance; i++) {
    // Add all cells in this diamond layer to the set
    Object.entries(corners).forEach(([, point]) => {
      addCell(
        point[0],
        point[1],
        rowYCount,
        collXCount,
        cellsInAllNeighborhoods
      );
    });

    // Move all points clockwise around the diamond
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

function test(received, expected) {
  const passed = expected === received ? "O" : "X";
  console.log(passed + " - Expected: " + expected + ", Received: " + received);
}

//#region Tests
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

// These tests were added to make sure it doesn't blow up when the distance threshold is huge.
// test(main(10000000, 10000000, 500000, [[500000, 500000]]), 500001000001);

// test(
//   main(1000000000, 1000000000, 500000, [
//     [1000000000, 1000000000],
//     [0, 0],
//   ]),
//   125000750001
// );
// #endregion
