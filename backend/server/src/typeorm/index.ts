import { User } from "../users/entities/user.entity";
import { Ban } from "src/chat/channels/entities/ban.entity";
import { Mute } from "src/chat/channels/entities/mute.entity";
import { Score } from "../scores/entities/score.entity";
import { Channel } from "src/chat/channels/entities/channel.entity";
import { Game } from "src/game/entities/game.entity";

const entities = [User, Score, Channel, Game, Ban, Mute];

export { User, Score, Channel, Game, Ban, Mute };
export default entities;
