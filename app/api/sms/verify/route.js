import prisma from '../../../../lib/prisma.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { mobile, otp } = body;

    if (!mobile || !/^\d{10}$/.test(mobile) || !otp || !/^\d{4}$/.test(otp)) {
      return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400 });
    }

    const existingOtp = await prisma.otpCode.findFirst({
      where: {
        mobile,
        code: otp,
        used: false,
        expiresAt: {
          gte: new Date(),
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!existingOtp) {
      return new Response(JSON.stringify({ success: false, error: 'OTP invalid or expired' }), { status: 400 });
    }

    await prisma.otpCode.update({
      where: { id: existingOtp.id },
      data: { used: true },
    });

    return new Response(JSON.stringify({ success: true, message: 'OTP verified' }), { status: 200 });
  } catch (error) {
    console.error('OTP verify error', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
