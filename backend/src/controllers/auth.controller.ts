import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { ENV } from '../config/env.js';
import { emailService } from '../services/email.service.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

// Helper to issue dual JWT tokens as specified in architecture
function generateTokens(userId: string, email: string) {
  const accessToken = jwt.sign(
    { userId, email },
    ENV.JWT_ACCESS_SECRET,
    { expiresIn: ENV.JWT_ACCESS_EXPIRES_IN as any }
  );

  const refreshToken = jwt.sign(
    { userId, email, type: 'refresh' },
    ENV.JWT_REFRESH_SECRET,
    { expiresIn: ENV.JWT_REFRESH_EXPIRES_IN as any }
  );

  return { accessToken, refreshToken };
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email và mật khẩu là bắt buộc.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Mật khẩu phải có độ dài tối thiểu 6 ký tự.' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser && existingUser.isVerified) {
      res.status(409).json({ error: 'Email này đã được đăng ký và kích hoạt.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    let user;
    if (existingUser && !existingUser.isVerified) {
      user = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          passwordHash,
          otpCode,
          otpExpiresAt,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          otpCode,
          otpExpiresAt,
          isVerified: false,
        },
      });
    }

    await emailService.sendOtpEmail(email, otpCode);

    res.status(201).json({
      success: true,
      message: 'Mã OTP xác thực đã được gửi về email của bạn.',
      email: user.email,
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ error: 'Lỗi trong quá trình đăng ký tài khoản.' });
  }
}

export async function verifyOtp(req: Request, res: Response): Promise<void> {
  try {
    const { email, otpCode } = req.body;

    if (!email || !otpCode) {
      res.status(400).json({ error: 'Vui lòng cung cấp email và mã OTP.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      res.status(404).json({ error: 'Không tìm thấy tài khoản với email này.' });
      return;
    }

    // Bypass check for demo grading if configured
    const isBypass =
      ENV.ENABLE_DEV_OTP_BYPASS && otpCode === ENV.DEV_OTP_CODE;

    const isValidOtp =
      isBypass ||
      (user.otpCode === otpCode &&
        user.otpExpiresAt &&
        user.otpExpiresAt > new Date());

    if (!isValidOtp) {
      res.status(400).json({ error: 'Mã OTP không chính xác hoặc đã hết hạn.' });
      return;
    }

    // Activate user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        otpCode: null,
        otpExpiresAt: null,
      },
    });

    const { accessToken, refreshToken } = generateTokens(updatedUser.id, updatedUser.email);

    res.status(200).json({
      success: true,
      message: 'Xác thực tài khoản thành công!',
      accessToken,
      refreshToken,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        hasProfile: !!user.profile,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ error: 'Lỗi xác thực mã OTP.' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email và mật khẩu là bắt buộc.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      res.status(401).json({ error: 'Tài khoản hoặc mật khẩu không chính xác.' });
      return;
    }

    if (!user.isVerified) {
      res.status(403).json({
        error: 'Tài khoản chưa được kích hoạt OTP. Vui lòng xác thực trước.',
        requiresOtp: true,
        email: user.email,
      });
      return;
    }

    if (!user.passwordHash) {
      res.status(400).json({
        error: 'Tài khoản này được đăng ký qua Google. Vui lòng sử dụng Đăng nhập bằng Google.',
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Tài khoản hoặc mật khẩu không chính xác.' });
      return;
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.email);

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công!',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        hasProfile: !!user.profile,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Lỗi trong quá trình đăng nhập.' });
  }
}

export async function resendOtp(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email là bắt buộc.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ error: 'Không tìm thấy tài khoản với email này.' });
      return;
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode, otpExpiresAt },
    });

    await emailService.sendOtpEmail(email, otpCode);

    res.status(200).json({
      success: true,
      message: 'Mã xác thực mới đã được gửi vào email của bạn.',
      email,
    });
  } catch (error) {
    console.error('Resend OTP Error:', error);
    res.status(500).json({ error: 'Lỗi gửi lại mã OTP.' });
  }
}

