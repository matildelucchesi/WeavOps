import { Injector, runInInjectionContext } from '@angular/core';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CreateItemWithArrangementRequest,
  ItemService as ItemApiService,
} from '../api';
import { ItemFacadeService } from './item-facade.service';

describe('ItemFacadeService', () => {
  let itemApi: {
    createItemWithArrangement: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    itemApi = {
      createItemWithArrangement: vi.fn().mockReturnValue(of({})),
    };

  });

  it('wraps createItemWithArrangement request for the generated API client', () => {
    const injector = Injector.create({
      providers: [
        { provide: ItemApiService, useValue: itemApi },
      ],
    });
    const service = runInInjectionContext(injector, () => new ItemFacadeService());
    const request: CreateItemWithArrangementRequest = {
      customerName: 'ACME Srl',
      arrangement: {
        itemName: 'Articolo 100',
        reedCount: 20,
        reedCM: 100,
        reedHeight: 1.5,
        warpLength: 200,
        piecesCount: 3,
        pieceLength: 50,
        warpEndCount: 1200,
        hitsPerDm: 25,
      },
    };

    service.createItemWithArrangement(request);

    expect(itemApi.createItemWithArrangement).toHaveBeenCalledWith({
      createItemWithArrangementRequest: request,
    });
  });
});
