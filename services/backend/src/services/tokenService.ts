import RefreshToken from "../models/RefreshToken";

export const storeRefreshToken = async ({
  userId,
  token,
  expiresAt,
  deviceInfo,
  ipAddress,
}: {
  userId: string;
  token: string;
  expiresAt: Date;
  deviceInfo?: string;
  ipAddress?: string;
}) => {
  await RefreshToken.create({
    userId,
    token,
    expiresAt,
    deviceInfo,
    ipAddress,
    createdAt: new Date(),
    lastUsedAt: new Date(),
  });
};

export const getRefreshToken = async (token: string) => {
  return await RefreshToken.findOne({ token });
};

export const deleteRefreshToken = async (token: string) => {
  return await RefreshToken.deleteOne({ token });
};

export const deleteAllUserTokens = async (userId: string) => {
  return await RefreshToken.deleteMany({ userId });
};

export const getUserActiveSessions = async (userId: string) => {
  return await RefreshToken.find({
    userId,
    expiresAt: { $gt: new Date() },
  }).select("deviceInfo ipAddress createdAt lastUsedAt");
};

export const updateTokenLastUsed = async (token: string) => {
  return await RefreshToken.updateOne({ token }, { lastUsedAt: new Date() });
};
