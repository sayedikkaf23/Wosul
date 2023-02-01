var card = require("../../controllers/user/card"); // include card controller ////
const { authMiddleware } = require("../../middleware/checkAuth");

module.exports = function (app) {
  app.route("/api/user/add_card").post(card.add_card);
  app.route("/api/user/get_card_list").post(card.get_card_list);
  app.route("/api/user/google_pay").post(card.google_pay);
  app.route("/api/user/apple_pay").post(card.apple_pay);
  app.post("/api/user/delete_card", authMiddleware, card.delete_card);
  app.route("/api/user/select_card").post(card.select_card);
  app.route("/api/user/select_card").post(card.select_card);
  app.route("/api/user/set_card_default").post(card.set_card_default);
};
