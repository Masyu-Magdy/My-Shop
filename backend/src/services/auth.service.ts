import { User, IUser } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { createRawToken, hashToken } from "../utils/tokens";
import { sendEmail, emailTemplates } from "../utils/email";

const EMAIL_VERIFICATION_EXPIRES_MS = 24 * 60 * 60 * 1000; // 24h
const PASSWORD_RESET_EXPIRES_MS = 60 * 60 * 1000; // 1h

export const authService = {
  register: async (data: { name: string; email: string; phone?: string; password: string }) => {
    const existing = await User.findOne({ email: data.email });
    if (existing) {
      throw new ApiError(409, "This email is already in use");
    }

    const rawToken = createRawToken();
    const user = await User.create({
      ...data,
      emailVerificationToken: hashToken(rawToken),
      emailVerificationExpires: new Date(Date.now() + EMAIL_VERIFICATION_EXPIRES_MS),
    });

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${rawToken}`;
    sendEmail({
      to: user.email,
      subject: "Welcome! Please verify your email",
      html: emailTemplates.welcome(user.name) + emailTemplates.verifyEmail(user.name, verifyUrl),
    }).catch((err) => console.error("Failed to send welcome/verification email:", err));

    return user;
  },

  login: async (email: string, password: string): Promise<IUser> => {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }
    if (!user.isActive) {
      throw new ApiError(403, "This account has been suspended, please contact support");
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, "Invalid email or password");
    }
    return user;
  },

  verifyEmail: async (rawToken: string) => {
    const hashed = hashToken(rawToken);
    const user = await User.findOne({
      emailVerificationToken: hashed,
      emailVerificationExpires: { $gt: new Date() },
    }).select("+emailVerificationToken +emailVerificationExpires");

    if (!user) throw new ApiError(400, "This verification link is invalid or has expired");

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    return user;
  },

  resendVerificationEmail: async (userId: string) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");
    if (user.isEmailVerified) throw new ApiError(400, "This email is already verified");

    const rawToken = createRawToken();
    user.emailVerificationToken = hashToken(rawToken);
    user.emailVerificationExpires = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRES_MS);
    await user.save();

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${rawToken}`;
    await sendEmail({
      to: user.email,
      subject: "Please verify your email",
      html: emailTemplates.verifyEmail(user.name, verifyUrl),
    });
  },

  forgotPassword: async (email: string) => {
    const user = await User.findOne({ email });
    if (!user) return;

    const rawToken = createRawToken();
    user.passwordResetToken = hashToken(rawToken);
    user.passwordResetExpires = new Date(Date.now() + PASSWORD_RESET_EXPIRES_MS);
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}`;
    await sendEmail({
      to: user.email,
      subject: "Reset your password",
      html: emailTemplates.resetPassword(user.name, resetUrl),
    });
  },

  resetPassword: async (rawToken: string, newPassword: string) => {
    const hashed = hashToken(rawToken);
    const user = await User.findOne({
      passwordResetToken: hashed,
      passwordResetExpires: { $gt: new Date() },
    }).select("+passwordResetToken +passwordResetExpires");

    if (!user) throw new ApiError(400, "This reset link is invalid or has expired");

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.tokenVersion += 1;
    await user.save();
    return user;
  },

  findOrCreateGoogleUser: async (profile: {
    googleId: string;
    email: string;
    name: string;
    avatar?: string;
  }) => {
    let user = await User.findOne({ email: profile.email });

    if (user) {
      if (!(user as any).googleId) {
        (user as any).googleId = profile.googleId;
        user.isEmailVerified = true;
        await user.save();
      }
      return user;
    }

    user = await User.create({
      name: profile.name,
      email: profile.email,
      googleId: profile.googleId,
      avatar: profile.avatar,
      isEmailVerified: true,
      password: createRawToken(),
    });

    sendEmail({
      to: user.email,
      subject: "Welcome!",
      html: emailTemplates.welcome(user.name),
    }).catch((err) => console.error("Failed to send welcome email:", err));

    return user;
  },
};
