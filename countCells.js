// Parameters
// collXCount: number - number of columns
// rowYCount: number - number of rows
// n: number - distance threshold
// positiveCellsXYArray: Array<Array>> - array of [x,y] arrays. Ex: [[1,3], [5,5], [5,8]]
function main(collXCount, rowYCount, n, positiveCellsXYArray) {
  const positivePoints = cleanData(collXCount, rowYCount, positiveCellsXYArray);

  // If there are no positive cells, return 0
  if (positivePoints.length === 0) return 0;

  // If the distance threshold is 0, return the number of points
  if (n === 0) return positivePoints.length;

  if (guaranteedFullCoverage(collXCount, rowYCount, n))
    return collXCount * rowYCount;

  const cellsInAllNeighborhoods = new Set(); // Use a set to avoid duplicate values

  // Run the loop once for each positive value
  for (let i = 0; i < positivePoints.length; i++) {
    const [centerpointRow, centerpointCol] = positivePoints[i];

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

const startTime = performance.now();

// #region Tests
function test(received, expected) {
  const passed = expected === received ? "O" : "X";
  console.log(passed + " - Expected: " + expected + ", Received: " + received);
}

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

// N >> max(W​, H​)
test(
  main(10, 10, 5000000, [
    [5, 5],
    [4, 4],
  ]),
  100
);

// Extremely large grid with no overlap. One neightborhood is cut off.
test(
  main(10000000, 10000000, 3, [
    [50000, 50000],
    [1, 1],
  ]),
  42
);
// #endregion

const endTime = performance.now();
console.log(`Time to complete: ${endTime - startTime} milliseconds`);
