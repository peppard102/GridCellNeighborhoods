function main(collXCount, rowYCount, n, positiveCellsXYArray) {
  console.log("--------------------------------");

  // If there are no positive cells, return 0
  if (positiveCellsXYArray.length === 0) return 0;

  // If the distance threshold is 0, return 1
  if (n === 0) return 1;

  const maximumCells = maxCellsPerNeighborhood(n) * positiveCellsXYArray.length;
  console.log("maximumCells", maximumCells);

  positiveCellsXYArray.forEach((point) => {
    if (isCutOff(collXCount, rowYCount, n, point)) console.log("Cut off");
  });

  if (positiveCellsXYArray.length > 1) {
    for (let i = 0; i < positiveCellsXYArray.length; i++) {
      for (let j = i + 1; j < positiveCellsXYArray.length; j++) {
        if (hasOverlap(positiveCellsXYArray[i], positiveCellsXYArray[j], n))
          console.log("Overlap");
      }
    }
  }

  return maximumCells;
}

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
