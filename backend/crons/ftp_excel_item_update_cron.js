const CronJob = require("cron").CronJob;
const { updateItemDescAndVat } = require("../app/services/admin.service");
const uploadCron = require("../app/models/uploadCron.model");
const { asyncForEach } = require("../app/helpers/utils.helper");
const xlsx = require("node-xlsx");
const ftp = require("basic-ftp");
const ftp_server_details = require("../app/models/ftp_server/ftp_server_details");
const Item = require("../app/models/store/item");
const mongoose = require("mongoose");
const { response } = require("express");

async function getDataFromFTPServerAndParse(host, port, user, password) {
  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    const config = {
      host: host,
      port: port,
      user: user,
      password: password,
      // secure: true, //secure (boolean | "implicit") Explicit FTPS over TLS, default: false. Use "implicit" if you need support for legacy implicit FTPS.
    };
    await client.access({
      host: host,
      port: port,
      user: user,
      password: password,
      secure: "implicit",
      secureOptions: {
        rejectUnauthorized: false,
      },
    });
    const list = await (
      await client.list(".")
    ).sort((a, b) => new Date(a.modifiedAt) - new Date(b.modifiedAt));
    let fileToUpdate;
    if (list.length) {
      [fileToUpdate] = list;
    }
    if (fileToUpdate) {
      await client.downloadTo("ftp.csv", fileToUpdate.name);
    }
    const xlsx = require("node-xlsx");
    return xlsx.parse("ftp.csv");
  } catch (err) {
    console.log("err: ", err);
  }
  client.close();
}

const getFileFromFTPServer = async () => {
  //For Find Ftp_server_details
  const ftp_server = await ftp_server_details.find().lean();
  if (ftp_server.length) {
    await asyncForEach(ftp_server, async (ftp_details) => {
      const data = await getDataFromFTPServerAndParse(
        ftp_details.host,
        ftp_details.port,
        ftp_details.user,
        ftp_details.password
      );
      let ftp_server_data;
      if (data && data.length) {
        [ftp_server_data] = data;
        if (ftp_server_data && ftp_server_data.data) {
          getFTPServerDetails(ftp_details, ftp_server_data.data);
        }
      } else {
        console.log("Data not found!", data);
      }
    });
  }
};

const getFTPServerDetails = (ftp_details, data) => {
  let headers;
  if (data.length) {
    [headers] = data;
    data.splice(0, 1);
    data.forEach((item) => {
      let store_id = ftp_details.store_id;
      let filter = { store_id };
      let set = {};
      switch (ftp_details.filter.type) {
        case "number":
          filter[ftp_details.filter.key] = Number(
            item[ftp_details.filter.value]
          );
          break;

        case "boolean":
          set[hdr.key] =
            Number(item[ftp_details.filter.value]) > 0 ? true : false;
          break;

        case "string":
          set[hdr.key] = item[ftp_details.filter.value];
          break;

        default:
          set[hdr.key] = item[ftp_details.filter.value];
          break;
      }

      ftp_details.headers_details.forEach((hdr) => {
        switch (hdr.type) {
          case "number":
            set[hdr.key] = Number(item[hdr.value]);
            break;

          case "boolean":
            set[hdr.key] = Number(item[hdr.value]) > 0 ? true : false;
            break;

          case "string":
            set[hdr.key] = item[hdr.value];
            break;

          default:
            set[hdr.key] = item[hdr.value];
            break;
        }
        Item.updateOne(filter, { $set: { set } }).then((res) => {
          console.log("item updated: ", res);
        });
      });
    });
  }
};

// (async function () {
//   await getFileFromFTPServer();
// })();

const cronString = "* */1 * * *";
const job = new CronJob(
  cronString,
  getFileFromFTPServer,
  null,
  true,
  "Asia/Dubai"
);
job.start();
