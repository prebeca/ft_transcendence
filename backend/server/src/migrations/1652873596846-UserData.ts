import { MigrationInterface, QueryRunner } from "typeorm";
import { User } from "../users/entities/user.entity";

export class UserData1652873596846 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const productRepo = queryRunner.connection.getRepository(User);

        await productRepo.insert([
            {
                id: 1,
                login: 'alexandre',
                email: 'alexandre@mail.com',
                username: 'alexandre',
                password: 'abcdefgh'
            },
            {
                id: 2,
                login: 'thomas',
                email: 'thomas@mail.com',
                username: 'thomas',
                password: 'abcdefgh'
            },
            {
                id: 3,
                login: 'amelie',
                email: 'amelie@mail.com',
                username: 'amelie',
                password: 'abcdefgh'
            },
            {
                id: 4,
                login: 'pierre',
                email: 'pierre@mail.com',
                username: '',
                password: 'abcdefgh'
            }
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query('DELETE * FROM user;');
    }

}
