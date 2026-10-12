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
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.lang.Nullable;

/** Item */
@JsonTypeName("item")
@Generated(
        value = "org.openapitools.codegen.languages.SpringCodegen",
        date = "2026-10-09T11:36:46.062469700+02:00[Europe/Rome]",
        comments = "Generator version: 7.23.0")
public class Item {

    private @Nullable String id;

    private @Nullable String arrangementId;

    /** Gets or Sets state */
    public enum StateEnum {
        INITIALIZED("INITIALIZED"),

        RUNNING("RUNNING"),

        COMPLETED("COMPLETED"),

        ABANDONED("ABANDONED");

        private final String value;

        StateEnum(String value) {
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
        public static StateEnum fromValue(String value) {
            for (StateEnum b : StateEnum.values()) {
                if (b.value.equals(value)) {
                    return b;
                }
            }
            throw new IllegalArgumentException("Unexpected value '" + value + "'");
        }
    }

    private @Nullable StateEnum state;

    private @Nullable String customerId;

    private @Nullable BigDecimal totalMeters;

    private @Nullable BigDecimal metersRun;

    private List<@Valid Process> processing = new ArrayList<>();

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private @Nullable OffsetDateTime expectedEndDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private @Nullable OffsetDateTime endDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private @Nullable OffsetDateTime startDate;

    private Boolean isArchived = false;

    private Boolean isDelivered = false;

    private Boolean isLate = false;

    private @Nullable BigDecimal warpWeight;

    private @Nullable BigDecimal weftWeight;

    /** Tutte, nessuna o alcune pezze certificate. */
    public enum IsCertifiedEnum {
        ALL("ALL"),

        NONE("NONE"),

        PARTIAL("PARTIAL");

        private final String value;

        IsCertifiedEnum(String value) {
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
        public static IsCertifiedEnum fromValue(String value) {
            for (IsCertifiedEnum b : IsCertifiedEnum.values()) {
                if (b.value.equals(value)) {
                    return b;
                }
            }
            throw new IllegalArgumentException("Unexpected value '" + value + "'");
        }
    }

    private @Nullable IsCertifiedEnum isCertified;

    private @Nullable String certificationId;

    private @Nullable BigDecimal totalWeight;

    public Item id(@Nullable String id) {
        this.id = id;
        return this;
    }

