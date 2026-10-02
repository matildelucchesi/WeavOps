package org.openapitools.service;

import org.openapitools.domain.ArrangementEntity;
import org.openapitools.repository.ArrangementRepository;
import org.openapitools.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ArrangementService {
    private final ArrangementRepository repository;
    private final ItemRepository itemRepository;
    private final ProductionForecastService productionForecastService;

    @Autowired
    public CalendarEventService calendarService;

    public ArrangementService(ArrangementRepository repository, ItemRepository itemRepository, ProductionForecastService productionForecastService) {
        this.repository = repository;
        this.itemRepository = itemRepository;
        this.productionForecastService = productionForecastService;
    }

    public List<ArrangementEntity> findAll() {
        return repository.findAll();
    }

    public ArrangementEntity save(ArrangementEntity arrangement) {
        ArrangementEntity savedArrangement = repository.save(arrangement);
        this.calendarService.createOrUpdateDeliveryDateEvent(savedArrangement);
        return savedArrangement;
    }

    public Optional<ArrangementEntity> findById(String id){
        return repository.findById(id);
    }

    public Optional<ArrangementEntity> update(String id, ArrangementEntity entity){
        if (!repository.existsById(id)) {
            return Optional.empty();
        }
        entity.setId(id);
        ArrangementEntity savedArrangement = repository.save(entity);
        this.calendarService.createOrUpdateDeliveryDateEvent(savedArrangement);
        itemRepository.findByArrangementId(id).forEach(item -> productionForecastService.recalculateProductionForecast(item.getId()));
        return Optional.of(savedArrangement);
    }

    public boolean deleteById(String id){
        if (!repository.existsById(id)) {
            return false;
        }
        repository.deleteById(id);
        return true;
    }

    public boolean existsById(String id){
        return repository.existsById(id);
    }
}
