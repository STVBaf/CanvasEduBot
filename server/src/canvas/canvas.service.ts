import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { addSeconds } from 'date-fns';

@Injectable()
export class CanvasService {
	private baseUrl: string;

	constructor(private readonly config: ConfigService, private readonly prisma: PrismaService) {
		this.baseUrl = this.config.get<string>('CANVAS_BASE_URL') ?? '';
	}

	async getUserProfile(accessToken: string) {
		const res = await axios.get(`${this.baseUrl}/api/v1/users/self`, {
			headers: { Authorization: `Bearer ${accessToken}` },
		});
		return res.data as { id?: string; name?: string; primary_email?: string; login_id?: string };
	}

	getAuthorizeUrl(state: string) {
		const clientId = this.config.get<string>('CANVAS_CLIENT_ID');
		const redirectUri = this.config.get<string>('CANVAS_REDIRECT_URI');
		const authorizePath = this.config.get<string>('CANVAS_OAUTH_AUTHORIZE_PATH');

		const url = new URL(authorizePath ?? '/login/oauth2/auth', this.baseUrl);
		url.searchParams.set('response_type', 'code');
		url.searchParams.set('client_id', clientId ?? '');
		url.searchParams.set('redirect_uri', redirectUri ?? '');
		url.searchParams.set('state', state);
		return url.toString();
	}

	async exchangeToken(code: string) {
		const tokenPath = this.config.get<string>('CANVAS_OAUTH_TOKEN_PATH') ?? '/login/oauth2/token';
		const clientId = this.config.get<string>('CANVAS_CLIENT_ID') ?? '';
		const clientSecret = this.config.get<string>('CANVAS_CLIENT_SECRET') ?? '';
		const redirectUri = this.config.get<string>('CANVAS_REDIRECT_URI') ?? '';

		const url = new URL(tokenPath, this.baseUrl).toString();

		const res = await axios.post(
			url,
			new URLSearchParams({
				grant_type: 'authorization_code',
				client_id: clientId,
				client_secret: clientSecret,
				redirect_uri: redirectUri,
				code,
			}),
			{
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			},
		);

		return res.data as {
			access_token: string;
			refresh_token?: string;
			expires_in?: number;
			token_type: string;
			user?: any;
		};
	}

	async refreshToken(refreshToken: string) {
		const tokenPath = this.config.get<string>('CANVAS_OAUTH_TOKEN_PATH') ?? '/login/oauth2/token';
		const clientId = this.config.get<string>('CANVAS_CLIENT_ID') ?? '';
		const clientSecret = this.config.get<string>('CANVAS_CLIENT_SECRET') ?? '';

		const url = new URL(tokenPath, this.baseUrl).toString();
		const res = await axios.post(
			url,
			new URLSearchParams({
				grant_type: 'refresh_token',
				client_id: clientId,
				client_secret: clientSecret,
				refresh_token: refreshToken,
			}),
			{
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			},
		);
		return res.data as {
			access_token: string;
			refresh_token?: string;
			expires_in?: number;
			token_type: string;
			user?: any;
		};
	}

	async getAccessTokenForUser(userId: string) {
		const token = await this.prisma.token.findFirst({
			where: { userId, provider: 'canvas' },
			orderBy: { createdAt: 'desc' },
		});
		if (!token) {
			throw new UnauthorizedException('No Canvas token');
		}
		if (token.expiresAt && token.expiresAt > new Date()) {
			return token.accessToken;
		}
		if (token.refreshToken) {
			try {
				const t = await this.refreshToken(token.refreshToken);
				const newAccess = t.access_token;
				const newRefresh = t.refresh_token ?? token.refreshToken;
				const expiresIn = t.expires_in ?? 3600;
				await this.prisma.token.update({
					where: { id: token.id },
					data: {
						accessToken: newAccess,
						refreshToken: newRefresh ?? undefined,
						expiresAt: addSeconds(new Date(), expiresIn),
					},
				});
				return newAccess;
			} catch (e) {
				throw new UnauthorizedException('Failed to refresh token');
			}
		}
		throw new UnauthorizedException('Canvas token expired and no refresh token available');
	}

	async getCourses(accessToken: string) {
		const res = await axios.get(`${this.baseUrl}/api/v1/courses`, {
			headers: { Authorization: `Bearer ${accessToken}` },
		});
		return res.data;
	}

	async getCourseFiles(accessToken: string, courseId: string) {
		const res = await axios.get(`${this.baseUrl}/api/v1/courses/${courseId}/files`, {
			headers: { Authorization: `Bearer ${accessToken}` },
		});
		return res.data;
	}
}

