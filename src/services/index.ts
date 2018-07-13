import UserModel from '../models/user'
import BaseService from '../core/service/base'
import {ExchangePublishOptions, SubscribeCallback} from 'amqp'
import UserDto, {UserCreateDto} from '../dtos/user'

export interface UserService extends BaseService {
  createUser(userCreateDto: UserCreateDto): Promise<UserModel>

  list(): Promise<UserDto[]>

  listApi(): Promise<UserModel[] | undefined>
}

export interface AmqpService extends BaseService {
  sendMessage(exchangeName: string, routingKey: string, message: any, options: ExchangePublishOptions): Promise<any>

  subscribe(queueName: string, handler: SubscribeCallback): Promise<void>
}
