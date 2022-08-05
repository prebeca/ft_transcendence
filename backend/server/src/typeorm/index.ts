import { Ban } from "../chat/channels/entities/ban.entity";
import { Channel } from "../chat/channels/entities/channel.entity";
import { Mute } from "../chat/channels/entities/mute.entity";
import { Game } from "../game/entities/game.entity";
import { User } from "../users/entities/user.entity";

const entities = [User, Channel, Game, Ban, Mute];

export { User, Channel, Game, Ban, Mute };
export default entities;

