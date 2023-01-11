module.exports = (function () {
  this.getDistanceFromTwoLocation = (fromLocation, toLocation) => {
    try {
      var lat1 = fromLocation[0];
      var lat2 = toLocation[0];
      var lon1 = fromLocation[1];
      var lon2 = toLocation[1];

      var R = 6371; // km (change this constant to get miles)
      var dLat = ((lat2 - lat1) * Math.PI) / 180;
      var dLon = ((lon2 - lon1) * Math.PI) / 180;
      var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    } catch (error) {
      console.error(error);
    }
  };

  this.checkRequestParam = (params = []) => {
    return (req, res, next) => {
      const body = req.body;
      let missing_param = "";
      let is_missing = false;
      let invalid_param = "";
      let is_invalid_param = false;

      params.forEach(function (param) {
        if (body[param.name] == undefined) {
          missing_param = param.name;
          is_missing = true;
        } else {
          if (param.type && typeof body[param.name] !== param.type) {
            is_invalid_param = true;
            invalid_param = param.name;
          }
        }
      });

      if (is_missing) {
        console.log("missing_param: " + missing_param);
        res.json({
          success: false,
          error_code: ERROR_CODE.PARAMETER_MISSING,
          error_description: missing_param + " parameter missing",
        });
      } else if (is_invalid_param) {
        console.log("invalid_param: " + invalid_param);
        res.json({
          success: false,
          error_code: ERROR_CODE.PARAMETER_INVALID,
          error_description: invalid_param + " parameter invalid",
        });
      } else {
        next();
      }
    };
  };

  return this;
})();
