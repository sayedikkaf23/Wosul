module.exports = (function () {
  /**
   * Check for non-nullish value
   * other than null, undefined or blank('')
   */
  this.hasValue = (value) => {
    return ![null, undefined, ""].includes(value);
  };

  this.asyncForEach = async function (array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  };

  return this;
})();
