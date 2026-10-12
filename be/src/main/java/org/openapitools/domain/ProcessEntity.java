package org.openapitools.domain;

import java.time.Instant;
import org.openapitools.model.Loom;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "processes")
public class ProcessEntity {
    @Id private String id;

    private Double speed;
    private Double efficiency;
    private Double totalMeters;
    private Double metersRun;
    private Double metersToGo;
    private Instant startDate;
    private Instant endDate;
    private Instant expectedEndDate;
    private Float days;
    private Loom loom;
    private Double itemHitsPerDm;
    private Integer totalPieces;
    private Integer piecesRun;
    private Double metersPerPiece;
    private Boolean grs;
    private Boolean gots;
    private String notes;

    @Indexed(unique = true, sparse = true)
    private String fabricCode;

    public String getFabricCode() {
        return fabricCode;
    }

    public void setFabricCode(String fabricCode) {
        this.fabricCode = fabricCode;
    }

    // getter & setter
    public Double getMetersPerPiece() {
        return metersPerPiece;
    }

    public void setMetersPerPiece(Double metersPerPiece) {
        this.metersPerPiece = metersPerPiece;
    }

    public Integer getTotalPieces() {
        return totalPieces;
    }

    public void setTotalPieces(Integer totalPieces) {
        this.totalPieces = totalPieces;
    }

    public Integer getPiecesRun() {
        return piecesRun;
    }

    public void setPiecesRun(Integer piecesRun) {
        this.piecesRun = piecesRun;
    }

    public Double getItemHitsPerDm() {
        return itemHitsPerDm;
    }

    public void setItemHitsPerDm(Double itemHitsPerDm) {
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

    public Double getSpeed() {
        return speed;
    }

    public void setSpeed(Double speed) {
        this.speed = speed;
    }

    public Double getEfficiency() {
        return efficiency;
    }

    public void setEfficiency(Double efficiency) {
        this.efficiency = efficiency;
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

    public Double getMetersToGo() {
        return metersToGo;
    }

    public void setMetersToGo(Double metersToGo) {
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

    public Boolean getGrs() {
        return grs;
    }

    public void setGrs(Boolean grs) {
        this.grs = grs;
    }

    public Boolean getGots() {
        return gots;
    }

    public void setGots(Boolean gots) {
        this.gots = gots;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
