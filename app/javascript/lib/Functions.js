export const sortByName = (obj1, obj2) => (
  obj1.name < obj2.name ? -1 : 1
);

const defaultOptionFns = {
  labelFn: object => object.name,
  valueFn: object => object.id,
}

export const asOption = (object, optionalFns = {}) => {
  const { labelFn, valueFn } = { ...defaultOptionFns, ...optionalFns }

  return {
    value: valueFn(object),
    label: labelFn(object),
  }
};
