import * as path from 'path'
import * as bodyParser from 'body-parser'
import * as express from 'express'
import {Application, NextFunction} from 'express'
import * as methodOverride from 'method-override'
import {Sequelize} from 'sequelize-typescript'
import autoImport from './utils/auto-import'
import {injectionList, injectorList} from './annotations/di'
import {router} from './annotations/controller'
import * as c from 'config'
import DBMigrate = require('db-migrate')
import cookieParser = require('cookie-parser')
import errorHandler = require('errorhandler')
import morgan = require('morgan')

export class Server {
  
  public app: Application
  
  constructor() {
    //create expressjs application
    this.app = express()
    
    this.migration()
        .then(() => this.config())
        .then(() => console.log('application has started'))
  }
  
  public static bootstrap(): Server {
    return new Server()
  }
  
  private async migration() {
    const migration = (DBMigrate as any).getInstance(true, {config: {dev: c.get('db')}})
    await migration.up()
  }
  
  private async config() {
    //add static paths
    this.app.use(express.static(path.join(__dirname, 'public')))
    
    this.app.set('view engine', 'json')
    
    //use logger middlware
    this.app.use(morgan('dev'))
    
    //use response form parser middlware
    this.app.use(bodyParser.json())
    
    //use query string parser middlware
    this.app.use(bodyParser.urlencoded({
                                         extended: true
                                       }))
    
    //use cookie parser middleware
    this.app.use(cookieParser('SECRET_GOES_HERE'))
    
    //use override middlware
    this.app.use(methodOverride())
    
    //catch 404 and forward to error handler
    this.app.use(function (err: any, req: express.Request, res: express.Response, next: NextFunction) {
      err.status = 404
      next(err)
    })
    
    //error handling
    this.app.use(errorHandler() as any)
    
    new Sequelize({
                    host: c.get<string>('db.host'),
                    database: c.get<string>('db.database'),
                    dialect: 'postgres',
                    username: c.get<string>('db.user'),
                    password: c.get<string>('db.password'),
                    modelPaths: [path.join(__dirname, 'models')]
                  })
    
    // register services
    await autoImport(
      path.join(__dirname, 'services', 'impl')
    )
    
    // register controllers
    await autoImport(
      path.join(__dirname, 'controllers')
    )
    
    // register listeners
    await autoImport(
      path.join(__dirname, 'listeners')
    )
    
    // inject
    injectorList.forEach(setter => setter())
    injectionList.forEach(it => it.postConstruct ? it.postConstruct() : null)
    
    this.app.use(router)
  }
}