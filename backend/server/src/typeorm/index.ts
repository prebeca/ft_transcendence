import { User } from "../users/entities/user.entity";
import { Score } from "../scores/entities/score.entity";
import { Channel } from "src/chat/channels/entities/channel.entity";
import { Game } from "src/game/entities/game.entity";

const entities = [User, Score, Channel, Game];

export {User, Score, Channel, Game};
export default entities;
