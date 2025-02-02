export const toUppercase = (text: string) => text.toUpperCase();

export const getStringInfo = (text: string) => {
  return {
    length: text.length,
    array: text.split(""),
    uppercase: text.toUpperCase(),
    lowercase: text.toLowerCase(),
    object: text.split("").reduce((prev, curr) => {
      (prev as any)[curr] = curr.length > 2 ? true : undefined;
      return prev;
    }, {}),
  };
};
