import {Attr} from '../core/annotations/entity'

export default class UserDto {
  constructor(id: number, name: string) {

  }
}

export class UserCreateDto {
  @Attr()
  name: string
}
