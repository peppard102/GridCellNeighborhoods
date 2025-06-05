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
  function inRange(cell) {
    return (
      cell[0] >= 0 &&
      cell[0] < rowYCount &&
      cell[1] >= 0 &&
      cell[1] < collXCount
    );
  }

  // Add a cell to the set if it is inside the bounds of the grid
  function addCell(cell) {
    if (inRange(cell)) {
      cellsInAllNeighborhoods.add(`${cell[0]},${cell[1]}`);
    }
  }

  //#region Diamond traversal functions
  // Add a bar of cells to the set, going clockwise from the starting point.
  function addSouthWestSide(startingPoint, distance) {
    let [row, col] = startingPoint;

    for (let i = 0; i < distance; i++) {
      addCell([row, col]);
      row--;
      col--;
    }
  }

  // Add a bar of cells to the set, going clockwise from the starting point.
  function addSouthEastSide(startingPoint, distance) {
    let [row, col] = startingPoint;

    for (let i = 0; i < distance; i++) {
      addCell([row, col]);
      row++;
      col--;
    }
  }

  // Add a bar of cells to the set, going clockwise from the starting point.
  function addNorthEastSide(startingPoint, distance) {
    let [row, col] = startingPoint;

    for (let i = 0; i < distance; i++) {
      addCell([row, col]);
      row++;
      col++;
    }
  }

  // Add a bar of cells to the set, going clockwise from the starting point.
  function addNorthWestSide(startingPoint, distance) {
    let [row, col] = startingPoint;

    for (let i = 0; i < distance; i++) {
      addCell([row, col]);
      row--;
      col++;
    }
  }
  //#endregion

  for (let i = 0; i < positiveCellsXYArray.length; i++) {
    let centerpoint = positiveCellsXYArray[i];
    addCell(centerpoint); // Add the centerpoint to the set

    // Add each diamond layer to the set
    for (
      let distanceFromCenter = 1;
      distanceFromCenter <= n;
      distanceFromCenter++
    ) {
      // Find the 4 corners of each diamond around the centerpoint
      let southernmostPoint = [
        centerpoint[0] + distanceFromCenter,
        centerpoint[1],
      ];
      let easternmostPoint = [
        centerpoint[0],
        centerpoint[1] + distanceFromCenter,
      ];
      let northernmostPoint = [
        centerpoint[0] - distanceFromCenter,
        centerpoint[1],
      ];
      let westernmostPoint = [
        centerpoint[0],
        centerpoint[1] - distanceFromCenter,
      ];

      // Add each side of the diamond to the set
      addSouthWestSide(southernmostPoint, distanceFromCenter);
      addSouthEastSide(easternmostPoint, distanceFromCenter);
      addNorthEastSide(northernmostPoint, distanceFromCenter);
      addNorthWestSide(westernmostPoint, distanceFromCenter);
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
