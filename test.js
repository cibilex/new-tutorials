const lists = [
  [1, 4, 1, 2, 5, 7, 2, 21, 321, 54, 1],
  [123, 21, 244, 121, 5, 7, 12, 7, 7, 4, 221],
];

const write = (items) => {
  return items.reduce((curr, prev) => {
    curr % 2 ? prev.unshift(curr) : prev.push(curr);
    return prev;
  }, []);
};

lists.forEach((item) => console.log(write(item)));
