export enum DataTransformTypes {
  selectWithKey = "selectWithKey",
}

export const DataTransformTypesList: {
  key: string;
  value: string;
}[] = Object.entries(DataTransformTypes).map(([key, value]) => ({
  key,
  value,
}));

export const resolveDataTransform = (
  tranformProperties: any,
  transformType: DataTransformTypes,
  data: any
) => {
  switch (transformType) {
    case DataTransformTypes.selectWithKey:

      const map = data.map((d: any) => {
        return { [tranformProperties]: d };
      });

      return map;
    default:
      return {};
  }
};
