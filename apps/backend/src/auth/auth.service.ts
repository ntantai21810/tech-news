import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/common/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

export interface JwtPayload {
  sub: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  admin: {
    id: string;
    email: string;
    name: string | null;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validate admin credentials
   */
  async validateAdmin(email: string, password: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!admin || !admin.isActive) {
      return null;
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
      return null;
    }

    return admin;
  }

  /**
   * Login and generate JWT
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const admin = await this.validateAdmin(email, password);

    if (!admin) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last login
    await this.prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    const payload: JwtPayload = { sub: admin.id, email: admin.email };
    const accessToken = this.jwtService.sign(payload);

    this.logger.log(`Admin logged in: ${admin.email}`);

    return {
      accessToken,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    };
  }

  /**
   * Get admin by ID
   */
  async getAdminById(id: string) {
    return this.prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });
  }

  /**
   * Create initial admin user (for setup)
   */
  async createAdmin(email: string, password: string, name?: string) {
    const existing = await this.prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      throw new Error('Admin with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await this.prisma.admin.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
      },
    });

    this.logger.log(`Admin created: ${admin.email}`);

    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
    };
  }

  /**
   * Change password
   */
  async changePassword(adminId: string, currentPassword: string, newPassword: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    const isValid = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await this.prisma.admin.update({
      where: { id: adminId },
      data: { passwordHash },
    });

    this.logger.log(`Password changed for: ${admin.email}`);

    return { success: true };
  }
}
