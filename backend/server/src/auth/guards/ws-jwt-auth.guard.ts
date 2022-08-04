import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class WsJwtAuthGuard extends AuthGuard('ws-jwt') { }
