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
import java.util.*;
import java.util.Objects;
import org.springframework.lang.Nullable;

/** CreateItemWithArrangementRequest */
@JsonTypeName("create-item-with-arrangement-request")
@Generated(
        value = "org.openapitools.codegen.languages.SpringCodegen",
        date = "2026-10-09T11:36:46.062469700+02:00[Europe/Rome]",
        comments = "Generator version: 7.23.0")
public class CreateItemWithArrangementRequest {

    private String customerName;

    private Arrangement arrangement;

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

    public CreateItemWithArrangementRequest() {
        super();
    }

    /** Constructor with only required parameters */
    public CreateItemWithArrangementRequest(String customerName, Arrangement arrangement) {
        this.customerName = customerName;
        this.arrangement = arrangement;
    }

    public CreateItemWithArrangementRequest customerName(String customerName) {
        this.customerName = customerName;
        return this;
    }

    /**
     * Nome esatto del customer da associare all'item.
     *
     * @return customerName
     */
    @NotNull
    @Size(min = 1)
    @Schema(
            name = "customerName",
            description = "Nome esatto del customer da associare all'item.",
            requiredMode = Schema.RequiredMode.REQUIRED)
    @JsonProperty("customerName")
    public String getCustomerName() {
        return customerName;
    }

    @JsonProperty("customerName")
    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public CreateItemWithArrangementRequest arrangement(Arrangement arrangement) {
        this.arrangement = arrangement;
        return this;
    }

    /**
     * Get arrangement
     *
     * @return arrangement
     */
    @NotNull
    @Valid
    @Schema(name = "arrangement", requiredMode = Schema.RequiredMode.REQUIRED)
    @JsonProperty("arrangement")
    public Arrangement getArrangement() {
        return arrangement;
    }

    @JsonProperty("arrangement")
    public void setArrangement(Arrangement arrangement) {
        this.arrangement = arrangement;
    }

    public CreateItemWithArrangementRequest warpWeight(@Nullable BigDecimal warpWeight) {
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

    public CreateItemWithArrangementRequest weftWeight(@Nullable BigDecimal weftWeight) {
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

    public CreateItemWithArrangementRequest isCertified(@Nullable IsCertifiedEnum isCertified) {
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

    public CreateItemWithArrangementRequest certificationId(@Nullable String certificationId) {
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

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        CreateItemWithArrangementRequest createItemWithArrangementRequest =
                (CreateItemWithArrangementRequest) o;
        return Objects.equals(this.customerName, createItemWithArrangementRequest.customerName)
                && Objects.equals(this.arrangement, createItemWithArrangementRequest.arrangement)
                && Objects.equals(this.warpWeight, createItemWithArrangementRequest.warpWeight)
                && Objects.equals(this.weftWeight, createItemWithArrangementRequest.weftWeight)
                && Objects.equals(this.isCertified, createItemWithArrangementRequest.isCertified)
                && Objects.equals(
                        this.certificationId, createItemWithArrangementRequest.certificationId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(
                customerName, arrangement, warpWeight, weftWeight, isCertified, certificationId);
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("class CreateItemWithArrangementRequest {\n");
        sb.append("    customerName: ").append(toIndentedString(customerName)).append("\n");
        sb.append("    arrangement: ").append(toIndentedString(arrangement)).append("\n");
        sb.append("    warpWeight: ").append(toIndentedString(warpWeight)).append("\n");
        sb.append("    weftWeight: ").append(toIndentedString(weftWeight)).append("\n");
        sb.append("    isCertified: ").append(toIndentedString(isCertified)).append("\n");
        sb.append("    certificationId: ").append(toIndentedString(certificationId)).append("\n");
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
