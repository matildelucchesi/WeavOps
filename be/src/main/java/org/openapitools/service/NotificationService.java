package org.openapitools.service;

import org.openapitools.domain.ArrangementEntity;
import org.openapitools.domain.ItemEntity;
import org.openapitools.model.Notification;
import org.openapitools.repository.ArrangementRepository;
import org.openapitools.repository.ItemRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {
    private final ItemRepository itemRepository;
    private final ArrangementRepository arrangementRepository;

    public NotificationService(
            ItemRepository itemRepository,
            ArrangementRepository arrangementRepository
    ) {
        this.itemRepository = itemRepository;
        this.arrangementRepository = arrangementRepository;
    }

    public List<Notification> findAll() {
        return findItemDeliveryRiskNotifications();
    }

    public List<Notification> findItemDeliveryRiskNotifications() {
        return itemRepository.findAllNotArchived().stream()
                .filter(item -> !Boolean.TRUE.equals(item.getDelivered()))
                .filter(item -> item.getExpectedEndDate() != null)
                .map(this::buildItemDeliveryRiskNotification)
                .flatMap(Optional::stream)
                .sorted(Comparator.comparing(Notification::getDeliveryDate))
                .toList();
    }

    private Optional<Notification> buildItemDeliveryRiskNotification(ItemEntity item) {
        if (isBlank(item.getId()) || isBlank(item.getArrangementId())) {
            return Optional.empty();
        }

        return arrangementRepository.findById(item.getArrangementId())
                .filter(arrangement -> arrangement.getDeliveryDate() != null)
                .filter(arrangement -> item.getExpectedEndDate().isAfter(arrangement.getDeliveryDate()))
                .map(arrangement -> toItemDeliveryRiskNotification(item, arrangement));
    }

    private Notification toItemDeliveryRiskNotification(ItemEntity item, ArrangementEntity arrangement) {
        String itemName = isBlank(arrangement.getItemName()) ? "Articolo" : arrangement.getItemName();

        Notification notification = new Notification();
        notification.setId(Notification.TypeEnum.ITEM_DELIVERY_RISK.name() + ":" + item.getId());
        notification.setType(Notification.TypeEnum.ITEM_DELIVERY_RISK);
        notification.setSeverity(Notification.SeverityEnum.WARNING);
        notification.setTitle("Consegna a rischio");
        notification.setMessage(
                "La fine produzione prevista di " + itemName + " supera la data di consegna."
        );
        notification.setItemId(item.getId());
        notification.setArrangementId(item.getArrangementId());
        notification.setExpectedEndDate(toOffsetDateTime(item.getExpectedEndDate()));
        notification.setDeliveryDate(toOffsetDateTime(arrangement.getDeliveryDate()));

        return notification;
    }

    private OffsetDateTime toOffsetDateTime(Instant value) {
        return value == null ? null : OffsetDateTime.ofInstant(value, ZoneOffset.UTC);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
