package org.openapitools.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.openapitools.domain.ArrangementEntity;
import org.openapitools.domain.ItemEntity;
import org.openapitools.domain.ProcessEntity;
import org.openapitools.repository.ArrangementRepository;
import org.openapitools.repository.ItemRepository;

class ArrangementServiceTest {
    private final ArrangementRepository arrangements = mock(ArrangementRepository.class);
    private final ItemRepository items = mock(ItemRepository.class);
    private final ProductionForecastService forecasts = mock(ProductionForecastService.class);
    private final ArrangementProductionSynchronizationService synchronization =
            mock(ArrangementProductionSynchronizationService.class);
    private final ArrangementService service =
            new ArrangementService(arrangements, items, forecasts, synchronization);

    @Test
    void savesArticleAndDispositionThenSynchronizesBeforeForecasting() {
        service.calendarService = mock(CalendarEventService.class);
        ItemEntity stored = new ItemEntity();
        stored.setId("item");
        stored.setArrangementId("arrangement");
        ProcessEntity process = new ProcessEntity();
        process.setId("process");
        stored.setProcessing(List.of(process));
        ItemEntity submitted = new ItemEntity();
        submitted.setArrangementId("arrangement");
        ArrangementEntity arrangement = new ArrangementEntity();
        when(items.findById("item")).thenReturn(Optional.of(stored), Optional.of(submitted));
        when(arrangements.existsById("arrangement")).thenReturn(true);
        when(arrangements.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(synchronization.synchronize(submitted, arrangement)).thenReturn(submitted);
        when(items.findByArrangementId("arrangement")).thenReturn(List.of(submitted));

        var updated =
                service.updateItemAndArrangement("item", submitted, "arrangement", arrangement)
                        .orElseThrow();

        assertSame(stored.getProcessing(), submitted.getProcessing());
        assertSame(submitted, updated.item());
        var order = inOrder(arrangements, synchronization, forecasts);
        order.verify(arrangements).save(arrangement);
        order.verify(synchronization).synchronize(submitted, arrangement);
        order.verify(forecasts).recalculateProductionForecast("item");
    }

    @Test
    void alsoSynchronizesUpdatesThroughTheDispositionEndpoint() {
        service.calendarService = mock(CalendarEventService.class);
        ArrangementEntity arrangement = new ArrangementEntity();
        ItemEntity item = new ItemEntity();
        item.setId("item");
        when(arrangements.existsById("arrangement")).thenReturn(true);
        when(arrangements.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(items.findByArrangementId("arrangement")).thenReturn(List.of(item));
        service.update("arrangement", arrangement);
        var order = inOrder(synchronization, forecasts);
        order.verify(synchronization).synchronize(item, arrangement);
        order.verify(forecasts).recalculateProductionForecast("item");
    }
}
