import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  OneToOne,
} from 'typeorm';
import { Account } from './account.entity';
import { Message } from './message.entity';
import { ConvertToPost } from './convertToPost.entity';
import { Post } from './post.entity';
import { Target } from './target.entity';
import { WatchersToConvert } from './watchersToConvert.entity';

/**
 * Перечисление типов конвертов.
 */
export enum TypeConvert {
  CHAT = 'Переписка',
  ORDER = 'Приказ',
  PROPOSAL = 'Заявка',
}
/**
 * Перечисление маршрутов конвертов.
 */
export enum PathConvert {
  DIRECT = 'Прямой',
  COORDINATION = 'Согласование',
  REQUEST = 'Запрос',
}

/**
 * Сущность Convert.
 * Представляет конверт для отправки документов между постами.
 */
@Entity()
export class Convert {
  /**
   * Уникальный идентификатор конвертации.
   *
   * @remarks
   * Поле автоматически генерируется и имеет формат UUID v4.0.
   *
   * @example
   * '550e8400-e29b-41d4-a716-446655440000'
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Тема конвертации.
   *
   * @remarks
   * nullable: false.
   *
   * @example
   * 'Согласование новой политики'
   */
  @Column({ nullable: false, length: 1024 })
  convertTheme: string;

  /**
   * Список постов, через которые должен пройти конверт.
   *
   * @remarks
   * Поле содержит массив UUID постов.
   *
   * @example
   * ['123e4567-e89b-12d3-a456-426614174000', '550e8400-e29b-41d4-a716-446655440000']
   */
  @Column({ type: 'uuid', array: true, nullable: true })
  pathOfPosts: string[];

  /**
   * Тип маршрута конверта.
   *
   * @remarks
   * Использует перечисление PathConvert. Поле может быть пустым.
   *
   * @example
   * PathConvert.DIRECT
   */
  @Column({
    type: 'enum',
    enum: PathConvert,
    nullable: false,
  })
  convertPath: PathConvert;

  /**
   * Тип конвертации.
   *
   * @remarks
   * Использует перечисление TypeConvert. Поле может быть пустым.
   *
   * @example
   * TypeConvert.DIRECT
   */
  @Column({
    type: 'enum',
    enum: TypeConvert,
    nullable: false,
  })
  convertType: TypeConvert;

  /**
   * Статус конверта.
   *
   * @remarks
   * default: true, nullable: false. true - активен, false - завершен
   *
   * @example
   * true
   */
  @Column({ default: true, nullable: false })
  convertStatus: boolean;

  /**
   * Идентификатор поста, который должен подтвердить получение конверта.
   *
   * @remarks
   * Ссылается на поста, выполняющего текущие действия.
   *
   * @example
   * '123e4567-e89b-12d3-a456-426614174000'
   */
  @Column({ type: 'uuid', nullable: true })
  activePostId: string;

  /**
   * Дата старта конверта.
   *
   * @remarks
   * default: CURRENT_TIMESTAMP, nullable: false
   */
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  dateStart: Date;

  /**
   * Дедлайн конверта.
   *
   * @remarks
   * nullable: true
   */
  @Column({ type: 'timestamp', nullable: true })
  deadline: Date;

  /**
   * Дата завершения конверта.
   *
   * @remarks
   * Поле заполняется при завершении конверта.
   *
   * @example
   * '2024-06-10T08:15:30Z'
   */
  @Column({ type: 'timestamp', nullable: true })
  dateFinish: Date;

  /**
   * Дата и время создания конвертации.
   *
   * @remarks
   * Поле автоматически заполняется при создании конверта.
   *
   * @example
   * '2024-06-01T12:34:56Z'
   */
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  /**
   * Связь с сущностью 1:1 Target.
   */
  @OneToOne(() => Target, (target) => target.convert)
  target: Target;

  /**
   * Связь с сообщениями (1:M Message).
   */
  @OneToMany(() => Message, (message) => message.convert)
  messages: Message[];

  /**
   * Связь с пользователями конверта (1:M ConvertToUser).
   */
  @OneToMany(() => ConvertToPost, (convertToPost) => convertToPost.convert)
  convertToPosts: ConvertToPost[];

  /**
   * Связь с пользователями конверта (1:M watchersToConvert).
   */
  @OneToMany(() => WatchersToConvert, (watcher) => watcher.convert)
  watchersToConvert: WatchersToConvert[];

  /**
   * Связь с хостом конвертации (M:1 User).
   *
   * @remarks
   * nullable: false.
   */
  @ManyToOne(() => Post, (post) => post.convert, { nullable: false })
  host: Post;

  /**
   * Связь с аккаунтом (M:1 Account).
   *
   * @remarks
   * nullable: false.
   */
  @ManyToOne(() => Account, (account) => account.converts, { nullable: false })
  account: Account;
}
