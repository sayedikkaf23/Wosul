
const data = require('./country_data')
var Setting = require("mongoose").model("setting");
exports.get_countries_flag_list = async function (req, res) {
  const setting = await Setting.findOne({})
  const flag_list = [];
  for (let i =0; i< data.length; i++) {
    let obj = {
      country_code: data[i].dialling_code,
      country_Name: data[i].country_name,
      flag : `${setting.aws_bucket_url}png_flags/${data[i].country_code.toLowerCase()}.png`,
    //   flag_url: [
    //     `countries_flag/png100px/${property.toLowerCase()}.png`,
    //     `countries_flag/png250px/${property.toLowerCase()}.png`,
    //     `countries_flag/png1000px/${property.toLowerCase()}.png`,
    //   ],
    };
    flag_list.push(obj);
  }
  res.json({
    success: true,
    flag_list: flag_list,
  });
};
