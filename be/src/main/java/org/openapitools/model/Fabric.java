package org.openapitools.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;
import com.fasterxml.jackson.annotation.JsonValue;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.annotation.Generated;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.Objects;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.lang.Nullable;

/** Tela prodotta alla chiusura di un processo con almeno una pezza prodotta. */
@Schema(
        name = "fabric",
        description = "Tela prodotta alla chiusura di un processo con almeno una pezza prodotta.")
@JsonTypeName("fabric")
@Generated(
        value = "org.openapitools.codegen.languages.SpringCodegen",
        date = "2026-10-09T12:24:27.357884+02:00[Europe/Rome]",
        comments = "Generator version: 7.23.0")
public class Fabric {

    private @Nullable String id;

    private @Nullable String code;

    private @Nullable String itemId;

    private @Nullable String processId;

    private @Nullable String certificationId;

    private @Nullable String certificationValue;

    private @Nullable Integer piecesCount;

    private @Nullable BigDecimal metersPerPiece;

    private @Nullable BigDecimal weightPerPiece;

    private @Nullable BigDecimal totalMeters;

    private @Nullable BigDecimal totalWeight;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private @Nullable OffsetDateTime producedAt;

    /** Gets or Sets status */
    public enum StatusEnum {
        AVAILABLE("AVAILABLE"),

        RESERVED("RESERVED"),

        DELIVERED("DELIVERED");

        private final String value;

        StatusEnum(String value) {
            this.value = value;
        }

        @JsonValue
        public String getValue() {
            return value;
        }

        @Override
        public String toString() {
            return String.valueOf(value);
        }

        @JsonCreator
        public static StatusEnum fromValue(String value) {
            for (StatusEnum b : StatusEnum.values()) {
                if (b.value.equals(value)) {
                    return b;
                }
            }
            throw new IllegalArgumentException("Unexpected value '" + value + "'");
        }
    }

    private @Nullable StatusEnum status;

    public Fabric id(@Nullable String id) {
        this.id = id;
        return this;
    }

