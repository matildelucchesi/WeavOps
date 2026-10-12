package org.openapitools.controller;

import java.util.List;
import org.openapitools.api.NotificationsApi;
import org.openapitools.model.Notification;
import org.openapitools.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class NotificationController implements NotificationsApi {
    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Override
    public ResponseEntity<List<Notification>> getNotifications() {
        return ResponseEntity.ok(notificationService.findAll());
    }

    @Override
    public ResponseEntity<List<Notification>> getItemDeliveryRiskNotifications() {
        return ResponseEntity.ok(notificationService.findItemDeliveryRiskNotifications());
    }
}
