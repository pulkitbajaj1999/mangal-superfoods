import prisma from '../../../../lib/prisma.js';

function generateOtp() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { mobile } = body;

    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return new Response(JSON.stringify({ error: 'Invalid mobile number' }), { status: 400 });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    let template = await prisma.otpTemplate.findUnique({ where: { key: 'LOGIN_OTP' } });
    if (!template) {
      template = await prisma.otpTemplate.create({
        data: {
          key: 'LOGIN_OTP',
          body: 'Your OTP for Mangal Superfoods is {{otp}}. It is valid for 5 minutes.',
        },
      });
    }

    const textMessage = template.body.replace('{{otp}}', otp);

    const whapiBase = process.env.WHAPI_BASE_URL
    const whapiToken = process.env.WHAPI_TOKEN;

    if (!whapiToken) {
      return new Response(JSON.stringify({ error: 'SMS provider token not configured' }), { status: 500 });
    }

    const response = await fetch(`${whapiBase}/messages/text`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Bearer ${whapiToken}`,
      },
      body: JSON.stringify({ body: textMessage, to: `91${mobile}` }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('SMS provider error', response.status, errorBody);
      return new Response(JSON.stringify({ error: 'Failed to send OTP via SMS provider' }), { status: 502 });
    }

    await prisma.otpCode.create({
      data: {
        mobile,
        code: otp,
        expiresAt,
      },
    });

    return new Response(JSON.stringify({ success: true, message: 'OTP sent successfully' }), { status: 200 });
  } catch (error) {
    console.error('OTP send error', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
