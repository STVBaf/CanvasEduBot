import { Controller, Get, Query, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly jwt: JwtService,
  ) {}

  @Get('login')
  login(@Res() res: Response) {
    const state = randomBytes(8).toString('hex');
    const url = this.auth.getAuthorizeUrl(state);
    return res.redirect(url);
  }

  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('error') error: string | undefined,
    @Res() res: Response,
  ) {
    if (error) {
      return res.redirect(`/callback?status=error&reason=${encodeURIComponent(error)}`);
    }

    const result = await this.auth.handleCallback(code);
    const redirectUrl = `/callback?status=success&token=${encodeURIComponent(result.jwt)}`;
    return res.redirect(redirectUrl);
  }

  @Get('test-token')
  async testToken(@Query('email') email?: string, @Query('userId') userId?: string) {
    // For development: generate JWT token for existing user
    // Usage: /api/auth/test-token?email=user@example.com
    //    or: /api/auth/test-token?userId=user-id
    // If no params provided, create a default test user
    return this.auth.getTestToken(email, userId);
  }

  @Get('dev/users')
  async devListUsers() {
    // Development only: List all users to find email for testing
    return this.auth.listAllUsers();
  }

  @Get('dev/create-test-user')
  async devCreateTestUser() {
    // Development only: Create a test user for testing
    return this.auth.createTestUser();
  }
}
