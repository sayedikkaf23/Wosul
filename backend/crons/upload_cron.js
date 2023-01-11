const CronJob = require("cron").CronJob;
const { updateItemDescAndVat } = require("../app/services/admin.service");
const uploadCron = require("../app/models/uploadCron.model");
const { asyncForEach } = require("../app/helpers/utils.helper");
const xlsx = require("node-xlsx");
const fs = require("fs");

const checkUpload = async () => {
  const uploads = await uploadCron.find({}).lean();
  if (uploads.length) {
    console.log("Pending uploads found - " + uploads.length);
    asyncForEach(uploads, async (upload) => {
      const obj = xlsx.parse(fs.readFileSync(upload.filePath));
      const array_of_data = obj[0].data;
      await uploadCron.deleteOne({ _id: upload._id });
      updateItemDescAndVat(array_of_data, upload.storeId);
      console.log(
        "upload._id:>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> " + upload._id
      );
    });
  } else {
    console.log("No pending uploads!");
  }
};

const cronString = "*/1 * * * *";
const job = new CronJob(cronString, checkUpload, null, true, "Asia/Dubai");
job.start();
console.log("Upload cron started...");
console.log("************************************");