    /**
     * Get id
     *
     * @return id
     */
    @Schema(
            name = "id",
            accessMode = Schema.AccessMode.READ_ONLY,
            requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @JsonProperty("id")
    public @Nullable String getId() {
        return id;
    }

    @JsonProperty("id")
    public void setId(@Nullable String id) {
        this.id = id;
    }

    public Fabric code(@Nullable String code) {
        this.code = code;
        return this;
    }

    /**
     * Codice univoco inserito manualmente alla chiusura.
     *
     * @return code
     */
    @Schema(
            name = "code",
            description = "Codice univoco inserito manualmente alla chiusura.",
            requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @JsonProperty("code")
    public @Nullable String getCode() {
        return code;
    }

    @JsonProperty("code")
    public void setCode(@Nullable String code) {
        this.code = code;
    }

    public Fabric itemId(@Nullable String itemId) {
        this.itemId = itemId;
        return this;
    }

    /**
     * Get itemId
     *
     * @return itemId
     */
    @Schema(name = "itemId", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @JsonProperty("itemId")
    public @Nullable String getItemId() {
        return itemId;
    }

    @JsonProperty("itemId")
    public void setItemId(@Nullable String itemId) {
        this.itemId = itemId;
    }

    public Fabric processId(@Nullable String processId) {
        this.processId = processId;
        return this;
    }

    /**
     * Processo di origine; una sola Tela per processo.
     *
     * @return processId
     */
    @Schema(
            name = "processId",
            description = "Processo di origine; una sola Tela per processo.",
            requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @JsonProperty("processId")
    public @Nullable String getProcessId() {
        return processId;
    }

    @JsonProperty("processId")
    public void setProcessId(@Nullable String processId) {
        this.processId = processId;
    }

    public Fabric certificationId(@Nullable String certificationId) {
        this.certificationId = certificationId;
        return this;
    }

    /**
     * Get certificationId
     *
     * @return certificationId
     */
    @Schema(name = "certificationId", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @JsonProperty("certificationId")
    public @Nullable String getCertificationId() {
        return certificationId;
    }

    @JsonProperty("certificationId")
    public void setCertificationId(@Nullable String certificationId) {
        this.certificationId = certificationId;
    }

    public Fabric certificationValue(@Nullable String certificationValue) {
        this.certificationValue = certificationValue;
        return this;
    }

    /**
     * Sigla della certificazione al momento della produzione.
     *
     * @return certificationValue
     */
    @Schema(
            name = "certificationValue",
            description = "Sigla della certificazione al momento della produzione.",
            requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @JsonProperty("certificationValue")
    public @Nullable String getCertificationValue() {
        return certificationValue;
    }

    @JsonProperty("certificationValue")
    public void setCertificationValue(@Nullable String certificationValue) {
        this.certificationValue = certificationValue;
    }

    public Fabric piecesCount(@Nullable Integer piecesCount) {
        this.piecesCount = piecesCount;
        return this;
    }

    /**
     * Get piecesCount minimum: 1
     *
     * @return piecesCount
     */
    @Min(value = 1)
    @Schema(name = "piecesCount", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @JsonProperty("piecesCount")
    public @Nullable Integer getPiecesCount() {
        return piecesCount;
    }

    @JsonProperty("piecesCount")
    public void setPiecesCount(@Nullable Integer piecesCount) {
        this.piecesCount = piecesCount;
    }

    public Fabric metersPerPiece(@Nullable BigDecimal metersPerPiece) {
        this.metersPerPiece = metersPerPiece;
        return this;
    }

    /**
     * Metri per pezza dalla disposizione al momento della chiusura.
     *
     * @return metersPerPiece
     */
    @Valid
    @Schema(
            name = "metersPerPiece",
            description = "Metri per pezza dalla disposizione al momento della chiusura.",
            requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @JsonProperty("metersPerPiece")
    public @Nullable BigDecimal getMetersPerPiece() {
        return metersPerPiece;
    }

    @JsonProperty("metersPerPiece")
    public void setMetersPerPiece(@Nullable BigDecimal metersPerPiece) {
        this.metersPerPiece = metersPerPiece;
    }

    public Fabric weightPerPiece(@Nullable BigDecimal weightPerPiece) {
        this.weightPerPiece = weightPerPiece;
        return this;
    }

    /**
     * Kg per pezza = peso totale articolo / pezze previste nella disposizione.
     *
     * @return weightPerPiece
     */
    @Valid
    @Schema(
            name = "weightPerPiece",
            description =
                    "Kg per pezza = peso totale articolo / pezze previste nella disposizione.",
            requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @JsonProperty("weightPerPiece")
    public @Nullable BigDecimal getWeightPerPiece() {
        return weightPerPiece;
    }

    @JsonProperty("weightPerPiece")
    public void setWeightPerPiece(@Nullable BigDecimal weightPerPiece) {
        this.weightPerPiece = weightPerPiece;
    }

    public Fabric totalMeters(@Nullable BigDecimal totalMeters) {
        this.totalMeters = totalMeters;
        return this;
    }

    /**
     * Numero pezze prodotte moltiplicato per metri per pezza.
     *
     * @return totalMeters
     */
    @Valid
    @Schema(
            name = "totalMeters",
            accessMode = Schema.AccessMode.READ_ONLY,
            description = "Numero pezze prodotte moltiplicato per metri per pezza.",
            requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @JsonProperty("totalMeters")
    public @Nullable BigDecimal getTotalMeters() {
        return totalMeters;
    }

    @JsonProperty("totalMeters")
    public void setTotalMeters(@Nullable BigDecimal totalMeters) {
        this.totalMeters = totalMeters;
    }

    public Fabric totalWeight(@Nullable BigDecimal totalWeight) {
        this.totalWeight = totalWeight;
        return this;
    }

    /**
     * Numero pezze prodotte moltiplicato per kg per pezza.
     *
     * @return totalWeight
     */
    @Valid
    @Schema(
            name = "totalWeight",
            accessMode = Schema.AccessMode.READ_ONLY,
            description = "Numero pezze prodotte moltiplicato per kg per pezza.",
            requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @JsonProperty("totalWeight")
    public @Nullable BigDecimal getTotalWeight() {
        return totalWeight;
    }

    @JsonProperty("totalWeight")
    public void setTotalWeight(@Nullable BigDecimal totalWeight) {
        this.totalWeight = totalWeight;
    }

    public Fabric producedAt(@Nullable OffsetDateTime producedAt) {
        this.producedAt = producedAt;
        return this;
    }

    /**
     * Get producedAt
     *
     * @return producedAt
     */
    @Valid
    @Schema(name = "producedAt", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @JsonProperty("producedAt")
    public @Nullable OffsetDateTime getProducedAt() {
        return producedAt;
    }

    @JsonProperty("producedAt")
    public void setProducedAt(@Nullable OffsetDateTime producedAt) {
        this.producedAt = producedAt;
    }

    public Fabric status(@Nullable StatusEnum status) {
        this.status = status;
        return this;
    }

    /**
     * Get status
     *
     * @return status
     */
    @Schema(name = "status", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @JsonProperty("status")
    public @Nullable StatusEnum getStatus() {
        return status;
    }

    @JsonProperty("status")
    public void setStatus(@Nullable StatusEnum status) {
        this.status = status;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        Fabric fabric = (Fabric) o;
        return Objects.equals(this.id, fabric.id)
                && Objects.equals(this.code, fabric.code)
                && Objects.equals(this.itemId, fabric.itemId)
                && Objects.equals(this.processId, fabric.processId)
                && Objects.equals(this.certificationId, fabric.certificationId)
                && Objects.equals(this.certificationValue, fabric.certificationValue)
                && Objects.equals(this.piecesCount, fabric.piecesCount)
                && Objects.equals(this.metersPerPiece, fabric.metersPerPiece)
                && Objects.equals(this.weightPerPiece, fabric.weightPerPiece)
                && Objects.equals(this.totalMeters, fabric.totalMeters)
                && Objects.equals(this.totalWeight, fabric.totalWeight)
                && Objects.equals(this.producedAt, fabric.producedAt)
                && Objects.equals(this.status, fabric.status);
    }

    @Override
    public int hashCode() {
        return Objects.hash(
                id,
                code,
                itemId,
                processId,
                certificationId,
                certificationValue,
                piecesCount,
                metersPerPiece,
                weightPerPiece,
                totalMeters,
                totalWeight,
                producedAt,
                status);
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("class Fabric {\n");
        sb.append("    id: ").append(toIndentedString(id)).append("\n");
        sb.append("    code: ").append(toIndentedString(code)).append("\n");
        sb.append("    itemId: ").append(toIndentedString(itemId)).append("\n");
        sb.append("    processId: ").append(toIndentedString(processId)).append("\n");
        sb.append("    certificationId: ").append(toIndentedString(certificationId)).append("\n");
        sb.append("    certificationValue: ")
                .append(toIndentedString(certificationValue))
                .append("\n");
        sb.append("    piecesCount: ").append(toIndentedString(piecesCount)).append("\n");
        sb.append("    metersPerPiece: ").append(toIndentedString(metersPerPiece)).append("\n");
        sb.append("    weightPerPiece: ").append(toIndentedString(weightPerPiece)).append("\n");
        sb.append("    totalMeters: ").append(toIndentedString(totalMeters)).append("\n");
        sb.append("    totalWeight: ").append(toIndentedString(totalWeight)).append("\n");
        sb.append("    producedAt: ").append(toIndentedString(producedAt)).append("\n");
        sb.append("    status: ").append(toIndentedString(status)).append("\n");
        sb.append("}");
        return sb.toString();
    }

    /**
     * Convert the given object to string with each line indented by 4 spaces (except the first
     * line).
     */
    private String toIndentedString(@Nullable Object o) {
        return o == null ? "null" : o.toString().replace("\n", "\n    ");
    }
}
