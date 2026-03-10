import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  async create(userData: any) {
    const user = new this.userModel(userData);
    return user.save();
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async findByUsername(username: string) {
    return this.userModel.findOne({ username });
  }

  async updateProfile(userId: string, data: { username?: string; email?: string }) {
    const update: any = {};
    if (data.username) update.username = data.username;
    if (data.email) update.email = data.email;
    const updated = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: update },
      { new: true, select: '-password' },
    );
    return updated;
  }

  async changePassword(userId: string, data: { currentPassword: string; newPassword: string }) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new BadRequestException('User not found');
    const valid = await bcrypt.compare(data.currentPassword, user.password);
    if (!valid) throw new BadRequestException('Current password is incorrect');
    const hashed = await bcrypt.hash(data.newPassword, 10);
    await this.userModel.findByIdAndUpdate(userId, { password: hashed });
    return { message: 'Password changed successfully' };
  }
}
