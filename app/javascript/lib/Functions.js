const sortByName = (obj1, obj2) => (
  obj1.name < obj2.name ? -1 : 1
);

const fns = {
  sortByName: sortByName,
};

export default fns;