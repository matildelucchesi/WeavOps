package org.openapitools.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "loom-log")
public class LoomLogEntity {
    @Id
    private String id;

    private String key;
    private String loomId;
    private String loomCode;
    private String loomStatus;
    private String itemId;
    private String itemName;
    private Double metersAdded;
    private Instant createdAt;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getLoomId() {
        return loomId;
    }

    public void setLoomId(String loomId) {
        this.loomId = loomId;
    }

    public String getLoomCode() {
        return loomCode;
    }

    public void setLoomCode(String loomCode) {
        this.loomCode = loomCode;
    }

    public String getLoomStatus() {
        return loomStatus;
    }

    public void setLoomStatus(String loomStatus) {
        this.loomStatus = loomStatus;
    }

    public String getItemId() {
        return itemId;
    }

    public void setItemId(String itemId) {
        this.itemId = itemId;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public Double getMetersAdded() {
        return metersAdded;
    }

    public void setMetersAdded(Double metersAdded) {
        this.metersAdded = metersAdded;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
