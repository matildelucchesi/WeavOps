package org.openapitools.service;

import java.util.List;
import java.util.Optional;
import org.openapitools.domain.ArrangementEntity;
import org.openapitools.domain.ItemEntity;
import org.openapitools.repository.ArrangementRepository;
import org.openapitools.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ArrangementService {
    private final ArrangementRepository repository;
    private final ItemRepository itemRepository;
    private final ProductionForecastService productionForecastService;
    private final ArrangementProductionSynchronizationService productionSynchronization;

    @Autowired public CalendarEventService calendarService;

    public ArrangementService(
            ArrangementRepository repository,
            ItemRepository itemRepository,
            ProductionForecastService productionForecastService,
            ArrangementProductionSynchronizationService productionSynchronization) {
        this.repository = repository;
        this.itemRepository = itemRepository;
        this.productionForecastService = productionForecastService;
        this.productionSynchronization = productionSynchronization;
    }

    public List<ArrangementEntity> findAll() {
        return repository.findAll();
    }

    public ArrangementEntity save(ArrangementEntity arrangement) {
        ArrangementEntity savedArrangement = repository.save(arrangement);
        this.calendarService.createOrUpdateDeliveryDateEvent(savedArrangement);
        return savedArrangement;
    }

    public Optional<ArrangementEntity> findById(String id) {
        return repository.findById(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public Optional<ArrangementEntity> update(String id, ArrangementEntity entity) {
        if (!repository.existsById(id)) {
            return Optional.empty();
        }
        entity.setId(id);
        ArrangementEntity savedArrangement = repository.save(entity);
        this.calendarService.createOrUpdateDeliveryDateEvent(savedArrangement);
        itemRepository
                .findByArrangementId(id)
                .forEach(
                        item -> {
                            productionSynchronization.synchronize(item, savedArrangement);
                            productionForecastService.recalculateProductionForecast(item.getId());
                        });
        return Optional.of(savedArrangement);
    }

    @Transactional(rollbackFor = Exception.class)
    public Optional<ItemAndArrangement> updateItemAndArrangement(
            String itemId, ItemEntity item, String arrangementId, ArrangementEntity arrangement) {
        ItemEntity existingItem = itemRepository.findById(itemId).orElse(null);
        if (existingItem == null || !repository.existsById(arrangementId)) {
            return Optional.empty();
        }
        if (!arrangementId.equals(existingItem.getArrangementId())
                || (item.getArrangementId() != null
                        && !arrangementId.equals(item.getArrangementId()))) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La disposizione non è associata all'articolo indicato.");
        }

        arrangement.setId(arrangementId);
        ArrangementEntity savedArrangement = repository.save(arrangement);
        calendarService.createOrUpdateDeliveryDateEvent(savedArrangement);

        item.setId(itemId);
        item.setArrangementId(arrangementId);
        if (item.getExpectedEndDate() == null) {
            item.setExpectedEndDate(java.time.Instant.EPOCH);
        }
        // Le copie dei processi ricevute dal client possono essere vecchie.
        item.setProcessing(existingItem.getProcessing());
        ItemEntity savedItem = productionSynchronization.synchronize(item, savedArrangement);

        for (ItemEntity relatedItem : itemRepository.findByArrangementId(arrangementId)) {
            if (!itemId.equals(relatedItem.getId())) {
                productionSynchronization.synchronize(relatedItem, savedArrangement);
            }
            productionForecastService.recalculateProductionForecast(relatedItem.getId());
        }
        ItemEntity refreshedItem = itemRepository.findById(itemId).orElse(savedItem);
        return Optional.of(new ItemAndArrangement(refreshedItem, savedArrangement));
    }

    public record ItemAndArrangement(ItemEntity item, ArrangementEntity arrangement) {
    }

    public boolean deleteById(String id) {
        if (!repository.existsById(id)) {
            return false;
        }
        repository.deleteById(id);
        return true;
    }

    public boolean existsById(String id) {
        return repository.existsById(id);
    }
}
