module.exports = {
  chunk: function (array, size) {
    if (!Array.isArray(array)) throw new Error("array must be an array");
    if (typeof size !== "number") throw new Error("size must be a number");
    const chunked_arr = [];
    for (let i = 0; i < array.length; i += size) {
      chunked_arr.push(array.slice(i, i + size));
    }
    return chunked_arr;
  },
};
