import * as bcrypt from 'bcrypt';
import { Player } from "src/game/entities/player.entity";
import { MigrationInterface, QueryRunner } from "typeorm";
import { User } from "../users/entities/user.entity";

export class UserData1652873596846 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const playerRepo = queryRunner.connection.getRepository(Player);
        await playerRepo.insert([
            {
                level: 2,
                winnings: 5,
                losses: 3,
            },
            {
                level: 3,
                winnings: 8,
                losses: 3,
            }, {
                level: 3,
                winnings: 9,
                losses: 5,
            }, {
                level: 1,
                winnings: 0,
                losses: 50,
            },
        ]);

        const userRepo = queryRunner.connection.getRepository(User);
        const salt_pass = await bcrypt.genSalt();
        const hash_pass = await bcrypt.hash('abcdefgh', salt_pass);
        const players: Player[] = await queryRunner.connection.getRepository(Player).find();
        await userRepo.insert([
            {
                login: 'alexandre',
                email: 'alexandre@mail.com',
                username: 'alexandre',
                password: hash_pass,
                salt: salt_pass,
                player: players[0],
            },
            {
                login: 'thomas',
                email: 'thomas@mail.com',
                username: 'thomas',
                password: hash_pass,
                salt: salt_pass,
                player: players[1]
            },
            {
                login: 'amelie',
                email: 'amelie@mail.com',
                username: 'amelie',
                password: hash_pass,
                salt: salt_pass,
                player: players[2]
            },
            {
                login: 'pierre',
                email: 'pierre@mail.com',
                username: 'pierre',
                password: hash_pass,
                salt: salt_pass,
                player: players[3]
            }
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const userRepo = queryRunner.connection.getRepository(User);
        userRepo.clear();
        const playerRepo = queryRunner.connection.getRepository(Player);
        playerRepo.clear();
    }

}
