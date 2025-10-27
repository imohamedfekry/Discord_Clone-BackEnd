import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id: BigInt(id) } });
    return user ? { ...user, id: user.id.toString() } : null;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? { ...user, id: user.id.toString() } : null;
  }

  async findByUsername(username: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    return user ? { ...user, id: user.id.toString() } : null;
  }

  async create(data: Prisma.UserCreateInput) {
    const user = await this.prisma.user.create({ data });
    return { ...user, id: user.id.toString() };
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    const user = await this.prisma.user.update({ 
      where: { id: BigInt(id) }, 
      data 
    });
    return { ...user, id: user.id.toString() };
  }

  async delete(id: string) {
    const user = await this.prisma.user.delete({ where: { id: BigInt(id) } });
    return { ...user, id: user.id.toString() };
  }

  async updateStatus(id: string, status: 'ONLINE' | 'OFFLINE' | 'IDLE' | 'DND') {
    const user = await this.prisma.user.update({ 
      where: { id: BigInt(id) }, 
      data: { status } 
    });
    return { ...user, id: user.id.toString() };
  }

}
