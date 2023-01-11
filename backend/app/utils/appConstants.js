module.exports = {
  IOS: {
    USER_CERT_FILE_NAME:
      process.env.NODE_ENV === "dev" ? "dev_certificate.pem" : "user_cert.pem",
    CERT_FILE_NAME:
      process.env.NODE_ENV === "dev" ? "dev_push_file.p8" : "push_file.p8",
  },
};
