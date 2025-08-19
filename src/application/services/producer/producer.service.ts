import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { Channel } from 'amqplib';
import { GoalCreateEventDto } from 'src/contracts/goal/createEvent-goal.dto';
import { GoalUpdateEventDto } from 'src/contracts/goal/updateEvent-goal.dto';
import { ObjectiveCreateEventDto } from 'src/contracts/objective/createEvent-objective.dto';
import { ObjectiveUpdateEventDto } from 'src/contracts/objective/updateEvent-objective.dto';
import { PolicyCreateEventDto } from 'src/contracts/policy/createEvent-policy.dto';
import { PolicyUpdateEventDto } from 'src/contracts/policy/updateEvent-policy.dto';
import { PostCreateEventDto } from 'src/contracts/post/createEvent-post.dto';
import { PostUpdateEventDto } from 'src/contracts/post/updateEvent-post.dto';
import { ProjectCreateEventDto } from 'src/contracts/project/createEvent-project.dto';
import { ProjectUpdateEventDto } from 'src/contracts/project/updateEvent-project.dto';
import { StatisticCreateEventDto } from 'src/contracts/statistic/createEvent-statistic.dto';
import { StatisticUpdateEventDto } from 'src/contracts/statistic/updateEvent-statistic.dto';
import { StrategyCreateEventDto } from 'src/contracts/strategy/createEvent-strategy.dto';
import { StrategyUpdateEventDto } from 'src/contracts/strategy/updateEvent-strategy.dto';

@Injectable()
export class ProducerService {
  private channelWrapper: ChannelWrapper;
  constructor() {
    if (process.env.NODE_ENV === 'dev') {
      //
      // ДЛЯ ЛОКАЛЬНЫХ ТЕСТОВ
      const connection = amqp.connect(['amqp://rabbitmq']);
      this.channelWrapper = connection.createChannel({
        setup: (channel: Channel) => {
          return channel.assertQueue('test_events', { durable: true });
        },
      });
    } else {
      // ДЛЯ ПРОДА
      const connection = amqp.connect([
        {
          hostname: `${process.env.RABBITMQ_HOSTNAME}`,
          username: `${process.env.RABBITMQ_USERNAME}`,
          password: `${process.env.RABBITMQ_PASSWORD}`,
          vhost: '/',
        },
      ]);
      this.channelWrapper = connection.createChannel({
        setup: (channel: Channel) => {
          return channel.assertQueue('gm-to-nest-events', { durable: true });
        },
      });
    }
  }

  async sendCreatedGoalToQueue(goal: GoalCreateEventDto) {
    try {
      await this.channelWrapper.sendToQueue(
        'test_events',
        Buffer.from(JSON.stringify(goal)),
        {
          persistent: true,
        },
      );
      Logger.log('Sent To Queue');
    } catch (error) {
      throw new HttpException(
        'Error adding message to queue',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendUpdatedGoalToQueue(goal: GoalUpdateEventDto) {
    try {
      await this.channelWrapper.sendToQueue(
        'test_events',
        Buffer.from(JSON.stringify(goal)),
        {
          persistent: true,
        },
      );
      Logger.log('Sent To Queue');
    } catch (error) {
      throw new HttpException(
        'Error adding message to queue',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendCreatedObjectiveToQueue(objective: ObjectiveCreateEventDto) {
    try {
      await this.channelWrapper.sendToQueue(
        'test_events',
        Buffer.from(JSON.stringify(objective)),
        {
          persistent: true,
        },
      );
      Logger.log('Sent To Queue');
    } catch (error) {
      throw new HttpException(
        'Error adding message to queue',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendUpdatedObjectiveToQueue(objective: ObjectiveUpdateEventDto) {
    try {
      await this.channelWrapper.sendToQueue(
        'test_events',
        Buffer.from(JSON.stringify(objective)),
        {
          persistent: true,
        },
      );
      Logger.log('Sent To Queue');
    } catch (error) {
      throw new HttpException(
        'Error adding message to queue',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendCreatedPolicyToQueue(policy: PolicyCreateEventDto) {
    try {
      await this.channelWrapper.sendToQueue(
        'test_events',
        Buffer.from(JSON.stringify(policy)),
        {
          persistent: true,
        },
      );
      Logger.log('Sent To Queue');
    } catch (error) {
      throw new HttpException(
        'Error adding message to queue',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendUpdatedPolicyToQueue(policy: PolicyUpdateEventDto) {
    try {
      await this.channelWrapper.sendToQueue(
        'test_events',
        Buffer.from(JSON.stringify(policy)),
        {
          persistent: true,
        },
      );
      Logger.log('Sent To Queue');
    } catch (error) {
      throw new HttpException(
        'Error adding message to queue',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendCreatedPostToQueue(post: PostCreateEventDto) {
    try {
      await this.channelWrapper.sendToQueue(
        'test_events',
        Buffer.from(JSON.stringify(post)),
        {
          persistent: true,
        },
      );
      Logger.log('Sent To Queue');
    } catch (error) {
      throw new HttpException(
        'Error adding message to queue',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendUpdatedPostToQueue(post: PostUpdateEventDto) {
    try {
      await this.channelWrapper.sendToQueue(
        'test_events',
        Buffer.from(JSON.stringify(post)),
        {
          persistent: true,
        },
      );
      Logger.log('Sent To Queue');
    } catch (error) {
      throw new HttpException(
        'Error adding message to queue',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendCreatedProjectToQueue(project: ProjectCreateEventDto) {
    try {
      await this.channelWrapper.sendToQueue(
        'test_events',
        Buffer.from(JSON.stringify(project)),
        {
          persistent: true,
        },
      );
      Logger.log('Sent To Queue');
    } catch (error) {
      throw new HttpException(
        'Error adding message to queue',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendUpdatedProjectToQueue(project: ProjectUpdateEventDto) {
    try {
      await this.channelWrapper.sendToQueue(
        'test_events',
        Buffer.from(JSON.stringify(project)),
        {
          persistent: true,
        },
      );
      Logger.log('Sent To Queue');
    } catch (error) {
      throw new HttpException(
        'Error adding message to queue',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendCreatedStatisticToQueue(statistic: StatisticCreateEventDto) {
    try {
      await this.channelWrapper.sendToQueue(
        'test_events',
        Buffer.from(JSON.stringify(statistic)),
        {
          persistent: true,
        },
      );
      Logger.log('Sent To Queue');
    } catch (error) {
      throw new HttpException(
        'Error adding message to queue',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendUpdatedStatisticToQueue(statistic: StatisticUpdateEventDto) {
    try {
      await this.channelWrapper.sendToQueue(
        'test_events',
        Buffer.from(JSON.stringify(statistic)),
        {
          persistent: true,
        },
      );
      Logger.log('Sent To Queue');
    } catch (error) {
      throw new HttpException(
        'Error adding message to queue',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendCreatedStrategyToQueue(strategy: StrategyCreateEventDto) {
    try {
      await this.channelWrapper.sendToQueue(
        'test_events',
        Buffer.from(JSON.stringify(strategy)),
        {
          persistent: true,
        },
      );
      Logger.log('Sent To Queue');
    } catch (error) {
      throw new HttpException(
        'Error adding message to queue',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendUpdatedStrategyToQueue(strategy: StrategyUpdateEventDto) {
    try {
      await this.channelWrapper.sendToQueue(
        'test_events',
        Buffer.from(JSON.stringify(strategy)),
        {
          persistent: true,
        },
      );
      Logger.log('Sent To Queue');
    } catch (error) {
      throw new HttpException(
        'Error adding message to queue',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
