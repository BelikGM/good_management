import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpStatus,
  Inject,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { UsersService } from 'src/application/services/users/users.service';
import { ReadUserDto } from 'src/contracts/user/read-user.dto';
import { CreateUserDto } from 'src/contracts/user/create-user.dto';

import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Logger } from 'winston';
import { yellow } from 'colorette';
import { AccessTokenGuard } from 'src/guards/accessToken.guard';
import { OrganizationService } from 'src/application/services/organization/organization.service';
import { PostService } from 'src/application/services/post/post.service';
import { PostReadDto } from 'src/contracts/post/read-post.dto';
import {
  beforeCreateUserExample,
  findAllUsersExample,
  findOneUserExample,
} from 'src/constants/swagger-examples/user/user-examples';
import { UpdateUserDto } from 'src/contracts/user/update-user.dto';

@ApiTags('User')
@ApiBearerAuth('access-token')
@UseGuards(AccessTokenGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly organizationService: OrganizationService,
    private readonly postService: PostService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  @Get(':organizationId/organization')
  @ApiOperation({ summary: 'Все пользователи в организации' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    type: ReadUserDto,
    isArray: true,
    example: findAllUsersExample,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Вы не авторизованы!',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  @ApiParam({
    name: 'organizationId',
    required: true,
    description: 'Id организации',
    example: '2d1cea4c-7cea-4811-8cd5-078da7f20167',
  })
  async findAll(
    @Param('organizationId') organizationId: string,
  ): Promise<ReadUserDto[]> {
    return await this.usersService.findAllForOrganization(organizationId);
  }

  @Get(':orgainizationId/new')
  @ApiOperation({ summary: 'Получить данные для создания юзера' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    type: ReadUserDto,
    example: beforeCreateUserExample,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Вы не авторизованы!',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  @ApiParam({
    name: 'orgainizationId',
    required: true,
    description: 'Id организации',
    example: '2d1cea4c-7cea-4811-8cd5-078da7f20167',
  })
  async beforeCreate(
    @Param('orgainizationId') orgainizationId: string,
  ): Promise<PostReadDto[]> {
    const [postsWithoutUser] = await Promise.all([
      this.postService.findAllWithoutUserForOrganization(orgainizationId),
    ]);
    return postsWithoutUser;
  }

  @Patch(':userId/update')
  @ApiOperation({ summary: 'Обновить контакт' })
  @ApiBody({
    description: 'ДТО для обновления юзера',
    type: UpdateUserDto,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'OK!',
    example: { id: '71ba1ba2-9e53-4238-9bb2-14a475460689' },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Ошибка валидации!',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Вы не авторизованы!',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  async update(
    @Param('userId') userId: string,
    @Body() userUpdateDto: UpdateUserDto,
  ): Promise<{ id: string }> {
    const updatedUserId = await this.usersService.update(userId, userUpdateDto);
    this.logger.info(
      `${yellow('OK!')} - userUpdateDto: ${JSON.stringify(userUpdateDto)} - Обновлен контакт!`,
    );
    return { id: updatedUserId };
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Получить пользователя по Id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    type: ReadUserDto,
    example: findOneUserExample,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Вы не авторизованы!',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: `Пользователь не найден!`,
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
  async findOne(@Param('userId') userId: string): Promise<ReadUserDto> {
    return await this.usersService.findOne(userId, ['posts']);
  }

  @Post('new')
  @ApiOperation({ summary: 'Создать контакт' })
  @ApiBody({
    description: 'ДТО для создания юзера',
    type: CreateUserDto,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'CREATED!',
    example: { id: '71ba1ba2-9e53-4238-9bb2-14a475460689' },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Ошибка валидации!',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Вы не авторизованы!',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  async create(@Body() userCreateDto: CreateUserDto): Promise<{ id: string }> {
    const [organization /**, role */] = await Promise.all([
      this.organizationService.findOneById(userCreateDto.organizationId, [
        'account',
      ]),
      // this.roleService.findOneById(userCreateDto.roleId)
    ]);
    // userCreateDto.role = role;
    userCreateDto.organization = organization;
    userCreateDto.account = organization.account;
    const createdUserId = await this.usersService.create(userCreateDto);
    this.logger.info(
      `${yellow('OK!')} - userCreateDto: ${JSON.stringify(userCreateDto)} - Создан контакт!`,
    );
    return { id: createdUserId };
  }
}
