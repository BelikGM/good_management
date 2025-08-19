import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Body,
  Post,
  Inject,
  Ip,
  Patch,
} from '@nestjs/common';
import { UsersService } from 'src/application/services/users/users.service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OrganizationService } from 'src/application/services/organization/organization.service';
import { OrganizationReadDto } from 'src/contracts/organization/read-organization.dto';
import { Logger } from 'winston';
import { red, yellow } from 'colorette';
import { GroupService } from 'src/application/services/group/group.service';
import { GroupReadDto } from 'src/contracts/group/read-group.dto';
import { GroupUpdateDto } from 'src/contracts/group/update-group.dto';
import { GroupCreateDto } from 'src/contracts/group/create-group.dto';

@ApiTags('Group')
// @UseGuards(AccessTokenGuard)
@Controller(':userId/groups')
export class GroupController {
  constructor(
    private readonly groupService: GroupService,
    private readonly organizationService: OrganizationService,
    private readonly userService: UsersService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Все группы' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: [
      {
        id: 'a438f7df-ceec-430d-944a-0a79492e30ee',
        groupName: 'Говнюки',
        groupNumber: 1,
        createdAt: '2024-10-28T13:35:35.305Z',
        updatedAt: '2024-10-28T13:35:35.305Z',
      },
    ],
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'Id пользователя',
    example: 'bc807845-08a8-423e-9976-4f60df183ae2',
  })
  async findAll(
    @Param('userId') userId: string,
    @Ip() ip: string,
  ): Promise<GroupReadDto[]> {
    const user = await this.userService.findOne(userId, ['account']);
    const groups = await this.groupService.findAllForAccount(user.account);
    return groups;
  }

  @Get('new')
  @ApiOperation({ summary: 'Получить данные для создания новой группы' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: [
      {
        id: '865a8a3f-8197-41ee-b4cf-ba432d7fd51f',
        organizationName: 'soplya firma',
        parentOrganizationId: null,
        createdAt: '2024-09-16T14:24:33.841Z',
        updatedAt: '2024-09-16T14:24:33.841Z',
        posts: [
          {
            id: '7730b6c2-c037-4c45-9dcc-603d7035d6a3',
            postName: 'srdsg',
            divisionName: 'fggg',
            parentId: null,
            product: 'sdfdsf',
            purpose: 'fsdfsd',
            createdAt: '2024-10-04T09:38:04.947Z',
            updatedAt: '2024-10-04T09:38:04.947Z',
            user: {
              id: '702dc852-4806-47b7-8b03-1214ef428efd',
              firstName: 'Валерий',
              lastName: 'Лысенко',
              middleName: null,
              telegramId: 803348257,
              telephoneNumber: '+79787512027',
              avatar_url: null,
              vk_id: null,
              createdAt: '2024-09-30T14:10:48.302Z',
              updatedAt: '2024-10-09T09:27:30.811Z',
            },
          },
        ],
      },
      {
        id: '1f1cca9a-2633-489c-8f16-cddd411ff2d0',
        organizationName: 'OOO BOBRIK',
        parentOrganizationId: '865a8a3f-8197-41ee-b4cf-ba432d7fd51f',
        createdAt: '2024-09-16T15:09:48.995Z',
        updatedAt: '2024-09-16T15:09:48.995Z',
        posts: [
          {
            id: 'fcf0d021-25f3-47f5-89dd-11d01be2e97d',
            postName: 'SDfxcg',
            divisionName: 'sdf',
            parentId: null,
            product: 'df',
            purpose: 'fg',
            createdAt: '2024-10-04T09:40:38.891Z',
            updatedAt: '2024-10-04T09:40:38.891Z',
            user: {
              id: '702dc852-4806-47b7-8b03-1214ef428efd',
              firstName: 'Валерий',
              lastName: 'Лысенко',
              middleName: null,
              telegramId: 803348257,
              telephoneNumber: '+79787512027',
              avatar_url: null,
              vk_id: null,
              createdAt: '2024-09-30T14:10:48.302Z',
              updatedAt: '2024-10-09T09:27:30.811Z',
            },
          },
        ],
      },
    ],
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'Id пользователя',
    example: 'bc807845-08a8-423e-9976-4f60df183ae2',
  })
  async beforeCreate(
    @Param('userId') userId: string,
    @Ip() ip: string,
  ): Promise<OrganizationReadDto[]> {
    const user = await this.userService.findOne(userId, ['account']);
    const organizations = await this.organizationService.findAllForAccount(
      user.account.id,
      ['posts.user'],
    );
    return organizations;
  }

  @Patch(':groupId/update')
  @ApiOperation({ summary: 'Обновить группу по Id' })
  @ApiBody({
    description: 'ДТО для обновления группы',
    type: GroupUpdateDto,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: '3bfe46ff-a10b-4f55-a865-5ed478f4347d',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: `Группа не найдена!`,
  })
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'Id пользователя',
    example: 'bc807845-08a8-423e-9976-4f60df183ae2',
  })
  @ApiParam({ name: 'groupId', required: true, description: 'Id группы' })
  async update(
    @Param('groupId') groupId: string,
    @Body() groupUpdateDto: GroupUpdateDto,
    @Ip() ip: string,
  ): Promise<{ id: string }> {
    const updatedGroupId = await this.groupService.update(
      groupId,
      groupUpdateDto,
    );
    this.logger.info(
      `${yellow('OK!')} - ${red(ip)} - groupUpdateDto: ${JSON.stringify(groupUpdateDto)} - Группа успешно обновлена!`,
    );
    return { id: updatedGroupId };
  }

  @Get(':groupId')
  // @UseGuards(PermissionsGuard)
  // @ModuleAccess(Modules.POLICY)
  // @ActionAccess(Actions.READ)
  @ApiOperation({ summary: 'Получить группу по ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: {
      id: 'a438f7df-ceec-430d-944a-0a79492e30ee',
      groupName: 'Говнюки',
      groupNumber: 1,
      createdAt: '2024-10-28T13:35:35.305Z',
      updatedAt: '2024-10-28T13:35:35.305Z',
      groupToUsers: [
        {
          id: '498ea906-3af3-42cd-a75e-b4cafa17552c',
          createdAt: '2024-10-28T13:35:35.557Z',
          updatedAt: '2024-10-28T13:35:35.557Z',
          user: {
            id: '702dc852-4806-47b7-8b03-1214ef428efd',
            firstName: 'Валерий',
            lastName: 'Лысенко',
            middleName: null,
            telegramId: 803348257,
            telephoneNumber: '+79787512027',
            avatar_url: null,
            vk_id: null,
            createdAt: '2024-09-30T14:10:48.302Z',
            updatedAt: '2024-10-09T09:27:30.811Z',
          },
        },
        {
          id: 'bc220491-fac3-4952-8eb4-51ba497aa083',
          createdAt: '2024-10-28T13:35:35.777Z',
          updatedAt: '2024-10-28T13:35:35.777Z',
          user: {
            id: 'bc807845-08a8-423e-9976-4f60df183ae2',
            firstName: 'Maxik',
            lastName: 'Koval',
            middleName: null,
            telegramId: 453120600,
            telephoneNumber: '+79787513901',
            avatar_url: null,
            vk_id: null,
            createdAt: '2024-09-16T14:03:31.000Z',
            updatedAt: '2024-10-09T09:25:39.735Z',
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: `Группа не найдена!`,
  })
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'Id пользователя',
    example: 'bc807845-08a8-423e-9976-4f60df183ae2',
  })
  @ApiParam({ name: 'groupId', required: true, description: 'Id группы' })
  async findOne(
    @Param('userId') userId: string,
    @Param('groupId') groupId: string,
    @Ip() ip: string,
  ): Promise<GroupReadDto> {
    const group = await this.groupService.findOneById(groupId, [
      'groupToUsers.user',
    ]);
    this.logger.info(
      `${yellow('OK!')} - ${red(ip)} - CURRENT GROUP: ${JSON.stringify(group)} - Получить группу по ID!`,
    );
    return group;
  }

  @Post('new')
  @ApiOperation({ summary: 'Создать группу' })
  @ApiBody({
    description: 'ДТО для создания группы',
    type: GroupCreateDto,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'ОК!',
    example: '71ba1ba2-9e53-4238-9bb2-14a475460689',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Ошибка валидации!',
  })
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'Id пользователя',
    example: 'bc807845-08a8-423e-9976-4f60df183ae2',
  })
  async create(
    @Param('userId') userId: string,
    @Body() groupCreateDto: GroupCreateDto,
    @Ip() ip: string,
  ): Promise<{ id: string }> {
    const user = await this.userService.findOne(userId, ['account']);
    groupCreateDto.account = user.account;
    const createdGroupId = await this.groupService.create(groupCreateDto);
    // const createdEventPolicyDto: PolicyCreateEventDto = {
    //     eventType: 'POLICY_CREATED',
    //     id: createdPolicyId,
    //     policyName: policyCreateDto.policyName,
    //     state: policyCreateDto.state !== undefined ? policyCreateDto.state as string : State.DRAFT as string,
    //     type: policyCreateDto.type !== undefined ? policyCreateDto.type as string : Type.DIRECTIVE as string,
    //     content: policyCreateDto.content,
    //     createdAt: new Date(),
    //     userId: user.id,
    //     accountId: user.account.id,
    //     policyToOrganizations: policyCreateDto.policyToOrganizations
    // };
    // await this.producerService.sendCreatedPolicyToQueue(createdEventPolicyDto)
    this.logger.info(
      `${yellow('OK!')} - ${red(ip)} - groupCreateDto: ${JSON.stringify(groupCreateDto)} - Создана новая группа!`,
    );
    return { id: createdGroupId };
  }
}
