import { MigrationInterface, QueryRunner } from "typeorm";
import { User } from "../users/entities/user.entity";
import * as bcrypt from 'bcrypt'

export class UserData1652873596846 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const productRepo = queryRunner.connection.getRepository(User);

        const salt_pass = await bcrypt.genSalt();
        const hash_pass = await bcrypt.hash('abcdefgh', salt_pass);
        await productRepo.insert([
            {
                id: 1,
                login: 'alexandre',
                email: 'alexandre@mail.com',
                username: 'alexandre',
                password: hash_pass,
                salt: salt_pass
            },
            {
                id: 2,
                login: 'thomas',
                email: 'thomas@mail.com',
                username: 'thomas',
                password: hash_pass,
                salt: salt_pass
            },
            {
                id: 3,
                login: 'amelie',
                email: 'amelie@mail.com',
                username: 'amelie',
                password: hash_pass,
                salt: salt_pass
            },
            {
                id: 4,
                login: 'pierre',
                email: 'pierre@mail.com',
                username: '',
                password: hash_pass,
                salt: salt_pass
            }
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const productRepo = queryRunner.connection.getRepository(User);
        productRepo.clear();
    }

}
