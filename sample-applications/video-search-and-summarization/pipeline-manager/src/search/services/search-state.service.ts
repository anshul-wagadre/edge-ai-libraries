import { Injectable, Logger } from '@nestjs/common';
import {
  SearchQuery,
  SearchResultBody,
  SearchShimQuery,
} from '../model/search.model';
import { SearchDbService } from './search-db.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { SocketEvent } from 'src/events/socket.events';
import { SearchEvents } from 'src/events/Pipeline.events';
import { SearchShimService } from './search-shim.service';
import { lastValueFrom } from 'rxjs';
import { v4 as uuidV4 } from 'uuid';
import { SearchEntity } from '../model/search.entity';

@Injectable()
export class SearchStateService {
  constructor(
    private $searchDB: SearchDbService,
    private $emitter: EventEmitter2,
    private $searchShim: SearchShimService,
  ) {}

  async newQuery(query: string, tags: string[] = []) {
    const searchQuery: SearchQuery = {
      queryId: uuidV4(),
      query,
      watch: false,
      results: [],
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    Logger.log('Search', searchQuery);

    console.log(searchQuery);

    const res = await this.$searchDB.create(searchQuery);
    return res;
  }

  async addQuery(query: string, tags: string[]) {
    const searchQuery = await this.newQuery(query, tags);
    const results = await this.runSearch(searchQuery.queryId, query, tags);

    const promises: Promise<SearchEntity | null>[] = [];

    for (const result of results.results) {
      promises.push(this.updateResults(searchQuery.queryId, result));
    }

    await Promise.all(promises);

    const freshEntity = await this.$searchDB.read(searchQuery.queryId);

    return freshEntity;
  }

  async addToWatch(queryId: string) {
    await this.$searchDB.updateWatch(queryId, true);
  }

  async removeFromWatch(queryId: string) {
    await this.$searchDB.updateWatch(queryId, false);
  }

  async reRunQuery(queryId: string) {
    const query = await this.$searchDB.read(queryId);
    if (!query) {
      throw new Error(`Query with ID ${queryId} not found`);
    }
    const results = await this.runSearch(queryId, query.query, query.tags);
    if (results.results.length > 0) {
      const relevantResults = results.results.find(
        (el) => el.query_id === queryId,
      );

      if (relevantResults) {
        const freshEntity = await this.updateResults(queryId, relevantResults);

        if (freshEntity?.watch) {
          this.$emitter.emit(SocketEvent.SEARCH_NOTIFICATION, { queryId });
        }

        return freshEntity;
      }
      return null;
    } else {
      Logger.warn(`No results found for query ID ${queryId}`);
      return null;
    }
  }

  async runSearch(queryId: string, query: string, tags: string[]) {
    const queryShim: SearchShimQuery = {
      query,
      query_id: queryId,
      tags,
    };

    const results = await lastValueFrom(this.$searchShim.search([queryShim]));

    return results.data || { results: [] };
  }

  async updateResults(queryId: string, results: SearchResultBody) {
    const query = await this.$searchDB.addResults(queryId, results.results);
    if (query) {
      if (query.watch) {
        this.$emitter.emit(SocketEvent.SEARCH_NOTIFICATION, { queryId });
      }
    }
    return query;
  }

  @OnEvent(SearchEvents.EMBEDDINGS_UPDATE)
  async syncSearches() {
    const queries = await this.$searchDB.readAll();

    const queriesOnWatch: SearchQuery[] = queries.filter(
      (query) => !query.watch,
    );

    if (queriesOnWatch.length > 0) {
      const reRunPromises = queriesOnWatch.map((query) =>
        this.reRunQuery(query.queryId),
      );

      await Promise.all(reRunPromises);
      this.$emitter.emit(SocketEvent.SEARCH_NOTIFICATION);
    }
  }
}
