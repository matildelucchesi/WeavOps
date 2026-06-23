package org.openapitools.domain;

import org.openapitools.model.Item;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
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
    private Instant expectedEndDate;
    private Instant endDate;
    private Instant startDate;
    private Boolean isArchived;

    //getter & setter


    public Boolean getIsArchived() {
        return isArchived;
    }

    public void setIsArchived(Boolean archived) {
        isArchived = archived;
    }

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

    public Instant getExpectedEndDate() {
        return expectedEndDate;
    }

    public void setExpectedEndDate(Instant expectedEndDate) {
        this.expectedEndDate = expectedEndDate;
    }

    public Instant getStartDate() {
        return startDate;
    }

    public void setStartDate(Instant startDate) {
        this.startDate = startDate;
    }

    public Instant getEndDate() {
        return endDate;
    }

    public void setEndDate(Instant endDate) {
        this.endDate = endDate;
    }
}
