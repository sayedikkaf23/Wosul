var MassNotification = require("mongoose").model("mass_notification");
var User = require("mongoose").model("user");
var Store = require("mongoose").model("store");
var Provider = require("mongoose").model("provider");
var Group = require("mongoose").model("group");
var Group_user = require("mongoose").model("group_user");
var mongoose = require("mongoose");
var Schema = mongoose.Types.ObjectId;
var utils = require("../utils/utils");
var console = require("../utils/console");

exports.get_mass_notification_list = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "page" }],
    function (response) {
      if (response.success) {
        var country_lookup = {
          $lookup: {
            from: "countries",
            localField: "country",
            foreignField: "_id",
            as: "country_detail",
          },
        };
        var country_query_unwind = {
          $unwind: {
            path: "$country_detail",
            preserveNullAndEmptyArrays: true,
          },
        };
        var city_lookup = {
          $lookup: {
            from: "cities",
            localField: "city",
            foreignField: "_id",
            as: "city_detail",
          },
        };
        var city_query_unwind = {
          $unwind: {
            path: "$city_detail",
            preserveNullAndEmptyArrays: true,
          },
        };
        var request_data_body = request_data.body;
        var page = request_data_body.page;
        var number_of_rec = SEARCH_SORT.NO_OF_RECORD_PER_PAGE;
        var skip = {};
        skip["$skip"] = page * number_of_rec - number_of_rec;
        var limit = {};
        limit["$limit"] = number_of_rec;
        var count = {
          $group: { _id: null, total: { $sum: 1 }, data: { $push: "$data" } },
        };

        MassNotification.aggregate([
          country_lookup,
          country_query_unwind,
          city_lookup,
          city_query_unwind,
          count,
        ]).then(
          (mass_notification_list) => {
            if (mass_notification_list.length == 0) {
              response_data.json({ success: false, pages: 0 });
            } else {
              var pages = Math.ceil(
                mass_notification_list[0].total / number_of_rec
              );
              MassNotification.aggregate([
                country_lookup,
                country_query_unwind,
                city_lookup,
                city_query_unwind,
                skip,
                limit,
              ]).then(
                (mass_notification_list) => {
                  response_data.json({
                    success: true,
                    mass_notification_list: mass_notification_list,
                    pages: pages,
                  });
                },
                (error) => {
                  console.log(error);
                  response_data.json({
                    success: false,
                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
                  });
                }
              );
            }
          },
          (error) => {
            console.log(error);
            response_data.json({
              success: false,
              error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
            });
          }
        );
      } else {
        response_data.json(response);
      }
    }
  );
};

