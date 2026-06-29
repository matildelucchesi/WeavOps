package org.openapitools.domain;

import org.openapitools.model.Loom;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;

@Document(collection = "processes")
public class ProcessEntity {
    @Id
    private String id;

    private Integer speed;
    private Integer efficiency;
    private Integer totalMeters;
    private Integer metersRun;
    private Integer metersToGo;
    private Instant startDate;
    private Instant endDate;
    private Instant expectedEndDate;
    private Float days;
    private Loom loom;
    private Integer itemHitsPerDm;

    //getter & setter
    public Integer getItemHitsPerDm() {
        return itemHitsPerDm;
    }

    public void setItemHitsPerDm(Integer itemHitsPerDm) {
        this.itemHitsPerDm = itemHitsPerDm;
    }

    public Float getDays() {
        return days;
    }

    public void setDays(Float days) {
        this.days = days;
    }

    public Loom getLoom() {
        return loom;
    }

    public void setLoom(Loom loom) {
        this.loom = loom;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Integer getSpeed() {
        return speed;
    }

    public void setSpeed(Integer speed) {
        this.speed = speed;
    }

    public Integer getEfficiency() {
        return efficiency;
    }

    public void setEfficiency(Integer efficiency) {
        this.efficiency = efficiency;
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

    public Integer getMetersToGo() {
        return metersToGo;
    }

    public void setMetersToGo(Integer metersToGo) {
        this.metersToGo = metersToGo;
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

    public Instant getExpectedEndDate() {
        return expectedEndDate;
    }

    public void setExpectedEndDate(Instant expectedEndDate) {
        this.expectedEndDate = expectedEndDate;
    }

}
