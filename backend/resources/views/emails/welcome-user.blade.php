<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Welcome to TaxSathi</title>
</head>
<body style="margin:0;padding:0;background-color:#0f1117;font-family:'Segoe UI',Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f1117;padding:40px 20px;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- HEADER / LOGO -->
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

        <!-- HERO CARD -->
        <tr>
          <td style="background:linear-gradient(145deg,#1e2130,#252a3a);border-radius:24px;border:1px solid #2d3350;overflow:hidden;">

            <!-- Purple gradient banner -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 50%,#9333ea 100%);padding:48px 48px 56px;text-align:center;">
                  <div style="font-size:48px;margin-bottom:16px;">🎉</div>
                  <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;line-height:1.3;">
                    Welcome to TaxSathi!
                  </h1>
                  <p style="margin:12px 0 0;font-size:16px;color:rgba(255,255,255,0.85);line-height:1.6;">
                    Your account has been created successfully.
                  </p>
                </td>
              </tr>
            </table>

            <!-- Body content -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:40px 48px;">

                  <p style="margin:0 0 8px;font-size:15px;color:#9ca3af;">Hi there,</p>
                  <h2 style="margin:0 0 24px;font-size:22px;font-weight:600;color:#f3f4f6;">
                    {{ $user->name }} 👋
                  </h2>

                  <p style="margin:0 0 24px;font-size:15px;color:#9ca3af;line-height:1.7;">
                    We're thrilled to have you on board. Your TaxSathi account is all set up and ready to go.
                    You can now manage your firm's finances, generate invoices, track attendance, and much more.
                  </p>

                  <!-- Account details box -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                    <tr>
                      <td style="background:#1a1f2e;border:1px solid #2d3350;border-radius:12px;padding:20px 24px;">
                        <p style="margin:0 0 12px;font-size:12px;font-weight:600;color:#6366f1;text-transform:uppercase;letter-spacing:1px;">Account Details</p>
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding:6px 0;font-size:13px;color:#6b7280;width:40%;">Name</td>
                            <td style="padding:6px 0;font-size:13px;color:#e5e7eb;font-weight:500;">{{ $user->name }}</td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0;font-size:13px;color:#6b7280;">Email</td>
                            <td style="padding:6px 0;font-size:13px;color:#e5e7eb;font-weight:500;">{{ $user->email }}</td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0;font-size:13px;color:#6b7280;">Role</td>
                            <td style="padding:6px 0;font-size:13px;color:#e5e7eb;font-weight:500;">Admin</td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0;font-size:13px;color:#6b7280;">Joined</td>
                            <td style="padding:6px 0;font-size:13px;color:#e5e7eb;font-weight:500;">{{ $user->created_at->format('d M Y') }}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Feature highlights -->
                  <p style="margin:0 0 16px;font-size:13px;font-weight:600;color:#6366f1;text-transform:uppercase;letter-spacing:1px;">What you can do</p>

                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                    <tr>
                      <td style="padding:8px 0;">
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="width:32px;vertical-align:top;font-size:18px;">📊</td>
                            <td style="padding-left:12px;font-size:14px;color:#d1d5db;line-height:1.5;">
                              <strong style="color:#f3f4f6;">Dashboard &amp; Analytics</strong> — Real-time insights into your firm's performance
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;">
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="width:32px;vertical-align:top;font-size:18px;">🧾</td>
                            <td style="padding-left:12px;font-size:14px;color:#d1d5db;line-height:1.5;">
                              <strong style="color:#f3f4f6;">Invoice Management</strong> — Create and send professional invoices instantly
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;">
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="width:32px;vertical-align:top;font-size:18px;">👥</td>
                            <td style="padding-left:12px;font-size:14px;color:#d1d5db;line-height:1.5;">
                              <strong style="color:#f3f4f6;">Employee & Salary</strong> — Manage your team and payroll with ease
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;">
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="width:32px;vertical-align:top;font-size:18px;">📅</td>
                            <td style="padding-left:12px;font-size:14px;color:#d1d5db;line-height:1.5;">
                              <strong style="color:#f3f4f6;">Attendance Tracking</strong> — Monitor team presence and generate reports
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                    <tr>
                      <td align="center">
                        <a href="{{ config('app.url') }}"
                           style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;padding:16px 48px;border-radius:12px;letter-spacing:0.5px;">
                          Go to Dashboard →
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.7;">
                    If you have any questions, feel free to reach out to us at
                    <a href="mailto:support@axnore.com" style="color:#6366f1;text-decoration:none;">support@axnore.com</a>.
                    We're here to help!
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
              You're receiving this email because you just created an account on
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