exports.create_mass_notification = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [
      { name: "country", type: "string" },
      { name: "message", type: "string" },
      { name: "img", type: "string" },
      { name: "city", type: "string" },
      { name: "delivery", type: "string" },
    ],
    function (response) {
      if (response.success) {
        console.log("check 1");
        var request_data_body = request_data.body;
        console.log(request_data_body);
        var array_android = [];
        var array_ios = [];
        var array = [];
        var array1 = [];

        if (request_data_body.country == "all") {
          console.log("check 2");
          request_data_body.country = null;
        }
        if (request_data_body.city == "all") {
          request_data_body.city = null;
        }
        if (!request_data_body.delivery) {
          request_data_body.delivery = null;
        }

        var mass_notification = new MassNotification({
          user_type: request_data_body.user_type,
          device_type: request_data_body.device_type,
          message: request_data_body.message,
          country: request_data_body.country,
          delivery: request_data_body.delivery,
          image_url: request_data_body.image_url,
          city: request_data_body.city,
          img: request_data_body.img,
        });

        mass_notification.save(function (error) {
          console.log(error);
          console.log("check 3");
          response_data.json({
            success: true,
            mass_notification_data: mass_notification,
          });
        });

        var country_query = { $match: {} };
        if (request_data_body.country != null) {
          country_query = {
            $match: { country_id: { $eq: Schema(request_data_body.country) } },
          };
        }

        var city_query = { $match: {} };
        if (request_data_body.city != null) {
          city_query = {
            $match: { city_id: { $eq: Schema(request_data_body.city) } },
          };
        }

        var device_type_query = { $match: {} };
        if (request_data_body.device_type != "both") {
          device_type_query = {
            $match: { device_type: { $eq: request_data_body.device_type } },
          };
        }
        var device_token_query = { $match: { device_token: { $ne: "" } } };
        if (request_data_body.user_type == 7) {
          console.log("check 4");
          User.aggregate([
            country_query,
            device_type_query,
            device_token_query,
            { $project: { device_token: "$device_token", device_type: "$device_type", name: "$first_name" } },
            // { $unwind: "$a" },
            // {
            //   $group: {
            //     _id: "$device_type",
            //     device_token: { $addToSet: "$a" },
            //     name : "$first_name"
            //   },
            // },
          ]).then(
            (user_list) => {
              if (user_list.length == 0) {
                console.log("check 5");
              } else {
                console.log('user_list.length :>> ' + user_list.length);
                user_list.forEach((user)=>{
                  const device_token = user.device_token
                  // const device_token = 'c0nSxJZATH2fmBGl2n6tYF:APA91bHdNpnwkjd8FKyfJdQ3NG8JfyW2_l2RXPR1IVJ_DBNmi4_Qbv_EKfxUQpwR2qyT2VDh3eU9HLtPQBhXVdbo6Zi9MpP8HKHJIQAfTIYpmQ3ZzSmUNl9htyivdumNaug_axXoUq8s'
                  const message = {
                    title: request_data_body.heading.replace('%NAME%', user.name),
                    body: request_data_body.message.replace('%NAME%', user.name),
                    image : request_data_body.img
                  };
                  utils.sendNotification(
                    7,  // type
                    user.device_type,
                    device_token,
                    message,
                    ""
                  );
                })
                // console.log("check 6");
                // var split_val = 10;

                // if (user_list[0]._id == "android") {
                //   array_android = user_list[0].device_token;
                // } else {
                //   array_ios = user_list[0].device_token;
                // }

                // if (user_list[1]) {
                //   if (user_list[1]._id == "android") {
                //     array_android = user_list[1].device_token;
                //   } else {
                //     array_ios = user_list[1].device_token;
                //   }
                // }
                // console.log('user_list[0] :>> '+ user_list[0].first_name);
                // if (array_android.length > 0) {
                //   console.log("check 7");
                //   var size = Math.ceil(array_android.length / split_val);
                //   for (i = 0; i <= size - 1; i++) {
                //     if (i == size - 1) {
                //       console.log("check 8");
                //       array = array_android.slice(
                //         i * split_val,
                //         array_android.length
                //       );
                //       var push_data = {
                //         device_type: "android",
                //         // device_token: array,
                //         device_token: ['c0nSxJZATH2fmBGl2n6tYF:APA91bHdNpnwkjd8FKyfJdQ3NG8JfyW2_l2RXPR1IVJ_DBNmi4_Qbv_EKfxUQpwR2qyT2VDh3eU9HLtPQBhXVdbo6Zi9MpP8HKHJIQAfTIYpmQ3ZzSmUNl9htyivdumNaug_axXoUq8s'],
                //         type: 7,
                //         code: USER_PUSH_CODE.MASS_NOTIFICATION,
                //         sound_file_name: "",
                //         message: {
                //           title : request_data_body.heading,
                //           body : request_data_body.message
                //         },
                //         img: request_data_body.img,
                //       };
                //       utils.sendMassNotification(push_data);
                //     } else {
                //       console.log("check 901");
                //       console.log("array.length" + array.length)
                //       array = array_android.slice(
                //         i * split_val,
                //         i * split_val + split_val
                //       );
                //       var push_data = {
                //         device_type: "android",
                //         // device_token: array,
                //         device_token: ['c0nSxJZATH2fmBGl2n6tYF:APA91bHdNpnwkjd8FKyfJdQ3NG8JfyW2_l2RXPR1IVJ_DBNmi4_Qbv_EKfxUQpwR2qyT2VDh3eU9HLtPQBhXVdbo6Zi9MpP8HKHJIQAfTIYpmQ3ZzSmUNl9htyivdumNaug_axXoUq8s'],
                //         type: 7,
                //         code: USER_PUSH_CODE.MASS_NOTIFICATION,
                //         sound_file_name: "",
                //         message: {
                //           title : request_data_body.heading,
                //           body : request_data_body.message
                //         },
                //         img: request_data_body.img,
                //       };
                //       utils.sendMassNotification(push_data);
                //     }
                //   }
                // }

                // if (array_ios.length > 0) {
                //   console.log("check 10");
                //   var size = Math.ceil(array_ios.length / split_val);
                //   for (i = 0; i <= size - 1; i++) {
                //     if (i == size - 1) {
                //       array = array_ios.slice(i * split_val, array_ios.length);
                //       var push_data = {
                //         device_type: "ios",
                //         device_token: array,
                //         type: 7,
                //         code: USER_PUSH_CODE.MASS_NOTIFICATION,
                //         sound_file_name: "",
                //         message: request_data_body.message,
                //         img: request_data_body.img,
                //       };
                //       utils.sendMassNotification(push_data);
                //     } else {
                //       console.log("check 11");
                //       array = array_ios.slice(
                //         i * split_val,
                //         i * split_val + split_val
                //       );
                //       var push_data = {
                //         device_type: "ios",
                //         device_token: array,
                //         type: 7,
                //         code: USER_PUSH_CODE.MASS_NOTIFICATION,
                //         sound_file_name: "",
                //         message: request_data_body.message,
                //         img: request_data_body.img,
                //       };
                //       utils.sendMassNotification(push_data);
                //     }
                //   }
                // }
              }
            },
            (error) => {
              console.log(error);
              response_data.json({
                success: false,
                error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
              });
            }
          );
        } else if (request_data_body.user_type == 2) {
          console.log("store");
          Store.aggregate([
            country_query,
            city_query,
            device_type_query,
            device_token_query,
            { $project: { a: "$device_token", device_type: "$device_type" } },
            { $unwind: "$a" },
            {
              $group: {
                _id: "$device_type",
                device_token: { $addToSet: "$a" },
              },
            },
          ]).then(
            (user_list) => {
              if (user_list.length == 0) {
              } else {
                var split_val = 10;
                if (user_list[0]._id == "android") {
                  array_android = user_list[0].device_token;
                } else {
                  array_ios = user_list[0].device_token;
                }

                if (user_list[1]) {
                  if (user_list[1]._id == "android") {
                    array_android = user_list[1].device_token;
                  } else {
                    array_ios = user_list[1].device_token;
                  }
                }

                if (array_android.length > 0) {
                  var size = Math.ceil(array_android.length / split_val);
                  for (i = 0; i <= size - 1; i++) {
                    if (i == size - 1) {
                      array = array_android.slice(
                        i * split_val,
                        array_android.length
                      );
                      var push_data = {
                        device_type: "android",
                        device_token: array,
                        device_token: ["c0nSxJZATH2fmBGl2n6tYF:APA91bHdNpnwkjd8FKyfJdQ3NG8JfyW2_l2RXPR1IVJ_DBNmi4_Qbv_EKfxUQpwR2qyT2VDh3eU9HLtPQBhXVdbo6Zi9MpP8HKHJIQAfTIYpmQ3ZzSmUNl9htyivdumNaug_axXoUq8s"],
                        type: 2,
                        sound_file_name: "",
                        message: request_data_body.message,
                        img: request_data_body.img,
                      };
                      utils.sendMassNotification(push_data);
                    } else {
                      array = array_android.slice(
                        i * split_val,
                        i * split_val + split_val
                      );
                      var push_data = {
                        device_type: "android",
                        device_token: array,
                        device_token: ["c0nSxJZATH2fmBGl2n6tYF:APA91bHdNpnwkjd8FKyfJdQ3NG8JfyW2_l2RXPR1IVJ_DBNmi4_Qbv_EKfxUQpwR2qyT2VDh3eU9HLtPQBhXVdbo6Zi9MpP8HKHJIQAfTIYpmQ3ZzSmUNl9htyivdumNaug_axXoUq8s"],
                        type: 2,
                        sound_file_name: "",
                        message: request_data_body.message,
                        img: request_data_body.img,
                      };
                      utils.sendMassNotification(push_data);
                    }
                  }
                }

                if (array_ios.length > 0) {
                  var size = Math.ceil(array_ios.length / split_val);
                  for (i = 0; i <= size - 1; i++) {
                    if (i == size - 1) {
                      array = array_ios.slice(i * split_val, array_ios.length);
                      var push_data = {
                        device_type: "ios",
                        device_token: array,
                        type: 2,
                        sound_file_name: "",
                        message: request_data_body.message,
                        img: request_data_body.img,
                      };
                      utils.sendMassNotification(push_data);
                    } else {
                      array = array_ios.slice(
                        i * split_val,
                        i * split_val + split_val
                      );
                      var push_data = {
                        device_type: "ios",
                        device_token: array,
                        type: 2,
                        sound_file_name: "",
                        message: request_data_body.message,
                        img: request_data_body.img,
                      };
                      utils.sendMassNotification(push_data);
                    }
                  }
                }
              }
            },
            (error) => {
              console.log(error);
              response_data.json({
                success: false,
                error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
              });
            }
          );
        } else if (request_data_body.user_type == 8) {
          var device_token_query = { $match: { device_token: { $ne: "" } } };
          Provider.aggregate([
            country_query,
            city_query,
            device_type_query,
            device_token_query,
            { $project: { a: "$device_token", device_type: "$device_type" } },
            { $unwind: "$a" },
            {
              $group: {
                _id: "$device_type",
                device_token: { $addToSet: "$a" },
              },
            },
          ]).then(
            (user_list) => {
              if (user_list.length == 0) {
              } else {
                var split_val = 10;
                if (user_list[0]._id == "android") {
                  array_android = user_list[0].device_token;
                } else {
                  array_ios = user_list[0].device_token;
                }

                if (user_list[1]) {
                  if (user_list[1]._id == "android") {
                    array_android = user_list[1].device_token;
                  } else {
                    array_ios = user_list[1].device_token;
                  }
                }

                if (array_android.length > 0) {
                  var size = Math.ceil(array_android.length / split_val);
                  for (i = 0; i <= size - 1; i++) {
                    if (i == size - 1) {
                      array = array_android.slice(
                        i * split_val,
                        array_android.length
                      );
                      var push_data = {
                        device_type: "android",
                        device_token: array,
                        type: 8,
                        sound_file_name: "",
                        message: request_data_body.message,
                        img: request_data_body.img,
                      };
                      utils.sendMassNotification(push_data);
                    } else {
                      array = array_android.slice(
                        i * split_val,
                        i * split_val + split_val
                      );
                      var push_data = {
                        device_type: "android",
                        device_token: array,
                        type: 8,
                        sound_file_name: "",
                        message: request_data_body.message,
                        img: request_data_body.img,
                      };
                      utils.sendMassNotification(push_data);
                    }
                  }
                }

                if (array_ios.length > 0) {
                  var size = Math.ceil(array_ios.length / split_val);
                  for (i = 0; i <= size - 1; i++) {
                    if (i == size - 1) {
                      array = array_ios.slice(i * split_val, array_ios.length);
                      var push_data = {
                        device_type: "ios",
                        device_token: array,
                        type: 8,
                        sound_file_name: "",
                        message: request_data_body.message,
                        img: request_data_body.img,
                      };
                      utils.sendMassNotification(push_data);
                    } else {
                      array = array_ios.slice(
                        i * split_val,
                        i * split_val + split_val
                      );
                      var push_data = {
                        device_type: "ios",
                        device_token: array,
                        type: 8,
                        sound_file_name: "",
                        message: request_data_body.message,
                        img: request_data_body.img,
                      };
                      utils.sendMassNotification(push_data);
                    }
                  }
                }
              }
            },
            (error) => {
              console.log(error);
              response_data.json({
                success: false,
                error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
              });
            }
          );
        }
      } else {
        response_data.json(response);
      }
    }
  );
};
exports.add_notification_group = async function (req, res) {
  const group = await Group.findOne({ group_name: req.body.group_name });
  if (!group) {
    const group = new Group({
      group_name: req.body.group_name,
      users_phone: req.body.users_no,
    });
    group.save();
    const users = await User.find({ phone: { $in: req.body.users_no } });
    if (users.length == 0) {
      res.json({
        success: false,
        message: "User not found",
      });
    } else {
      const check = users.map((user) => ({
        user_id: user._id,
        phone: user.phone,
        group_id: group._id,
        group_name: group.group_name,
      }));
      const new_group_user = await Group_user.insertMany(check);
      console.log(">>>>", users);
      res.json({
        success: true,
        group,
        new_group_user,
      });
    }
  } else {
    group.users_phone = req.body.users_no
    group.save()
    res.json({
      success: true,
      group,
      message : "Group Updated Successfully"
    });
  }
};

