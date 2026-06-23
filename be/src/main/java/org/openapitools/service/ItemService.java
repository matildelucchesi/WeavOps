package org.openapitools.service;

import org.openapitools.domain.ArrangementEntity;
import org.openapitools.domain.CustomerEntity;
import org.openapitools.domain.ItemEntity;
import org.openapitools.domain.LoomEntity;
import org.openapitools.model.Arrangement;
import org.openapitools.model.CreateItemWithArrangementRequest;
import org.openapitools.model.Customer;
import org.openapitools.model.Item;
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
    @Autowired
    private CustomerService customerService;

    @Autowired
    private ArrangementService arrangementService;

    private final ItemRepository repository;

    public ItemService(ItemRepository repository) {
        this.repository = repository;
    }

    public List<ItemEntity> findAll() {
        return repository.findAll();
    }

    public ItemEntity save(ItemEntity item) {
        return repository.save(item);
    }

    public Optional<ItemEntity> findById(String id){
        return repository.findById(id);
    }

    public Optional<ItemEntity> update(String id, ItemEntity entity){
        if (!repository.existsById(id)) {
            return Optional.empty();
        }
        entity.setId(id);
        return Optional.of(repository.save(entity));
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

        ArrangementEntity savedArrangement = arrangementService.save(arrangement);

        ItemEntity item = new ItemEntity();
        item.setArrangementId(savedArrangement.getId());
        item.setCustomerId(customer.getId());
        item.setState(Item.StateEnum.INITIALIZED);
        item.setIsArchived(false);

        float totalMeters = arrangementRequest.getPiecesCount() * arrangementRequest.getPieceLength();
        item.setTotalMeters(Math.round(totalMeters));

        return repository.save(item);
    }

    private Instant toInstant(OffsetDateTime value) {
        return value == null ? null : value.toInstant();
    }

    public List<ItemEntity> findAllArchived() {
        return repository.findAllArchived();
    }

    public List<ItemEntity> findAllNotArchived() {
        return repository.findAllNotArchived();
    }

}
