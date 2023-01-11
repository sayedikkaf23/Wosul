module.exports = {
  apps: [
    // {
    //   name: "server",
    //   script: "./server.js",
    //   error_file: "./err.log",
    //   out_log: "./out.log",
    //   log_date_format: "YYYY-MM-DD HH:mm Z",
    //   // instances: 2,
    //   // exec_mode: "cluster",
    // },
    // {
    //   name: "cron_server",
    //   script: "./cron_server.js",
    //   error_file: "./cron_err.log",
    //   out_log: "./cron_out.log",
    //   log_date_format: "YYYY-MM-DD HH:mm Z",
    // },
    {
      name: "uc_cron_server",
      script: "./uc_cron_server.js",
      error_file: "./uc_cron_err.log",
      out_log: "./uc_cron_out.log",
      log_date_format: "YYYY-MM-DD HH:mm Z",
    },
  ],
};
