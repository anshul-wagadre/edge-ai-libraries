import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { SearchQueryDTO, SearchShimQuery } from '../model/search.model';
import { SearchStateService } from '../services/search-state.service';
import { SearchDbService } from '../services/search-db.service';
import { SearchShimService } from '../services/search-shim.service';
import { lastValueFrom } from 'rxjs';

import { v4 as uuidV4 } from 'uuid';

@Controller('search')
export class SearchController {
  constructor(
    private $search: SearchStateService,
    private $searchDB: SearchDbService,
    private $searchShim: SearchShimService,
  ) {}

  @Get('')
  async getQueries() {
    return await this.$searchDB.readAll();
  }

  @Get(':queryId')
  async getQuery(@Param() params: { queryId: string }) {
    return await this.$searchDB.read(params.queryId);
  }

  @Post('')
  async addQuery(@Body() reqBody: SearchQueryDTO) {
    try {
      const query = await this.$search.addQuery(
        reqBody.query,
        reqBody.tags ?? [],
      );
      return query;
    } catch (error) {
      Logger.error('Error adding query', error);
    }
  }

  @Post(':queryId/refetch')
  async refetchQuery(@Param() params: { queryId: string }) {
    const res = await this.$search.reRunQuery(params.queryId);
    return res;
  }

  @Post('query')
  async searchQuery(@Body() reqBody: SearchQueryDTO) {
    const queryShim: SearchShimQuery = {
      query: reqBody.query,
      query_id: uuidV4(),
    };
    const res = await lastValueFrom(this.$searchShim.search([queryShim]));
    return res.data;
  }

  @Patch(':queryId/watch')
  watchQuery(
    @Param() params: { queryId: string },
    @Body() body: { watch: boolean },
  ) {
    if (!Object.prototype.hasOwnProperty.call(body, 'watch')) {
      throw new BadRequestException('Watch property is required');
    }

    return body.watch
      ? this.$search.addToWatch(params.queryId)
      : this.$search.removeFromWatch(params.queryId);
  }

  @Delete(':queryId')
  async deleteQuery(@Param() params: { queryId: string }) {
    return await this.$searchDB.remove(params.queryId);
  }
}
