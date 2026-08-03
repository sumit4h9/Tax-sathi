<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>New Login – TaxSathi</title>
</head>
<body style="margin:0;padding:0;background-color:#0f1117;font-family:'Segoe UI',Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f1117;padding:40px 20px;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- LOGO -->
        <tr>
          <td align="center" style="padding-bottom:32px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:16px;padding:14px 28px;">
                  <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:1px;">TaxSathi</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- MAIN CARD -->
        <tr>
          <td style="background:linear-gradient(145deg,#1e2130,#252a3a);border-radius:24px;border:1px solid #2d3350;overflow:hidden;">

            <!-- Amber/orange security banner -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:linear-gradient(135deg,#1e40af 0%,#1d4ed8 50%,#2563eb 100%);padding:40px 48px;text-align:center;">
                  <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:50%;width:64px;height:64px;line-height:64px;font-size:32px;margin-bottom:16px;">🔐</div>
                  <h1 style="margin:0;font-size:26px;font-weight:700;color:#ffffff;line-height:1.3;">
                    New Login Detected
                  </h1>
                  <p style="margin:12px 0 0;font-size:15px;color:rgba(255,255,255,0.85);line-height:1.6;">
                    Someone just signed in to your TaxSathi account
                  </p>
                </td>
              </tr>
            </table>

            <!-- Body -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:40px 48px;">

                  <p style="margin:0 0 6px;font-size:15px;color:#9ca3af;">Hi,</p>
                  <h2 style="margin:0 0 20px;font-size:20px;font-weight:600;color:#f3f4f6;">{{ $user->name }}</h2>

                  <p style="margin:0 0 28px;font-size:15px;color:#9ca3af;line-height:1.7;">
                    We noticed a new login to your TaxSathi account. Here are the details:
                  </p>

                  <!-- Login Details Box -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                    <tr>
                      <td style="background:#1a1f2e;border:1px solid #2d3350;border-radius:12px;padding:24px;">
                        <p style="margin:0 0 16px;font-size:12px;font-weight:600;color:#3b82f6;text-transform:uppercase;letter-spacing:1px;">Login Activity</p>

                        <!-- Time row -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
                          <tr>
                            <td style="width:36px;font-size:20px;vertical-align:middle;">🕐</td>
                            <td style="vertical-align:middle;padding-left:12px;">
                              <p style="margin:0;font-size:12px;color:#6b7280;">Time</p>
                              <p style="margin:2px 0 0;font-size:14px;color:#e5e7eb;font-weight:500;">{{ $loginTime }}</p>
                            </td>
                          </tr>
                        </table>

                        <div style="border-top:1px solid #2d3350;margin:12px 0;"></div>

                        <!-- IP row -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
                          <tr>
                            <td style="width:36px;font-size:20px;vertical-align:middle;">🌐</td>
                            <td style="vertical-align:middle;padding-left:12px;">
                              <p style="margin:0;font-size:12px;color:#6b7280;">IP Address</p>
                              <p style="margin:2px 0 0;font-size:14px;color:#e5e7eb;font-weight:500;">{{ $ipAddress }}</p>
                            </td>
                          </tr>
                        </table>

                        <div style="border-top:1px solid #2d3350;margin:12px 0;"></div>

                        <!-- Account row -->
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="width:36px;font-size:20px;vertical-align:middle;">👤</td>
                            <td style="vertical-align:middle;padding-left:12px;">
                              <p style="margin:0;font-size:12px;color:#6b7280;">Account</p>
                              <p style="margin:2px 0 0;font-size:14px;color:#e5e7eb;font-weight:500;">{{ $user->email }}</p>
                            </td>
                          </tr>
                        </table>

                      </td>
                    </tr>
                  </table>

                  <!-- Was this you? -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                    <tr>
                      <td style="background:#0f1117;border:1px solid #374151;border-left:4px solid #f59e0b;border-radius:8px;padding:16px 20px;">
                        <p style="margin:0;font-size:14px;color:#fbbf24;font-weight:600;margin-bottom:6px;">⚠️ Wasn't you?</p>
                        <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
                          If you did not log in, your account may be compromised. Please change your password immediately and contact support.
                        </p>
                      </td>
                    </tr>
                  </table>

                  <!-- CTA Buttons -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                    <tr>
                      <td align="center" style="padding-bottom:12px;">
                        <a href="{{ config('app.url') }}"
                           style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 40px;border-radius:10px;">
                          Go to Dashboard →
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td align="center">
                        <a href="mailto:support@axnore.com"
                           style="display:inline-block;background:transparent;color:#6b7280;font-size:13px;font-weight:500;text-decoration:none;padding:10px 32px;border-radius:10px;border:1px solid #374151;">
                          Contact Support
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:0;font-size:13px;color:#4b5563;line-height:1.7;">
                    If this was you, no action is required. This email is sent automatically for your security.
                  </p>

                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:32px 0 16px;text-align:center;">
            <p style="margin:0 0 8px;font-size:12px;color:#4b5563;">
              © {{ date('Y') }} TaxSathi. All rights reserved.
            </p>
            <p style="margin:0;font-size:11px;color:#374151;">
              This is an automated security notification from
              <a href="{{ config('app.url') }}" style="color:#6366f1;text-decoration:none;">axnore.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>
