import { registerAs } from "@nestjs/config";

export default registerAs('security', () => ({
    pepper: process.env.PEPPER,
    EncryptionKey: process.env.ENCRYPTION_KEY,
}));