var store_promo_code = require("../../controllers/store/store_promo_code"); // include store_promo_code controller ////
const { authMiddleware } = require("../../middleware/checkAuth");

module.exports = function (app) {
  app.post(
    "/api/store/add_promo",
    authMiddleware,
    store_promo_code.store_add_promo
  );
  app.post(
    "/api/store/promo_code_list",
    authMiddleware,
    store_promo_code.store_promo_code_list
  );
  app.post(
    "/api/store/update_promo_code",
    authMiddleware,
    store_promo_code.store_update_promo_code
  );

  app.post(
    "/api/store/check_promo_code",
    authMiddleware,
    store_promo_code.store_check_promo_code
  );
  app.post(
    "/api/store/search_sort_promo_code_list",
    authMiddleware,
    store_promo_code.search_sort_promo_code_list
  );
};
