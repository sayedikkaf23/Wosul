exports.order_deliverd_template = function (name, is_schedule, order_id, total, mode, address ){
    return (
        `<!DOCTYPE HTML
        PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
        xmlns:o="urn:schemas-microsoft-com:office:office">
      
      <head>
        <!--[if gte mso 9]>
      <xml>
        <o:OfficeDocumentSettings>
          <o:AllowPNG/>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
      <![endif]-->
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="x-apple-disable-message-reformatting">
        <!--[if !mso]><!-->
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <!--<![endif]-->
        <title></title>
      
        <style type="text/css">
          table,
          td {
            color: #000000;
          }
      
          a {
            color: #22225f;
            text-decoration: none;
          }
      
          @media only screen and (min-width: 620px) {
            .u-row {
              width: 600px !important;
            }
      
            .u-row .u-col {
              vertical-align: top;
            }
      
            .u-row .u-col-100 {
              width: 600px !important;
            }
      
          }
      
          @media (max-width: 620px) {
            .u-row-container {
              max-width: 100% !important;
              padding-left: 0px !important;
              padding-right: 0px !important;
            }
      
            .u-row .u-col {
              min-width: 320px !important;
              max-width: 100% !important;
              display: block !important;
            }
      
            .u-row {
              width: calc(100% - 40px) !important;
            }
      
            .u-col {
              width: 100% !important;
            }
      
            .u-col>div {
              margin: 0 auto;
            }
          }
      
          body {
            margin: 0;
            padding: 0;
          }
      
          table,
          tr,
          td {
            vertical-align: top;
            border-collapse: collapse;
          }
      
          p {
            margin: 0;
          }
      
          .ie-container table,
          .mso-container table {
            table-layout: fixed;
          }
      
          * {
            line-height: inherit;
          }
      
          a[x-apple-data-detectors='true'] {
            color: inherit !important;
            text-decoration: none !important;
          }
        </style>
      
      
      
        <!--[if !mso]><!-->
        <link href="https://fonts.googleapis.com/css?family=Lato:400,700&display=swap" rel="stylesheet" type="text/css">
        <!--<![endif]-->
      
      </head>
      
      <body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;color: #000000">
        <!--[if IE]><div class="ie-container"><![endif]-->
        <!--[if mso]><div class="mso-container"><![endif]-->
        <table
          style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: transparent;width:100%"
          cellpadding="0" cellspacing="0">
          <tbody>
            <tr style="vertical-align: top">
              <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: transparent;"><![endif]-->
      
      
                <div class="u-row-container"
                  style="padding: 0px;background-image: url('https://yeep.s3.me-south-1.amazonaws.com/email_template/order-placed-bg.png');background-repeat: no-repeat;background-position: center top;background-color: transparent; background-size: 100% 100%;">
                  <div class="u-row"
                    style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
                    <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                      <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-image: url('images/image-4.png');background-repeat: no-repeat;background-position: center top;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: transparent;"><![endif]-->
      
                      <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
                      <div class="u-col u-col-100"
                        style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                        <div
                          style="width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                          <!--[if (!mso)&(!IE)]><!-->
                          <div
                            style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                            <!--<![endif]-->
      
                            <table style="font-family:'Lato',sans-serif;" role="presentation" cellpadding="0" cellspacing="0"
                              width="100%" border="0">
                              <tbody>
                                <tr>
                                  <td
                                    style="overflow-wrap:break-word;word-break:break-word;padding:0px 13px 13px;font-family:'Lato',sans-serif;"
                                    align="left">
      
                                    <div
                                      style="color: #1b302b; line-height: 100%; text-align: center; word-wrap: break-word;">
                                      <p style="font-size: 14px; line-height: 100%;"><span
                                          style="font-size: 60px; line-height: 60px;"><span
                                            style="line-height: 60px; font-size: 60px;"><strong><span
                                                style="color: #e32327; line-height: 60px; font-size: 60px;">yeepeey</span></strong></span><span
                                            style="line-height: 60px; color: #2dc26b; font-size: 60px;">.</span></span></p>
                                    </div>
      
                                  </td>
                                </tr>
                              </tbody>
                            </table>
      
                            <table style="font-family:'Lato',sans-serif;" role="presentation" cellpadding="0" cellspacing="0"
                              width="100%" border="0">
                              <tbody>
                                <tr>
                                  <td
                                    style="overflow-wrap:break-word;word-break:break-word;padding:19px 44px 18px;font-family:'Lato',sans-serif;"
                                    align="left">
      
                                    <div
                                      style="color: #1b302b; line-height: 100%; text-align: center; word-wrap: break-word;">
                                      <p style="font-size: 14px; line-height: 100%;"><span
                                          style="color: #e32327; font-size: 14px; line-height: 14px;"><strong><span
                                              style="font-size: 22px; line-height: 22px;">Order Delivered</span></strong></span></p>
      
                                    </div>
      
                                  </td>
                                </tr>
                              </tbody>
                            </table>
      
                            <table style="font-family:'Lato',sans-serif;" role="presentation" cellpadding="0" cellspacing="0"
                              width="100%" border="0">
                              <tbody>
                                <tr>
                                  <td
                                    style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Lato',sans-serif;"
                                    align="left">
      
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                      <tr>
                                        <td style="padding-right: 0px;padding-left: 0px;" align="center">
      
                                          <img align="center" border="0" src="https://yeep.s3.me-south-1.amazonaws.com/email_template/order-placed.gif" alt="" title=""
                                            style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 100%;max-width: 580px;"
                                            width="580" />
      
                                        </td>
                                      </tr>
                                    </table>
      
                                  </td>
                                </tr>
                              </tbody>
                            </table>
      
                            <table style="font-family:'Lato',sans-serif;" role="presentation" cellpadding="0" cellspacing="0"
                              width="100%" border="0">
                              <tbody>
                                <tr>
                                  <td
                                    style="overflow-wrap:break-word;word-break:break-word;padding:19px 44px 18px;font-family:'Lato',sans-serif;"
                                    align="left">
      
                                    <div
                                      style="color: #1b302b;text-align: center; word-wrap: break-word;">
                                      <p style="font-size: 14px;">Dear ${name}</p>
                                      <p style="font-size: 14px; ">
                                        Your Order 
                                        <span ><strong># ${order_id}</strong></span>
                                        has been delivered successfully!</p>
                                    </div>
      
                                  </td>
                                </tr>
                              </tbody>
                            </table>
      
                            <table style="font-family:'Lato',sans-serif;" role="presentation" cellpadding="0" cellspacing="0"
                              width="100%" border="0">
                              <tbody>
                                <tr>
                                  <td
                                    style="overflow-wrap:break-word;word-break:break-word;padding:6px 44px 18px;font-family:'Lato',sans-serif;"
                                    align="left">
      
                                    <div
                                      style="color: #1b302b;  text-align: center; word-wrap: break-word;">
                                      <p style="font-size: 14px; ">As your <strong>Feedback</strong> is important to us,
                                      </p>
                                      <p style="font-size: 14px;">please rate your experiences on <br>the <span style="color: #e32327;"><strong>App/Play Store</strong></span> which will help us
                                      </p>
                                      <p style="font-size: 14px; ">Strive to do better always!</p>
                                    </div>
      
                                  </td>
                                </tr>
                              </tbody>
                            </table>
      
                            <table style="font-family:'Lato',sans-serif;" role="presentation" cellpadding="0" cellspacing="0"
                              width="100%" border="0">
                              <tbody>
                                <tr>
                                  <td
                                    style="overflow-wrap:break-word;word-break:break-word;padding:6px 44px 18px;font-family:'Lato',sans-serif;"
                                    align="left">
      
                                    <div
                                      style="color: #1b302b; line-height: 100%; text-align: center; word-wrap: break-word;">
                                      <p style="font-size: 14px; line-height: 100%;">Feel free to write us on <span style="color: #e32327;"><strong>info@yeepeey.com</strong></span> in case of any feedback or concerns.</p>
                                    </div>
      
                                  </td>
                                </tr>
                              </tbody>
                            </table>
      
                            <table style="font-family:'Lato',sans-serif;" role="presentation" cellpadding="0" cellspacing="0"
                              width="100%" border="0">
                              <tbody>
                                <tr>
                                  <td
                                    style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Lato',sans-serif;"
                                    align="left">
      
                                    <div align="center">
                                      <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-spacing: 0; border-collapse: collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;font-family:'Lato',sans-serif;"><tr><td style="font-family:'Lato',sans-serif;" align="center"><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="#" style="height:29px; v-text-anchor:middle; width:144px;" arcsize="14%" stroke="f" fillcolor="#e32327"><w:anchorlock/><center style="color:#FFFFFF;font-family:'Lato',sans-serif;"><![endif]-->
                                      <a href="#" target="_self"
                                        style="box-sizing: border-box;display: inline-block;font-family:'Lato',sans-serif;text-decoration: none;-webkit-text-size-adjust: none;text-align: center;color: #FFFFFF; background-color: #e32327; border-radius: 4px;-webkit-border-radius: 4px; -moz-border-radius: 4px; width:auto; max-width:100%; overflow-wrap: break-word; word-break: break-word; word-wrap:break-word; mso-border-alt: none;">
                                        <span style="display:block;padding:3px 20px 5px;line-height:120%;"><strong><span
                                              style="font-size: 16px; line-height: 19.2px;">Team
                                              Yeepeey .</span></strong></span>
                                      </a>
                                      <!--[if mso]></center></v:roundrect></td></tr></table><![endif]-->
                                    </div>
      
                                  </td>
                                </tr>
                              </tbody>
                            </table>
      
                            <table style="font-family:'Lato',sans-serif;" role="presentation" cellpadding="0" cellspacing="0"
                              width="100%" border="0">
                              <tbody>
                                <tr>
                                  <td
                                    style="overflow-wrap:break-word;word-break:break-word;;font-family:'Lato',sans-serif;"
                                    align="center">
      
                                    <div
                                      style="color: #1b302b; line-height: 100%; display: flex; justify-content: space-between; word-wrap: break-word; ">
                                  <div style="text-align: left;">
                                    <p style="font-size: 14px; line-height: 100%; padding-bottom: 15px; padding-top: 15px;">
                                      <strong>
                                        <span
                                          style="color: #e32327; font-size: 14px; line-height: 14px; ">Order Summary
                                        </span>
                                      </strong>
                                    </p>
                                    <p style="font-size: 14px; line-height: 100%; padding-bottom: 5px;">
                                      <span
                                      style="color: #1b302b; font-size: 14px; line-height: 14px;">Order No. :
                                    </span>
                                      <strong>
                                        <span
                                          style="color: #1b302b; font-size: 14px; line-height: 14px;"># ${order_id}
                                        </span>
                                      </strong>
                                    </p>
                                    <p style="font-size: 14px; line-height: 100%; padding-bottom: 5px;">
                                      <span
                                      style="color: #1b302b; font-size: 14px; line-height: 14px;">Estimated Total :
                                    </span>
                                      <strong>
                                        <span
                                          style="color: #1b302b; font-size: 14px; line-height: 14px;">AED ${total}
                                        </span>
                                      </strong>
                                    </p>
                                    <p style="font-size: 14px; line-height: 100%;">
                                      <span
                                      style="color: #1b302b; font-size: 14px; line-height: 14px;">Payment Mode :
                                    </span>
                                      <strong>
                                        <span
                                          style="color: #1b302b; font-size: 14px; line-height: 14px;">${mode}
                                        </span>
                                      </strong>
                                    </p>
                                  </div>
                                  <div style="text-align: right;">
                                    <p style="font-size: 14px; line-height: 100%; padding-bottom:15px; padding-top: 15px;"><strong><span
                                      style="color: #e32327; font-size: 14px; line-height: 14px;">Delivery Address
                                    </span></strong>
                                </p>
                                <p style="font-size: 14px; line-height: 100%; padding-bottom: 5px;">
                                  <span
                                  style="color: #1b302b; font-size: 14px; line-height: 14px;">Scheduled Delivery :
                                </span>
                                  <strong>
                                    <span
                                      style="color: #1b302b; font-size: 14px; line-height: 14px;">${is_schedule}
                                    </span>
                                  </strong>
                                </p>
                                <p style="font-size: 14px; line-height: 100%;">
                                  <span
                                  style="color: #1b302b; font-size: 14px; line-height: 14px;">${address}
                                </span>
                                </p>
                                  </div>
                                      <!-- <p style="font-size: 14px; line-height: 100%;">groceries and more! </p> -->
                                    </div>
      
                                  </td>
                                </tr>
                              </tbody>
                            </table>
      
                            <table style="font-family:'Lato',sans-serif;" role="presentation" cellpadding="0" cellspacing="0"
                              width="100%" border="0">
                              <tbody>
                                <tr>
                                  <td
                                    style="overflow-wrap:break-word;word-break:break-word;padding:30px 10px 10px;font-family:'Lato',sans-serif;"
                                    align="left">
      
                                    <div style="color: #444444; line-height: 140%; text-align: left; word-wrap: break-word;">
                                      <p style="line-height: 140%; text-align: center; font-size: 14px;"><span
                                          style="color: #e32327; font-size: 14px; line-height: 19.6px;"><strong><span
                                              style="font-family: Lato, sans-serif; font-size: 14px; line-height: 19.6px;"><span
                                                style="line-height: 19.6px; font-size: 14px;">F O L L O W&nbsp; &nbsp;U
                                                S</span></span></strong></span></p>
                                    </div>
      
                                  </td>
                                </tr>
                              </tbody>
                            </table>
      
                            <table style="font-family:'Lato',sans-serif;" role="presentation" cellpadding="0" cellspacing="0"
                              width="100%" border="0">
                              <tbody>
                                <tr>
                                  <td
                                    style="overflow-wrap:break-word;word-break:break-word;padding:4px;font-family:'Lato',sans-serif;"
                                    align="left">
      
                                    <div align="center">
                                      <div style="display: table; max-width:149px;">
                                        <!--[if (mso)|(IE)]><table width="149" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-collapse:collapse;" align="center"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; mso-table-lspace: 0pt;mso-table-rspace: 0pt; width:149px;"><tr><![endif]-->
      
      
                                        <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 18px;" valign="top"><![endif]-->
                                        <table align="left" border="0" cellspacing="0" cellpadding="0" width="32" height="32"
                                          style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 18px">
                                          <tbody>
                                            <tr style="vertical-align: top">
                                              <td align="left" valign="middle"
                                                style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                                                <a href="https://www.facebook.com/yeepeey/" title="Facebook" target="_blank">
                                                  <img src="https://yeep.s3.me-south-1.amazonaws.com/email_template/image-1.png" alt="Facebook" title="Facebook" width="32"
                                                    style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
                                                </a>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                        <!--[if (mso)|(IE)]></td><![endif]-->
      
                                        <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 18px;" valign="top"><![endif]-->
                                        <table align="left" border="0" cellspacing="0" cellpadding="0" width="32" height="32"
                                          style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 18px">
                                          <tbody>
                                            <tr style="vertical-align: top">
                                              <td align="left" valign="middle"
                                                style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                                                <a href="https://www.linkedin.com/company/yeepeey-online-grocery-shopping-app/" title="LinkedIn" target="_blank">
                                                  <img src="https://yeep.s3.me-south-1.amazonaws.com/email_template/image-3.png" alt="LinkedIn" title="LinkedIn" width="32"
                                                    style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
                                                </a>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                        <!--[if (mso)|(IE)]></td><![endif]-->
      
                                        <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 0px;" valign="top"><![endif]-->
                                        <table align="left" border="0" cellspacing="0" cellpadding="0" width="32" height="32"
                                          style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 0px">
                                          <tbody>
                                            <tr style="vertical-align: top">
                                              <td align="left" valign="middle"
                                                style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                                                <a href="https://www.instagram.com/yeepeey_uae/" title="Instagram" target="_blank">
                                                  <img src="https://yeep.s3.me-south-1.amazonaws.com/email_template/image-2.png" alt="Instagram" title="Instagram" width="32"
                                                    style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
                                                </a>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                        <!--[if (mso)|(IE)]></td><![endif]-->
      
      
                                        <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                                      </div>
                                    </div>
      
                                  </td>
                                </tr>
                              </tbody>
                            </table>
      
                            <table style="font-family:'Lato',sans-serif;" role="presentation" cellpadding="0" cellspacing="0"
                              width="100%" border="0">
                              <tbody>
                                <tr>
                                  <td
                                    style="overflow-wrap:break-word;word-break:break-word;padding:0px 40px 10px;font-family:'Lato',sans-serif;"
                                    align="left">
      
                                    <div
                                      style="color: #414b41; line-height: 140%; text-align: center; word-wrap: break-word;">
                                      <p style="line-height: 140%; font-size: 14px;"><span
                                          style="font-size: 12px; line-height: 16.8px;"><strong>&nbsp;</strong></span></p>
                                    </div>
      
                                  </td>
                                </tr>
                              </tbody>
                            </table>
      
                            <table style="font-family:'Lato',sans-serif;" role="presentation" cellpadding="0" cellspacing="0"
                              width="100%" border="0">
                              <tbody>
                                <tr>
                                  <td
                                    style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Lato',sans-serif;"
                                    align="left">
      
                                    <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="84%"
                                      style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #BBBBBB;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                      <tbody>
                                        <tr style="vertical-align: top">
                                          <td
                                            style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                            <span>&#160;</span>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
      
                                  </td>
                                </tr>
                              </tbody>
                            </table>
      
                            <!--[if (!mso)&(!IE)]><!-->
                          </div>
                          <!--<![endif]-->
                        </div>
                      </div>
                      <!--[if (mso)|(IE)]></td><![endif]-->
                      <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                    </div>
                  </div>
                </div>
      
      
                <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
        <!--[if mso]></div><![endif]-->
        <!--[if IE]></div><![endif]-->
      </body>
      
      </html>`
    )
  
}