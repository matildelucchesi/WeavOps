package org.openapitools.mapper;

import org.openapitools.domain.CustomerEntity;
import org.openapitools.model.Customer;
import org.springframework.stereotype.Component;

@Component
public class CustomerMapper {

    private final ReferentMapper referentMapper;
    private final ItemMapper itemMapper;

    public CustomerMapper(ReferentMapper referentMapper, ItemMapper itemMapper) {
        this.referentMapper = referentMapper;
        this.itemMapper = itemMapper;
    }

    public Customer toDto(CustomerEntity entity) {
        if (entity == null) {
            return null;
        }

        Customer dto = new Customer();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        if (entity.getReferents() != null) {
            dto.setReferents(entity.getReferents().stream().map(referentMapper::toDto).toList());
        }
        if (entity.getItems() != null) {
            dto.setItems(entity.getItems().stream().map(itemMapper::toDtoWithoutCustomer).toList());
        }
        dto.setNote(entity.getNote());
        dto.setEmail(entity.getEmail());
        return dto;
    }

    public CustomerEntity toEntity(Customer dto) {
        if (dto == null) {
            return null;
        }

        CustomerEntity entity = new CustomerEntity();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        if (dto.getReferents() != null) {
            entity.setReferents(dto.getReferents().stream().map(referentMapper::toEntity).toList());
        }
        if (dto.getItems() != null) {
            entity.setItems(dto.getItems().stream().map(itemMapper::toEntityWithoutCustomer).toList());
        }
        entity.setNote(dto.getNote());
        entity.setEmail(dto.getEmail());
        return entity;
    }
}