import { NestMiddleware, Injectable } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as bodyParser from 'body-parser';
import { JSON_CONTENT_TYPE, JSONAPI_CONTENT_TYPE } from './constants';
import { JsonapiRequestHolder } from './request-holder';

declare global {
    namespace Express {
        interface Request {
            jsonapiRequestHolder?: JsonapiRequestHolder;
        }
    }
}

@Injectable()
export class JsonapiMiddleware implements NestMiddleware {
    public use(req: Request, res: Response, next: NextFunction): void {
        // NOTE - we are adding a new "holder" service that is request-scoped
        // instead of using the DI to do this for us, which wasn't working as expected,
        // this seems like the "best working approach" for now
        req.jsonapiRequestHolder = new JsonapiRequestHolder();

        // enable json parsing for jsonapi content-type
        bodyParser.json({
            type: [JSONAPI_CONTENT_TYPE, JSON_CONTENT_TYPE]
        })(req, res, next);
    }
}
