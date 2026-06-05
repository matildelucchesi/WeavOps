package org.openapitools.mapper;

import org.openapitools.domain.CustomerEntity;
import org.openapitools.domain.ItemEntity;
import org.openapitools.model.Customer;
import org.openapitools.model.Item;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class ItemMapper {

    private final ArrangementMapper arrangementMapper;
    private final ProcessMapper processMapper;
    private final ReferentMapper referentMapper;

    public ItemMapper(ArrangementMapper arrangementMapper, ProcessMapper processMapper, ReferentMapper referentMapper) {
        this.arrangementMapper = arrangementMapper;
        this.processMapper = processMapper;
        this.referentMapper = referentMapper;
    }

    public Item toDto(ItemEntity entity) {
        return toDto(entity, true);
    }

    public Item toDtoWithoutCustomer(ItemEntity entity) {
        return toDto(entity, false);
    }

    public ItemEntity toEntity(Item dto) {
        return toEntity(dto, true);
    }

    public ItemEntity toEntityWithoutCustomer(Item dto) {
        return toEntity(dto, false);
    }

    private Item toDto(ItemEntity entity, boolean includeCustomer) {
        if (entity == null) {
            return null;
        }

        Item dto = new Item();
        dto.setId(entity.getId());
        dto.setArrangement(arrangementMapper.toDto(entity.getArrangement()));
        dto.setState(entity.getState());
        if (includeCustomer) {
            dto.setCustomer(toCustomerDtoWithoutItems(entity.getCustomer()));
        }
        dto.setTotalMeters(toBigDecimal(entity.getTotalMeters()));
        dto.setMetersRun(toBigDecimal(entity.getMetersRun()));
        if (entity.getProcessing() != null) {
            dto.setProcessing(entity.getProcessing().stream().map(processMapper::toDto).toList());
        }
        dto.setExpectedEndDate(entity.getExpectedEndDate());
        dto.setEndDate(entity.getEndDate());
        dto.setStartDate(entity.getStartDate());
        return dto;
    }

    private ItemEntity toEntity(Item dto, boolean includeCustomer) {
        if (dto == null) {
            return null;
        }

        ItemEntity entity = new ItemEntity();
        entity.setId(dto.getId());
        entity.setArrangement(arrangementMapper.toEntity(dto.getArrangement()));
        entity.setState(dto.getState());
        if (includeCustomer) {
            entity.setCustomer(toCustomerEntityWithoutItems(dto.getCustomer()));
        }
        entity.setTotalMeters(toInteger(dto.getTotalMeters()));
        entity.setMetersRun(toInteger(dto.getMetersRun()));
        if (dto.getProcessing() != null) {
            entity.setProcessing(dto.getProcessing().stream().map(processMapper::toEntity).toList());
        }
        entity.setExpectedEndDate(dto.getExpectedEndDate());
        entity.setEndDate(dto.getEndDate());
        entity.setStartDate(dto.getStartDate());
        return entity;
    }

    private Customer toCustomerDtoWithoutItems(CustomerEntity entity) {
        if (entity == null) {
            return null;
        }

        Customer dto = new Customer();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        if (entity.getReferents() != null) {
            dto.setReferents(entity.getReferents().stream().map(referentMapper::toDto).toList());
        }
        dto.setNote(entity.getNote());
        dto.setEmail(entity.getEmail());
        return dto;
    }

    private CustomerEntity toCustomerEntityWithoutItems(Customer dto) {
        if (dto == null) {
            return null;
        }

        CustomerEntity entity = new CustomerEntity();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        if (dto.getReferents() != null) {
            entity.setReferents(dto.getReferents().stream().map(referentMapper::toEntity).toList());
        }
        entity.setNote(dto.getNote());
        entity.setEmail(dto.getEmail());
        return entity;
    }

    private BigDecimal toBigDecimal(Integer value) {
        return value == null ? null : BigDecimal.valueOf(value);
    }

    private Integer toInteger(BigDecimal value) {
        return value == null ? null : value.intValue();
    }
}