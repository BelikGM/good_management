import { Repository, DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Account } from 'src/domains/account.entity';

@Injectable()
export class AccountRepository extends Repository<Account> {
  constructor(private dataSource: DataSource) {
    super(Account, dataSource.createEntityManager());
  }

}