    /**
     * Identificativo MongoDB generato dal server
     *
     * @return id
     */
    @Schema(
            name = "id",
            accessMode = Schema.AccessMode.READ_ONLY,
            description = "Identificativo MongoDB generato dal server",
            requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @JsonProperty("id")
    public @Nullable String getId() {
        return id;
    }

    @JsonProperty("id")
    public void setId(@Nullable String id) {
        this.id = id;
    }

    public Item arrangementId(@Nullable String arrangementId) {
        this.arrangementId = arrangementId;
        return this;
    }

    /**
     * Get arrangementId
     *
     * @return arrangementId
     */
    @Schema(name = "arrangementId", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @JsonProperty("arrangementId")
    public @Nullable String getArrangementId() {
        return arrangementId;
    }

    @JsonProperty("arrangementId")
    public void setArrangementId(@Nullable String arrangementId) {
        this.arrangementId = arrangementId;
    }

    public Item state(@Nullable StateEnum state) {
        this.state = state;
        return this;
    }

    /**
     * Get state
     *
     * @return state
     */
    @Schema(name = "state", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @JsonProperty("state")
    public @Nullable StateEnum getState() {
        return state;
    }

    @JsonProperty("state")
    public void setState(@Nullable StateEnum state) {
        this.state = state;
    }

    public Item customerId(@Nullable String customerId) {
        this.customerId = customerId;
        return this;
    }

    /**
     * Get customerId
     *
     * @return customerId
     */
    @Schema(name = "customerId", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @JsonProperty("customerId")
    public @Nullable String getCustomerId() {
        return customerId;
    }

    @JsonProperty("customerId")
    public void setCustomerId(@Nullable String customerId) {
        this.customerId = customerId;
    }

    public Item totalMeters(@Nullable BigDecimal totalMeters) {
        this.totalMeters = totalMeters;
        return this;
    }

    /**
     * Get totalMeters
     *
     * @return totalMeters
     */
    @Valid
    @Schema(name = "totalMeters", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @JsonProperty("totalMeters")
    public @Nullable BigDecimal getTotalMeters() {
        return totalMeters;
    }

    @JsonProperty("totalMeters")
    public void setTotalMeters(@Nullable BigDecimal totalMeters) {
        this.totalMeters = totalMeters;
    }

    public Item metersRun(@Nullable BigDecimal metersRun) {
        this.metersRun = metersRun;
        return this;
    }

    /**
     * Get metersRun
     *
     * @return metersRun
     */
    @Valid
    @Schema(name = "metersRun", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @JsonProperty("metersRun")
    public @Nullable BigDecimal getMetersRun() {
        return metersRun;
    }

    @JsonProperty("metersRun")
    public void setMetersRun(@Nullable BigDecimal metersRun) {
        this.metersRun = metersRun;
    }

    public Item processing(List<@Valid Process> processing) {
        this.processing = processing;
        return this;
    }

    public Item addProcessingItem(Process processingItem) {
        if (this.processing == null) {
            this.processing = new ArrayList<>();
        }
        this.processing.add(processingItem);
        return this;
    }

    /**
     * Get processing
     *
     * @return processing
     */
    @Valid
    @Schema(name = "processing", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @JsonProperty("processing")
    public List<@Valid Process> getProcessing() {
        return processing;
    }

    @JsonProperty("processing")
    public void setProcessing(List<@Valid Process> processing) {
        this.processing = processing;
    }

    public Item expectedEndDate(@Nullable OffsetDateTime expectedEndDate) {
        this.expectedEndDate = expectedEndDate;
        return this;
    }

    /**
     * Get expectedEndDate
     *
     * @return expectedEndDate
     */
    @Valid
    @Schema(name = "expectedEndDate", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @JsonProperty("expectedEndDate")
    public @Nullable OffsetDateTime getExpectedEndDate() {
        return expectedEndDate;
    }

    @JsonProperty("expectedEndDate")
    public void setExpectedEndDate(@Nullable OffsetDateTime expectedEndDate) {
        this.expectedEndDate = expectedEndDate;
    }

    public Item endDate(@Nullable OffsetDateTime endDate) {
        this.endDate = endDate;
        return this;
    }

    /**
     * Get endDate
     *
     * @return endDate
     */
    @Valid
    @Schema(name = "endDate", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @JsonProperty("endDate")
    public @Nullable OffsetDateTime getEndDate() {
        return endDate;
    }

    @JsonProperty("endDate")
    public void setEndDate(@Nullable OffsetDateTime endDate) {
        this.endDate = endDate;
    }

    public Item startDate(@Nullable OffsetDateTime startDate) {
        this.startDate = startDate;
        return this;
    }

    /**
     * Get startDate
     *
     * @return startDate
     */
    @Valid
    @Schema(name = "startDate", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @JsonProperty("startDate")
    public @Nullable OffsetDateTime getStartDate() {
        return startDate;
    }

    @JsonProperty("startDate")
    public void setStartDate(@Nullable OffsetDateTime startDate) {
        this.startDate = startDate;
    }

    public Item isArchived(Boolean isArchived) {
        this.isArchived = isArchived;
        return this;
    }

    /**
     * Get isArchived
     *
     * @return isArchived
     */
    @Schema(name = "isArchived", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @JsonProperty("isArchived")
    public Boolean getIsArchived() {
        return isArchived;
    }

    @JsonProperty("isArchived")
    public void setIsArchived(Boolean isArchived) {
        this.isArchived = isArchived;
    }

    public Item isDelivered(Boolean isDelivered) {
        this.isDelivered = isDelivered;
        return this;
    }

    /**
     * Get isDelivered
     *
     * @return isDelivered
     */
    @Schema(name = "isDelivered", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @JsonProperty("isDelivered")
    public Boolean getIsDelivered() {
        return isDelivered;
    }

    @JsonProperty("isDelivered")
    public void setIsDelivered(Boolean isDelivered) {
        this.isDelivered = isDelivered;
    }

    public Item isLate(Boolean isLate) {
        this.isLate = isLate;
        return this;
    }

    /**
     * Get isLate
     *
     * @return isLate
     */
    @Schema(name = "isLate", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @JsonProperty("isLate")
    public Boolean getIsLate() {
        return isLate;
    }

    @JsonProperty("isLate")
    public void setIsLate(Boolean isLate) {
        this.isLate = isLate;
    }

    public Item warpWeight(@Nullable BigDecimal warpWeight) {
        this.warpWeight = warpWeight;
        return this;
    }

    /**
     * Peso di ordito dell'intero articolo in kg. minimum: 0
     *
     * @return warpWeight
     */
    @Valid
    @DecimalMin(value = "0")
    @Schema(
            name = "warpWeight",
            description = "Peso di ordito dell'intero articolo in kg.",
            requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @JsonProperty("warpWeight")
    public @Nullable BigDecimal getWarpWeight() {
        return warpWeight;
    }

    @JsonProperty("warpWeight")
    public void setWarpWeight(@Nullable BigDecimal warpWeight) {
        this.warpWeight = warpWeight;
    }

    public Item weftWeight(@Nullable BigDecimal weftWeight) {
        this.weftWeight = weftWeight;
        return this;
    }

    /**
     * Peso di trama dell'intero articolo in kg. minimum: 0
     *
     * @return weftWeight
     */
    @Valid
    @DecimalMin(value = "0")
    @Schema(
            name = "weftWeight",
            description = "Peso di trama dell'intero articolo in kg.",
            requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @JsonProperty("weftWeight")
    public @Nullable BigDecimal getWeftWeight() {
        return weftWeight;
    }

    @JsonProperty("weftWeight")
    public void setWeftWeight(@Nullable BigDecimal weftWeight) {
        this.weftWeight = weftWeight;
    }

    public Item isCertified(@Nullable IsCertifiedEnum isCertified) {
        this.isCertified = isCertified;
        return this;
    }

    /**
     * Tutte, nessuna o alcune pezze certificate.
     *
     * @return isCertified
     */
    @Schema(
            name = "isCertified",
            description = "Tutte, nessuna o alcune pezze certificate.",
            requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @JsonProperty("isCertified")
    public @Nullable IsCertifiedEnum getIsCertified() {
        return isCertified;
    }

    @JsonProperty("isCertified")
    public void setIsCertified(@Nullable IsCertifiedEnum isCertified) {
        this.isCertified = isCertified;
    }

    public Item certificationId(@Nullable String certificationId) {
        this.certificationId = certificationId;
        return this;
    }

    /**
     * Identificativo della Certification selezionata.
     *
     * @return certificationId
     */
    @Schema(
            name = "certificationId",
            description = "Identificativo della Certification selezionata.",
            requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @JsonProperty("certificationId")
    public @Nullable String getCertificationId() {
        return certificationId;
    }

    @JsonProperty("certificationId")
    public void setCertificationId(@Nullable String certificationId) {
        this.certificationId = certificationId;
    }

    public Item totalWeight(@Nullable BigDecimal totalWeight) {
        this.totalWeight = totalWeight;
        return this;
    }

    /**
     * Somma del peso di ordito e trama in kg; assente se uno dei pesi non è specificato.
     *
     * @return totalWeight
     */
    @Valid
    @Schema(
            name = "totalWeight",
            accessMode = Schema.AccessMode.READ_ONLY,
            description =
                    "Somma del peso di ordito e trama in kg; assente se uno dei pesi non è specificato.",
            requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @JsonProperty("totalWeight")
    public @Nullable BigDecimal getTotalWeight() {
        return totalWeight;
    }

    @JsonProperty("totalWeight")
    public void setTotalWeight(@Nullable BigDecimal totalWeight) {
        this.totalWeight = totalWeight;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        Item item = (Item) o;
        return Objects.equals(this.id, item.id)
                && Objects.equals(this.arrangementId, item.arrangementId)
                && Objects.equals(this.state, item.state)
                && Objects.equals(this.customerId, item.customerId)
                && Objects.equals(this.totalMeters, item.totalMeters)
                && Objects.equals(this.metersRun, item.metersRun)
                && Objects.equals(this.processing, item.processing)
                && Objects.equals(this.expectedEndDate, item.expectedEndDate)
                && Objects.equals(this.endDate, item.endDate)
                && Objects.equals(this.startDate, item.startDate)
                && Objects.equals(this.isArchived, item.isArchived)
                && Objects.equals(this.isDelivered, item.isDelivered)
                && Objects.equals(this.isLate, item.isLate)
                && Objects.equals(this.warpWeight, item.warpWeight)
                && Objects.equals(this.weftWeight, item.weftWeight)
                && Objects.equals(this.isCertified, item.isCertified)
                && Objects.equals(this.certificationId, item.certificationId)
                && Objects.equals(this.totalWeight, item.totalWeight);
    }

    @Override
    public int hashCode() {
        return Objects.hash(
                id,
                arrangementId,
                state,
                customerId,
                totalMeters,
                metersRun,
                processing,
                expectedEndDate,
                endDate,
                startDate,
                isArchived,
                isDelivered,
                isLate,
                warpWeight,
                weftWeight,
                isCertified,
                certificationId,
                totalWeight);
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("class Item {\n");
        sb.append("    id: ").append(toIndentedString(id)).append("\n");
        sb.append("    arrangementId: ").append(toIndentedString(arrangementId)).append("\n");
        sb.append("    state: ").append(toIndentedString(state)).append("\n");
        sb.append("    customerId: ").append(toIndentedString(customerId)).append("\n");
        sb.append("    totalMeters: ").append(toIndentedString(totalMeters)).append("\n");
        sb.append("    metersRun: ").append(toIndentedString(metersRun)).append("\n");
        sb.append("    processing: ").append(toIndentedString(processing)).append("\n");
        sb.append("    expectedEndDate: ").append(toIndentedString(expectedEndDate)).append("\n");
        sb.append("    endDate: ").append(toIndentedString(endDate)).append("\n");
        sb.append("    startDate: ").append(toIndentedString(startDate)).append("\n");
        sb.append("    isArchived: ").append(toIndentedString(isArchived)).append("\n");
        sb.append("    isDelivered: ").append(toIndentedString(isDelivered)).append("\n");
        sb.append("    isLate: ").append(toIndentedString(isLate)).append("\n");
        sb.append("    warpWeight: ").append(toIndentedString(warpWeight)).append("\n");
        sb.append("    weftWeight: ").append(toIndentedString(weftWeight)).append("\n");
        sb.append("    isCertified: ").append(toIndentedString(isCertified)).append("\n");
        sb.append("    certificationId: ").append(toIndentedString(certificationId)).append("\n");
        sb.append("    totalWeight: ").append(toIndentedString(totalWeight)).append("\n");
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