exports.get_notification_group = async function(req, res){
  const group_list = await Group.find({}).sort({created_at : -1})
  if(group_list.length > 0){
    res.json({
      success : true,
      data : group_list
    })
  }else{
    res.json({
      success : false,
      message : "No Record found"
    })
  }
}
exports.send_group_notification = async function(req, res){
  const {group_id, group_name, message_title, message_body, image_url} = req.body
  const group = await Group.findOne({_id : group_id});
  if(!group){
    res.json({
      success : false,
      message : "Group not found"
    })
  }else{
    const users = await User.find({phone : {$in : group.users_phone}})
    if(users.length > 0){
      users.forEach(async(user)=>{
        var message = {
          title: message_title.replace('%NAME%', user.first_name),
          body: message_body,
          image : image_url
        };
        // var device_type = "android";
        // var device_token = "dM_tWNorRPicSmU1t99Csp:APA91bGgZvSn_nSYAKmTc-fCqjtMhB_xHkf5opikaW5wJs1gTJGkdN55kX75I7jM1HOnDvFCrbQQWWvOdgGFoXGdrbDoyNCsNOQb2e7L02vfLSpWGYYQI6o5UyfdnXpQwgub6OSf5wYV";
        var device_type = user.device_type;
        var device_token = user.device_token;
        utils.sendNotification(
          ADMIN_DATA_ID.USER,
          device_type,
          device_token,
          message,
          ""
        );
      })
      res.json({
        success : true,
        group_name : group.group_name
      })
    }
  }
}