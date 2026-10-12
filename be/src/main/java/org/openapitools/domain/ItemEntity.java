package org.openapitools.domain;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.openapitools.model.Item;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "items")
public class ItemEntity {

    @Id private String id;

    private String arrangementId;
    private Item.StateEnum state;
    private String customerId;
    private Double totalMeters;
    private Double metersRun;
    private List<ProcessEntity> processing = new ArrayList<>();
    private Instant expectedEndDate;
    private Instant endDate;
    private Instant startDate;
    private Boolean isArchived;
    private Boolean isDelivered;
    private Boolean isLate;
    private java.math.BigDecimal warpWeight;
    private java.math.BigDecimal weftWeight;
    private Item.IsCertifiedEnum isCertified;
    private String certificationId;

    // getter & setter
    public Boolean getLate() {
        return isLate;
    }

    public void setLate(Boolean late) {
        isLate = late;
    }

    public Boolean getDelivered() {
        return isDelivered;
    }

    public void setDelivered(Boolean delivered) {
        isDelivered = delivered;
    }

    public Boolean getArchived() {
        return isArchived;
    }

    public void setArchived(Boolean archived) {
        isArchived = archived;
    }

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

    public Double getTotalMeters() {
        return totalMeters;
    }

    public void setTotalMeters(Double totalMeters) {
        this.totalMeters = totalMeters;
    }

    public Double getMetersRun() {
        return metersRun;
    }

    public void setMetersRun(Double metersRun) {
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

    public java.math.BigDecimal getWarpWeight() {
        return warpWeight;
    }

    public void setWarpWeight(java.math.BigDecimal value) {
        this.warpWeight = value;
    }

    public java.math.BigDecimal getWeftWeight() {
        return weftWeight;
    }

    public void setWeftWeight(java.math.BigDecimal value) {
        this.weftWeight = value;
    }

    public Item.IsCertifiedEnum getIsCertified() {
        return isCertified;
    }

    public void setIsCertified(Item.IsCertifiedEnum value) {
        this.isCertified = value;
    }

    public String getCertificationId() {
        return certificationId;
    }

    public void setCertificationId(String value) {
        this.certificationId = value;
    }

    public java.math.BigDecimal getTotalWeight() {
        return warpWeight == null || weftWeight == null ? null : warpWeight.add(weftWeight);
    }
}
