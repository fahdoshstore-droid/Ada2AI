import { SportIdClient } from '../clients/sportid.client.js';
import { PlayersMapper } from '../mappers/players.mapper.js';
import type { Player } from '../types/index.js';
import { ErrorCodes } from '../utils/errors.js';
import { AxiosError } from 'axios';

export class PlayersService {
  private sportIdClient: SportIdClient;

  constructor() {
    this.sportIdClient = new SportIdClient('http://localhost:8004');
  }

  async getPlayers(filters?: { team?: string; position?: string }): Promise<{ players: Player[] }> {
    try {
      const players = await this.sportIdClient.getPlayers(filters);
      return { players: PlayersMapper.fromExpressArray(players) };
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response) {
          throw Object.assign(new Error(), {
            code: ErrorCodes.BACKEND_ERROR,
            message: `Backend error: ${error.response.status}`,
            status: error.response.status,
          });
        } else if (error.request) {
          throw Object.assign(new Error(), {
            code: ErrorCodes.NETWORK_ERROR,
            message: 'Cannot connect to backend server',
            status: 0,
          });
        }
      }
      throw Object.assign(new Error(), {
        code: ErrorCodes.UNKNOWN_ERROR,
        message: 'An unexpected error occurred',
        status: 0,
      });
    }
  }

  async getPlayerById(id: number): Promise<Player> {
    try {
      const player = await this.sportIdClient.getPlayerById(id);
      return PlayersMapper.fromExpress(player);
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          throw Object.assign(new Error(), {
            code: ErrorCodes.PLAYER_NOT_FOUND,
            message: `Player with id ${id} not found`,
            status: 404,
          });
        } else if (error.response) {
          throw Object.assign(new Error(), {
            code: ErrorCodes.BACKEND_ERROR,
            message: `Backend error: ${error.response.status}`,
            status: error.response.status,
          });
        } else if (error.request) {
          throw Object.assign(new Error(), {
            code: ErrorCodes.NETWORK_ERROR,
            message: 'Cannot connect to backend server',
            status: 0,
          });
        }
      }
      throw Object.assign(new Error(), {
        code: ErrorCodes.UNKNOWN_ERROR,
        message: 'An unexpected error occurred',
        status: 0,
      });
    }
  }
}