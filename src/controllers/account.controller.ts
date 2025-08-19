import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { AccountService } from 'src/application/services/account/account.service';
import { AccountCreateDto } from 'src/contracts/account/create-account.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProducerService } from 'src/application/services/producer/producer.service';
import { RoleSettingService } from 'src/application/services/roleSetting/roleSetting.service';
import { RoleService } from 'src/application/services/role/role.service';

@ApiTags('Account')
@Controller('accounts')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly producerService: ProducerService,
    private readonly roleSettingService: RoleSettingService,
    private readonly roleService: RoleService,
  ) {}

  @Post('new')
  @ApiOperation({ summary: 'Создать аккаунт' })
  @ApiBody({
    description: 'ДТО для создания аккаунта',
    type: AccountCreateDto,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'CREATED!',
    example: {
      id: '1c64b108-5023-4a76-a3ba-2b1657ed0c9f',
    },
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  async create(@Body() accountCreateDto: AccountCreateDto): Promise<string> {
    const newAccount = await this.accountService.create(accountCreateDto);
    const roles = await this.roleService.findAll();
    await this.roleSettingService.createAllForAccount(newAccount, roles);
    return newAccount.id;
  }
}
