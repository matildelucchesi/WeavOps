package org.openapitools.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;

@Document(collection = "arrangements")
public class ArrangementEntity {

    @Id
    private String id;

    private String itemName;
    private BigDecimal reedCount;
    private BigDecimal reedCM;
    private Float reedHight;
    private Float warpLenght;
    private Float piecesCount;
    private Float pieceLenght;
    private Float warpEndCount;
    private BigDecimal hitsPerDm;
    private Instant deliveryDate;
    private Boolean worksSaturday;
    private String saturdayStartTime;
    private String saturdayEndTime;
    private Boolean worksSunday;
    private String sundayStartTime;
    private String sundayEndTime;

    //getter & setter

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public BigDecimal getReedCount() {
        return reedCount;
    }

    public void setReedCount(BigDecimal reedCount) {
        this.reedCount = reedCount;
    }

    public BigDecimal getReedCM() {
        return reedCM;
    }

    public void setReedCM(BigDecimal reedCM) {
        this.reedCM = reedCM;
    }

    public Float getReedHight() {
        return reedHight;
    }

    public void setReedHight(Float reedHight) {
        this.reedHight = reedHight;
    }

    public Float getWarpLenght() {
        return warpLenght;
    }

    public void setWarpLenght(Float warpLenght) {
        this.warpLenght = warpLenght;
    }

    public Float getPiecesCount() {
        return piecesCount;
    }

    public void setPiecesCount(Float piecesCount) {
        this.piecesCount = piecesCount;
    }

    public Float getPieceLenght() {
        return pieceLenght;
    }

    public void setPieceLenght(Float pieceLenght) {
        this.pieceLenght = pieceLenght;
    }

    public Float getWarpEndCount() {
        return warpEndCount;
    }

    public void setWarpEndCount(Float warpEndCount) {
        this.warpEndCount = warpEndCount;
    }

    public BigDecimal getHitsPerDm() {
        return hitsPerDm;
    }

    public void setHitsPerDm(BigDecimal hitsPerDm) {
        this.hitsPerDm = hitsPerDm;
    }

    public Instant getDeliveryDate() {
        return deliveryDate;
    }

    public void setDeliveryDate(Instant deliveryDate) {
        this.deliveryDate = deliveryDate;
    }
    public Boolean getWorksSaturday() { return worksSaturday; }
    public void setWorksSaturday(Boolean worksSaturday) { this.worksSaturday = worksSaturday; }
    public String getSaturdayStartTime() { return saturdayStartTime; }
    public void setSaturdayStartTime(String saturdayStartTime) { this.saturdayStartTime = saturdayStartTime; }
    public String getSaturdayEndTime() { return saturdayEndTime; }
    public void setSaturdayEndTime(String saturdayEndTime) { this.saturdayEndTime = saturdayEndTime; }
    public Boolean getWorksSunday() { return worksSunday; }
    public void setWorksSunday(Boolean worksSunday) { this.worksSunday = worksSunday; }
    public String getSundayStartTime() { return sundayStartTime; }
    public void setSundayStartTime(String sundayStartTime) { this.sundayStartTime = sundayStartTime; }
    public String getSundayEndTime() { return sundayEndTime; }
    public void setSundayEndTime(String sundayEndTime) { this.sundayEndTime = sundayEndTime; }
}
