package org.openapitools.service;

import org.openapitools.domain.ArrangementEntity;
import org.openapitools.domain.CustomerEntity;
import org.openapitools.domain.ItemEntity;
import org.openapitools.model.Arrangement;
import org.openapitools.model.CreateItemWithArrangementRequest;
import org.openapitools.model.Customer;
import org.openapitools.model.Item;
import org.openapitools.model.ProductionAdvice;
import org.openapitools.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class ItemService {
    private static final Instant TEMPORARY_ITEM_EXPECTED_END_DATE = Instant.EPOCH;

    @Autowired
    private CustomerService customerService;

    @Autowired
    private ArrangementService arrangementService;

    private final ItemRepository repository;
    private final ProductionForecastService productionForecastService;

    public ItemService(
            ItemRepository repository,
            ProductionForecastService productionForecastService
    ) {
        this.repository = repository;
        this.productionForecastService = productionForecastService;
    }

    public List<ItemEntity> findAll() {
        return repository.findAll();
    }

    public ItemEntity save(ItemEntity item) {
        ensureExpectedEndDate(item);
        return repository.save(item);
    }

    public Optional<ItemEntity> findById(String id){
        return repository.findById(id);
    }

    public int countRunningItems() {
        return repository.countByState(Item.StateEnum.RUNNING);
    }

    @Transactional(rollbackFor = Exception.class)
    public Optional<ItemEntity> update(String id, ItemEntity entity){
        if (!repository.existsById(id)) {
            return Optional.empty();
        }
        entity.setId(id);
        ensureExpectedEndDate(entity);
        ItemEntity savedItem = repository.save(entity);

        return productionForecastService.recalculateProductionForecast(savedItem.getId())
                .or(() -> Optional.of(savedItem));
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

    public Optional<Integer> calculateRemainingMetersToAssign(String itemId) {
        if (isBlank(itemId)) {
            return Optional.empty();
        }

        return repository.findById(itemId)
                .map(item -> Math.max(getTotalMeters(item) - getMetersRun(item), 0));
    }

    public Optional<ProductionAdvice> calculateProductionAdvice(String itemId) {
        return productionForecastService.calculateProductionAdvice(itemId);
    }

    private int getTotalMeters(ItemEntity item) {
        return item.getTotalMeters() != null ? item.getTotalMeters() : 0;
    }

    private int getMetersRun(ItemEntity item) {
        return item.getMetersRun() != null ? item.getMetersRun() : 0;
    }

    @Transactional(rollbackFor = Exception.class)
    public int deleteByIds(List<String> ids) {
        if (ids == null || ids.isEmpty()) {
            return 0;
        }

        List<String> sanitizedIds = ids.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(id -> !id.isEmpty())
                .distinct()
                .toList();

        if (sanitizedIds.isEmpty()) {
            return 0;
        }

        List<ItemEntity> items = new ArrayList<>();
        repository.findAllById(sanitizedIds).forEach(items::add);
        repository.deleteAll(items);

        return items.size();
    }

    @Transactional(rollbackFor = Exception.class)
    public ItemEntity createWithArrangement(CreateItemWithArrangementRequest request) {
        Arrangement arrangementRequest = request.getArrangement();

        String customerName = request.getCustomerName().trim();

        CustomerEntity customer = customerService.findByName(customerName)
                .orElseGet(() -> {
                    CustomerEntity newCustomer = new CustomerEntity();
                    newCustomer.setName(customerName);
                    return customerService.save(newCustomer);
                });

        ArrangementEntity arrangement = new ArrangementEntity();
        arrangement.setItemName(arrangementRequest.getItemName().trim());
        arrangement.setReedCount(arrangementRequest.getReedCount());
        arrangement.setReedCM(arrangementRequest.getReedCM());
        arrangement.setReedHight(arrangementRequest.getReedHeight());
        arrangement.setWarpLenght(arrangementRequest.getWarpLength());
        arrangement.setWarpEndCount(arrangementRequest.getWarpEndCount());
        arrangement.setPiecesCount(arrangementRequest.getPiecesCount());
        arrangement.setPieceLenght(arrangementRequest.getPieceLength());
        arrangement.setHitsPerDm(arrangementRequest.getHitsPerDm());
        arrangement.setDeliveryDate(toInstant(arrangementRequest.getDeliveryDate()));
        arrangement.setWorksSaturday(arrangementRequest.getWorksSaturday());
        arrangement.setSaturdayStartTime(arrangementRequest.getSaturdayStartTime());
        arrangement.setSaturdayEndTime(arrangementRequest.getSaturdayEndTime());
        arrangement.setWorksSunday(arrangementRequest.getWorksSunday());
        arrangement.setSundayStartTime(arrangementRequest.getSundayStartTime());
        arrangement.setSundayEndTime(arrangementRequest.getSundayEndTime());

        ArrangementEntity savedArrangement = arrangementService.save(arrangement);

        ItemEntity item = new ItemEntity();
        item.setArrangementId(savedArrangement.getId());
        item.setCustomerId(customer.getId());
        item.setState(Item.StateEnum.INITIALIZED);
        item.setIsArchived(false);
        item.setExpectedEndDate(TEMPORARY_ITEM_EXPECTED_END_DATE);

        float totalMeters = arrangementRequest.getPiecesCount() * arrangementRequest.getPieceLength();
        item.setTotalMeters(Math.round(totalMeters));

        return repository.save(item);
    }

    private void ensureExpectedEndDate(ItemEntity item) {
        if (item.getExpectedEndDate() == null) {
            item.setExpectedEndDate(TEMPORARY_ITEM_EXPECTED_END_DATE);
        }
    }

    private Instant toInstant(OffsetDateTime value) {
        return value == null ? null : value.toInstant();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    public List<ItemEntity> findAllArchived() {
        return repository.findAllArchived();
    }

    public List<ItemEntity> findAllNotArchived() {
        return repository.findAllNotArchived();
    }

    public void addMeters(String id, Integer meters){
        this.repository.findById(id).ifPresent(itemEntity -> {
            Integer currentMetersRun = itemEntity.getMetersRun() != null ? itemEntity.getMetersRun() : 0;
            itemEntity.setMetersRun(currentMetersRun + meters);
            this.repository.save(itemEntity);
        });
    }

}
