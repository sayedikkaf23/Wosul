var mongoose = require("mongoose");
const ftp_server_details = require("../../models/ftp_server/ftp_server_details");
const admin = require("../../models/admin/admin");
var xlsx = require("node-xlsx");
var fs = require("fs");
const path = require("path");
//for get ftp_server
exports.get_ftp_server_details = async function (req, res) {
  try {
    const ftp_server_list = await ftp_server_details.find();
    if (ftp_server_list) {
      res.json({
        success: true,
        ftp_server_list,
      });
      return;
    } else {
      res.json({
        success: false,
      });
      return;
    }
  } catch (error) {
    res.statusCode = 500;
    res.json({
      success: false,
      message: error.message,
    });
  }
};

//for add ftp_server
exports.add_ftp_server_details = async function (req, res) {
  try {
    const {
      store_id,
      host,
      port,
      user,
      password,
      header_details,
      filter,
      server_token,
    } = req.body;
    const check_user = await admin.findOne({ server_token });
    if (!check_user) {
      res.json({
        success: false,
      });
      return;
    } else {
      let ftpDetails = { store_id, host, port, user, password };
      if (header_details) {
        ftpDetails.header_details = header_details;
      }
      if (filter) {
        ftpDetails.filter = filter;
      }
      const ftp_server = await ftp_server_details.create(ftpDetails);
      if (ftp_server) {
        res.json({
          success: true,
          ftp_server,
          message: "Added Successfully",
        });
        return;
      } else {
        res.json({
          success: false,
          message: "Something Went Wrong",
        });
        return;
      }
    }
  } catch (error) {
    res.statusCode = 500;
    res.json({
      success: false,
      message: error.message,
    });
  }
};

//for update ftp_server
exports.update_ftp_server_details = async function (req, res) {
  try {
    const {
      _id,
      store_id,
      host,
      port,
      user,
      password,
      header_details,
      filter,
      server_token,
    } = req.body;
    const check_user = await admin.findOne({ server_token });
    if (!check_user) {
      res.json({
        success: false,
      });
      return;
    } else {
      let ftpDetails = { store_id, host, port, user, password };
      console.log("_id: ", _id);
      if (header_details) {
        ftpDetails.header_details = header_details;
      }
      if (filter) {
        ftpDetails.filter = filter;
      }
      const ftp_server = await ftp_server_details.findByIdAndUpdate(_id, {
        $set: ftpDetails,
      });

      if (ftp_server) {
        res.json({
          success: true,
          message: "Updated Successfully",
        });
        return;
      } else {
        res.json({
          success: false,
          message: "Something Went Wrong",
        });
        return;
      }
    }
  } catch (error) {
    res.statusCode = 500;
    res.json({
      success: false,
      message: error.message,
    });
  }
};

//for delete ftp server detail
exports.delete_ftp_server = async function (req, res) {
  try {
    const { ftp_server_id, server_token } = req.body;

    const user = await admin.findOne({ server_token });
    if (!user) {
      res.json({
        success: false,
      });
      return;
    } else {
      const ftp_server = await ftp_server_details.findOneAndDelete({
        _id: ftp_server_id,
      });

      if (ftp_server) {
        res.json({
          success: true,
          message: "Delete Successfully",
        });
        return;
      } else {
        res.json({
          success: false,
          message: "Something Went Wrong",
        });
        return;
      }
    }
  } catch (error) {
    res.statusCode = 500;
    res.json({
      success: false,
      message: error.message,
    });
  }
};

//for get ftp server  detail by id
exports.get_ftp_server_detail_by_id = async function (req, res) {
  try {
    const { ftp_server_id, server_token } = req.body;
    const user = await admin.findOne({ server_token });
    if (!user) {
      res.json({
        success: false,
      });
      return;
    } else {
      var ftp_server_condition = {
        $match: {
          _id: {
            $eq: mongoose.Types.ObjectId(ftp_server_id),
          },
        },
      };
      var store_query = {
        $lookup: {
          from: "stores",
          localField: "store_id",
          foreignField: "_id",
          as: "store_details",
        },
      };
      var array_to_json1 = { $unwind: "$store_details" };
      ftp_server_details
        .aggregate([ftp_server_condition, store_query, array_to_json1])
        .then(
          (ftp_server) => {
            if (ftp_server.length == 0) {
              res.json({
                success: false,
                error_code: SERVICE_ERROR_CODE.SERVICE_DATA_NOT_FOUND,
              });
            } else {
              res.json({
                success: true,
                message: PRODUCT_MESSAGE_CODE.PRODUCT_LIST_SUCCESSFULLY,
                ftp_server: ftp_server[0],
              });
            }
          },
          (error) => {
            console.log(error);
            res.json({
              success: false,
              error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
            });
          }
        );
    }
  } catch (error) {
    res.statusCode = 500;
    res.json({
      success: false,
      message: error.message,
    });
  }
};

//for uploading excel to store header details
exports.upload_header_data_excel = async function (req, res) {
  try {
    console.log("upload_header_data_excel :>> " + JSON.stringify(req.body));
    let headers;
    if (req.files.length > 0) {
      var obj = xlsx.parse(fs.readFileSync(req.files[0].path));
      var array_of_data = obj[0].data;
      [headers] = array_of_data;
      res.json({
        success: true,
        Header_Details: headers,
      });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    res.statusCode = 500;
    res.json({
      success: false,
      message: error.message,
    });
  }
};
