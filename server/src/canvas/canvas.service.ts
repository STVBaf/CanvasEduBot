import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { addSeconds } from 'date-fns';

@Injectable()
export class CanvasService {
	private baseUrl: string;
	private readonly logger = new Logger(CanvasService.name);

	constructor(private readonly config: ConfigService, private readonly prisma: PrismaService) {
		const url = this.config.get<string>('CANVAS_BASE_URL') ?? '';
		this.baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
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
		// 手动生成的 token 是长期有效的，直接返回
		// 如果 expiresAt 为 null，表示是手动 token
		if (!token.expiresAt || token.expiresAt > new Date()) {
			return token.accessToken;
		}
		// 如果 token 已过期且没有 refresh token，抛出异常
		// 注意：手动 token 通常不会过期，这里主要是为了兼容未来可能的 OAuth2
		throw new UnauthorizedException('Canvas token expired. Please login again with a valid access token.');
	}

	async getCourses(accessToken: string) {
		const url = `${this.baseUrl}/api/v1/courses`;
		const cleanToken = accessToken.trim();

		try {
			const res = await axios.get(url, {
				headers: { Authorization: `Bearer ${cleanToken}` },
				params: {
					enrollment_state: 'active',  // 只获取激活的课程
					per_page: 100,                // 每页100条（Canvas最大值）
					include: ['term']             // 包含学期信息
				}
			});
			this.logger.log(`Successfully fetched ${res.data.length} courses`);
			return res.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				this.logger.error(`Failed to fetch courses: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
			}
			throw error;
		}
	}

	async getCourseFiles(accessToken: string, courseId: string) {
		const res = await axios.get(`${this.baseUrl}/api/v1/courses/${courseId}/files`, {
			headers: { Authorization: `Bearer ${accessToken}` },
		});
		return res.data;
	}
}

