package org.openapitools.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.OffsetDateTime;

@Document(collection = "processes")
public class ProcessEntity {
    @Id
    private String id;

    private Integer speed;
    private Integer efficiency;
    private Integer totalMeters;
    private Integer metersRun;
    private Integer metersToGo;
    private OffsetDateTime startDate;
    private OffsetDateTime endDate;
    private OffsetDateTime expectedEndDate;
    private String loomId;

    //getter & setter

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

    public OffsetDateTime getExpectedEndDate() {
        return expectedEndDate;
    }

    public void setExpectedEndDate(OffsetDateTime expectedEndDate) {
        this.expectedEndDate = expectedEndDate;
    }

    public String getLoomId() {
        return loomId;
    }

    public void setLoomId(String loomId) {
        this.loomId = loomId;
    }
}
