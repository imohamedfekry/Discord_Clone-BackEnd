import { Injectable, Logger } from "@nestjs/common";
import { User } from "@prisma/client";
import { ReadyPayload } from "./ready.types";
import { ReadyLoader } from "./loaders/loader.service";

@Injectable()
export class ReadyService {
  private readonly logger = new Logger(ReadyService.name);

  constructor(
    private readonly ReadyLoader: ReadyLoader,
    // Inject other loaders here...
  ) { }

  async prepareUserData(user: User): Promise<ReadyPayload> {
    this.logger.log(`Preparing ready data for user ${user.id}`);

    const [currentUser, friendRequests, userRelations] = await Promise.all([
      this.ReadyLoader.getCurrentUser(user),
      this.ReadyLoader.FriendRequestLoader(user),
      this.ReadyLoader.getUserRelations(user),
      // Add other loader calls here...
    ]);

    return {
      friendRequests,
      userRelations,
      currentUser,
    };
  }
}