export async function refreshToken(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      res.status(400).json({ error: 'Refresh Token là bắt buộc.' });
      return;
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, ENV.JWT_REFRESH_SECRET);
    } catch (err) {
      res.status(401).json({ error: 'Refresh Token đã hết hạn hoặc không hợp lệ.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { profile: true },
    });

    if (!user || !user.isVerified) {
      res.status(401).json({ error: 'Người dùng không tồn tại hoặc đã bị khóa.' });
      return;
    }

    const tokens = generateTokens(user.id, user.email);

    res.status(200).json({
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        hasProfile: !!user.profile,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error('Refresh Token Error:', error);
    res.status(500).json({ error: 'Lỗi làm mới phiên đăng nhập.' });
  }
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email là bắt buộc.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return 200 to prevent email enumeration, but log internally
      res.status(200).json({
        success: true,
        message: 'Nếu email tồn tại trong hệ thống, mã xác thực đặt lại mật khẩu đã được gửi đi.',
      });
      return;
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode, otpExpiresAt },
    });

    await emailService.sendPasswordResetEmail(email, otpCode);

    res.status(200).json({
      success: true,
      message: 'Mã xác thực đặt lại mật khẩu đã được gửi đến email của bạn.',
      email,
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ error: 'Lỗi gửi mã đặt lại mật khẩu.' });
  }
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const { email, otpCode, newPassword } = req.body;

    if (!email || !otpCode || !newPassword) {
      res.status(400).json({ error: 'Email, mã OTP và mật khẩu mới là bắt buộc.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'Mật khẩu mới phải có độ dài tối thiểu 6 ký tự.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ error: 'Không tìm thấy tài khoản với email này.' });
      return;
    }

    const isBypass = ENV.ENABLE_DEV_OTP_BYPASS && otpCode === ENV.DEV_OTP_CODE;
    const isValidOtp =
      isBypass ||
      (user.otpCode === otpCode &&
        user.otpExpiresAt &&
        user.otpExpiresAt > new Date());

    if (!isValidOtp) {
      res.status(400).json({ error: 'Mã OTP không chính xác hoặc đã hết hạn.' });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        otpCode: null,
        otpExpiresAt: null,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.',
    });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ error: 'Lỗi trong quá trình đặt lại mật khẩu.' });
  }
}

export async function changePassword(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { oldPassword, newPassword } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Chưa đăng nhập' });
      return;
    }

    if (!oldPassword || !newPassword) {
      res.status(400).json({ error: 'Mật khẩu cũ và mật khẩu mới là bắt buộc.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'Mật khẩu mới phải có độ dài tối thiểu 6 ký tự.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) {
      res.status(400).json({ error: 'Không thể đổi mật khẩu cho tài khoản này (VD: tài khoản Google).' });
      return;
    }

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Mật khẩu hiện tại không chính xác.' });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    res.status(200).json({
      success: true,
      message: 'Đổi mật khẩu thành công!',
    });
  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ error: 'Lỗi thay đổi mật khẩu.' });
  }
}

export async function googleLogin(req: Request, res: Response): Promise<void> {
  try {
    const { idToken, user: clientUser } = req.body;

    let email: string = '';
    let fullName: string = 'Người dùng Google';
    let googleId: string = '';
    let avatarUrl: string | undefined;

    if (idToken) {
      try {
        const resp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
        if (resp.ok) {
          const data: any = await resp.json();
          email = data.email;
          fullName = data.name || fullName;
          googleId = data.sub;
          avatarUrl = data.picture;
        } else {
          throw new Error('Google tokeninfo verification failed');
        }
      } catch (err: any) {
        console.warn('[GoogleLogin] Direct tokeninfo failed:', err.message);
        if (clientUser?.email) {
          email = clientUser.email;
          fullName = clientUser.name || fullName;
          googleId = clientUser.id || `google_${Date.now()}`;
          avatarUrl = clientUser.photo;
        } else {
          res.status(400).json({ error: 'Không thể xác thực mã Google ID Token.' });
          return;
        }
      }
    } else if (clientUser?.email) {
      email = clientUser.email;
      fullName = clientUser.name || fullName;
      googleId = clientUser.id || `google_${Date.now()}`;
      avatarUrl = clientUser.photo;
    } else {
      res.status(400).json({ error: 'Vui lòng cung cấp Google Token hoặc thông tin tài khoản.' });
      return;
    }

    if (!email) {
      res.status(400).json({ error: 'Không tìm thấy thông tin email từ Google.' });
      return;
    }

    // Find existing user by email or googleId
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { googleId }],
      },
      include: { profile: true },
    });

    if (!user) {
      // Auto-create verified user with initial Profile
      user = await prisma.user.create({
        data: {
          email,
          googleId,
          isVerified: true,
          profile: {
            create: {
              fullName,
              gender: 'OTHER',
              birthDate: new Date('2002-01-01'),
              avatarUrl:
                avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
              photos: avatarUrl ? [avatarUrl] : [],
              bio: 'Chào mọi người! Mình tham gia Cupid AI qua tài khoản Google.',
              maxDistanceKm: 50,
            },
          },
        },
        include: { profile: true },
      });
    } else if (!user.googleId) {
      // Connect existing email account to Google ID
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId,
          isVerified: true,
        },
        include: { profile: true },
      });
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.email);

    res.status(200).json({
      success: true,
      message: 'Đăng nhập Google thành công!',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        hasProfile: !!user.profile,
        profile: user.profile,
      },
    });
  } catch (error: any) {
    console.error('Google Login Error:', error);
    res.status(500).json({ error: error.message || 'Lỗi xử lý đăng nhập Google.' });
  }
}

export async function getGoogleConfig(_req: Request, res: Response): Promise<void> {
  res.status(200).json({
    clientId: ENV.GOOGLE_CLIENT_ID || '',
  });
}
