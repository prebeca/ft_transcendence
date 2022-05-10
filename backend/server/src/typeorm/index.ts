import { User } from "../users/entities/user.entity";
import { Score } from "../scores/entities/score.entity";
import { Channel } from "src/channels/entities/channel.entity";

const entities = [User, Score, Channel];

export {User, Score, Channel};
export default entities;