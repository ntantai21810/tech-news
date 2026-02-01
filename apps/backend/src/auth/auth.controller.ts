import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto, CreateAdminDto, ChangePasswordDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: { user: { id: string } }) {
    return this.authService.getAdminById(req.user.id);
  }

  @Post('setup')
  async createAdmin(@Body() dto: CreateAdminDto) {
    // Only allow if no admins exist
    return this.authService.createAdmin(dto.email, dto.password, dto.name);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Request() req: { user: { id: string } },
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      req.user.id,
      dto.currentPassword,
      dto.newPassword,
    );
  }
}
