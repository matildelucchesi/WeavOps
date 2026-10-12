package org.openapitools.domain;

import java.math.BigDecimal;
import java.time.Instant;
import org.openapitools.model.Fabric;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "fabrics")
public class FabricEntity {
    @Id private String id;

    @Indexed(unique = true)
    private String code;

    private String itemId;

    @Indexed(unique = true)
    private String processId;

    private String certificationId;
    private String certificationValue;
    private Integer piecesCount;
    private BigDecimal metersPerPiece;
    private BigDecimal weightPerPiece;
    private Instant producedAt;
    private Fabric.StatusEnum status;

    public String getId() {
        return id;
    }

    public void setId(String value) {
        this.id = value;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String value) {
        this.code = value;
    }

    public String getItemId() {
        return itemId;
    }

    public void setItemId(String value) {
        this.itemId = value;
    }

    public String getProcessId() {
        return processId;
    }

    public void setProcessId(String value) {
        this.processId = value;
    }

    public String getCertificationId() {
        return certificationId;
    }

    public void setCertificationId(String value) {
        this.certificationId = value;
    }

    public String getCertificationValue() {
        return certificationValue;
    }

    public void setCertificationValue(String value) {
        this.certificationValue = value;
    }

    public Integer getPiecesCount() {
        return piecesCount;
    }

    public void setPiecesCount(Integer value) {
        this.piecesCount = value;
    }

    public BigDecimal getMetersPerPiece() {
        return metersPerPiece;
    }

    public void setMetersPerPiece(BigDecimal value) {
        this.metersPerPiece = value;
    }

    public BigDecimal getWeightPerPiece() {
        return weightPerPiece;
    }

    public void setWeightPerPiece(BigDecimal value) {
        this.weightPerPiece = value;
    }

    public Instant getProducedAt() {
        return producedAt;
    }

    public void setProducedAt(Instant value) {
        this.producedAt = value;
    }

    public Fabric.StatusEnum getStatus() {
        return status;
    }

    public void setStatus(Fabric.StatusEnum value) {
        this.status = value;
    }

    public BigDecimal getTotalMeters() {
        return metersPerPiece.multiply(BigDecimal.valueOf(piecesCount));
    }

    public BigDecimal getTotalWeight() {
        return weightPerPiece.multiply(BigDecimal.valueOf(piecesCount));
    }
}
