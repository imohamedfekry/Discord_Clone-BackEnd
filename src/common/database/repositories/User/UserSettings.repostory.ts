import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";

@Injectable()
export class UserSettingsRepostory {
    constructor(private readonly prisma: PrismaService) { }
}