type Id = string | number;

const getType = <T extends any>(idMap: Record<Id, T>, id: Id) => {
  if (id === null) {
    return null;
  }

  return idMap[id];
}

export default getType;
