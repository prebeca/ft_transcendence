import { Ban } from "src/chat/channels/entities/ban.entity";
import { Channel } from "src/chat/channels/entities/channel.entity";
import { Mute } from "src/chat/channels/entities/mute.entity";
import { Game } from "src/game/entities/game.entity";
import { User } from "../users/entities/user.entity";

const entities = [User, Channel, Game, Ban, Mute];

export { User, Channel, Game, Ban, Mute };
export default entities;
/* Why are more than one table missing here ? Is it to override pre-existing entities from typeorm ?*/
