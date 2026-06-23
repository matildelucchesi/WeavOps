package org.openapitools.domain;

import org.openapitools.model.Item;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "items")
public class ItemEntity {

    @Id
    private String id;

    private String arrangementId;
    private Item.StateEnum state;
    private String customerId;
    private Integer totalMeters;
    private Integer metersRun;
    private List<ProcessEntity> processing = new ArrayList<>();
    private OffsetDateTime expectedEndDate;
    private OffsetDateTime endDate;
    private OffsetDateTime startDate;

    //getter & setter

    public String getArrangementId() {
        return arrangementId;
    }

    public void setArrangementId(String arrangementId) {
        this.arrangementId = arrangementId;
    }

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Item.StateEnum getState() {
        return state;
    }

    public void setState(Item.StateEnum state) {
        this.state = state;
    }

    public Integer getTotalMeters() {
        return totalMeters;
    }

    public void setTotalMeters(Integer totalMeters) {
        this.totalMeters = totalMeters;
    }

    public Integer getMetersRun() {
        return metersRun;
    }

    public void setMetersRun(Integer metersRun) {
        this.metersRun = metersRun;
    }

    public List<ProcessEntity> getProcessing() {
        return processing;
    }

    public void setProcessing(List<ProcessEntity> processing) {
        this.processing = processing;
    }

    public OffsetDateTime getExpectedEndDate() {
        return expectedEndDate;
    }

    public void setExpectedEndDate(OffsetDateTime expectedEndDate) {
        this.expectedEndDate = expectedEndDate;
    }

    public OffsetDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(OffsetDateTime startDate) {
        this.startDate = startDate;
    }

    public OffsetDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(OffsetDateTime endDate) {
        this.endDate = endDate;
    }
}
