import { Injectable } from '@nestjs/common';
import { CanvasService } from '../canvas/canvas.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { addSeconds } from 'date-fns';

@Injectable()
export class AuthService {
  constructor(
    private readonly canvas: CanvasService,
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  getAuthorizeUrl(state: string) {
    return this.canvas.getAuthorizeUrl(state);
  }

  async handleCallback(code: string) {
    const tokenRes = await this.canvas.exchangeToken(code);
    const accessToken = tokenRes.access_token;
    const refreshToken = tokenRes.refresh_token ?? null;
    const expiresIn = tokenRes.expires_in ?? 3600;

    // Get the user's profile from Canvas so we can tie the token to a real Canvas user
    const profile = await this.canvas.getUserProfile(accessToken);
    const providerUserId = profile?.id ? String(profile.id) : undefined;
    const email = profile?.primary_email ?? profile?.login_id ?? undefined;

    const meRes = await this.prisma.$transaction(async () => {
      // If we already have a token for this provider user id, use that user
      if (providerUserId) {
        const existing = await this.prisma.token.findFirst({
          where: { provider: 'canvas', providerUserId },
          include: { user: true },
        });
        if (existing) return existing.user;
      }
      let user;
      if (email) {
        user = await this.prisma.user.upsert({
          where: { email },
          update: { name: profile?.name ?? undefined },
          create: { email, name: profile?.name ?? undefined },
        });
      } else {
        // fallback create user with a synthetic email if none present
        user = await this.prisma.user.create({
          data: { email: `canvas_user_${Date.now()}@example.com`, name: profile?.name ?? undefined },
        });
      }

      await this.prisma.token.create({
        data: {
          userId: user.id,
          provider: 'canvas',
          providerUserId: providerUserId ?? undefined,
          accessToken,
          refreshToken: refreshToken ?? undefined,
          expiresAt: addSeconds(new Date(), expiresIn),
        },
      });

      return user;
    });

    const jwtToken = this.jwt.sign({ sub: meRes.id });
    return { userId: meRes.id, jwt: jwtToken };
  }

  async createTestUser() {
    // Create or get test user
    const user = await this.prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        name: 'Test User',
      },
    });

    // Create a mock Canvas token for testing
    const mockAccessToken = 'mock_canvas_token_' + Date.now();
    const existingToken = await this.prisma.token.findFirst({
      where: { userId: user.id, provider: 'canvas' },
    });
    if (existingToken) {
      await this.prisma.token.update({
        where: { id: existingToken.id },
        data: {
          accessToken: mockAccessToken,
          expiresAt: addSeconds(new Date(), 3600),
        },
      });
    } else {
      await this.prisma.token.create({
        data: {
          userId: user.id,
          provider: 'canvas',
          accessToken: mockAccessToken,
          expiresAt: addSeconds(new Date(), 3600),
        },
      });
    }

    const jwtToken = this.jwt.sign({ sub: user.id });
    return { userId: user.id, jwt: jwtToken };
  }

  async getTestToken(email?: string, userId?: string) {
    let user;

    if (userId) {
      // Lookup by user ID
      user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }
    } else if (email) {
      // Lookup by email
      user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new Error(`User with email ${email} not found`);
      }
    } else {
      // Create or get default test user
      return this.createTestUser();
    }

    // Ensure user has a Canvas token for testing
    const existingToken = await this.prisma.token.findFirst({
      where: { userId: user.id, provider: 'canvas' },
    });

    if (!existingToken) {
      // Create a mock Canvas token for testing
      const mockAccessToken = 'mock_canvas_token_' + Date.now();
      await this.prisma.token.create({
        data: {
          userId: user.id,
          provider: 'canvas',
          accessToken: mockAccessToken,
          expiresAt: addSeconds(new Date(), 3600),
        },
      });
    }

    const jwtToken = this.jwt.sign({ sub: user.id });
    return { userId: user.id, email: user.email, jwt: jwtToken };
  }

  async listAllUsers() {
    // Development only: List all users for testing
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        tokens: {
          where: { provider: 'canvas' },
          select: { id: true, expiresAt: true },
        },
      },
    });
    return users;
  }
}
