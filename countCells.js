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
// Please do not hesistate to reach out with an questions!

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

  // Check if the cell is inside the bounds of the grid
  function inRange(row, col) {
    return (
      row >= 0 &&
      row < rowYCount &&
      col >= 0 &&
      col < collXCount
    );
  }

  // Add a cell to the set if it is inside the bounds of the grid
  function addCell(row, col) {
    if (inRange(row, col)) {
      cellsInAllNeighborhoods.add(`${row},${col}`);
    }
  }

  function traverseDiamondLayer(startingPointRow, startingPointCol, distance) {
    // Find the 4 corners of this diamond layer
    const southernmostPoint = [
      startingPointRow + distance,
      startingPointCol,
    ];
    const easternmostPoint = [
      startingPointRow,
      startingPointCol + distance,
    ];
    const northernmostPoint = [
      startingPointRow - distance,
      startingPointCol,
    ];
    const westernmostPoint = [
      startingPointRow,
      startingPointCol - distance,
    ];

    for (let i = 0; i < distance; i++) {
      // Add all cells in this diamond layer to the set
      addCell(northernmostPoint[0], northernmostPoint[1]);
      addCell(easternmostPoint[0], easternmostPoint[1]);
      addCell(southernmostPoint[0], southernmostPoint[1]);
      addCell(westernmostPoint[0], westernmostPoint[1]);

      // Move all points clockwise around the diamond
      northernmostPoint[0]++;
      northernmostPoint[1]++;
      easternmostPoint[0]++;
      easternmostPoint[1]--;
      southernmostPoint[0]--;
      southernmostPoint[1]--;
      westernmostPoint[0]--;
      westernmostPoint[1]++;
    }
  }

  // Run the loop once for each positive value
  for (let i = 0; i < positiveCellsXYArray.length; i++) {
    const [centerpointRow, centerpointCol] = positiveCellsXYArray[i];
    addCell(centerpointRow, centerpointCol); // Add the centerpoint to the set

    // Add each diamond layer to the set. The number of diamond layers is equal to the distance 
    // threshold. We will start with the innermost diamond around the centerpoint/positive cell and move 
    // outward.
    for (
      let distanceFromCenter = 1;
      distanceFromCenter <= n;
      distanceFromCenter++
    ) {
      traverseDiamondLayer(centerpointRow, centerpointCol, distanceFromCenter);
    }
  }

  return cellsInAllNeighborhoods.size;
}

function test(received, expected) {
  const passed = expected === received ? "O" : "X";
  console.log(passed + " - Expected: " + expected + ", Received: " + received);
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
//#endregion
