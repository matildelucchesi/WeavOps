package org.openapitools.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.annotation.Generated;
import jakarta.validation.constraints.*;
import java.util.*;
import java.util.Objects;
import org.springframework.lang.Nullable;

/** Azienda di destinazione italiana condivisibile tra più clienti. */
@Schema(
        name = "destination",
        description = "Azienda di destinazione italiana condivisibile tra più clienti.")
@JsonTypeName("destination")
@Generated(
        value = "org.openapitools.codegen.languages.SpringCodegen",
        date = "2026-10-09T14:44:47.753999700+02:00[Europe/Rome]",
        comments = "Generator version: 7.23.0")
public class Destination {

    private @Nullable String id;

    private String name;

    private String street;

    private String streetNumber;

    private String postalCode;

    private String city;

    private String provinceCode;

    public Destination() {
        super();
    }

    /** Constructor with only required parameters */
    public Destination(
            String name,
            String street,
            String streetNumber,
            String postalCode,
            String city,
            String provinceCode) {
        this.name = name;
        this.street = street;
        this.streetNumber = streetNumber;
        this.postalCode = postalCode;
        this.city = city;
        this.provinceCode = provinceCode;
    }

    public Destination id(@Nullable String id) {
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

    public Destination name(String name) {
        this.name = name;
        return this;
    }

    /**
     * Nome dell'azienda di destinazione.
     *
     * @return name
     */
    @NotNull
    @Size(min = 1)
    @Schema(
            name = "name",
            description = "Nome dell'azienda di destinazione.",
            requiredMode = Schema.RequiredMode.REQUIRED)
    @JsonProperty("name")
    public String getName() {
        return name;
    }

    @JsonProperty("name")
    public void setName(String name) {
        this.name = name;
    }

    public Destination street(String street) {
        this.street = street;
        return this;
    }

    /**
     * Via, piazza o altra denominazione stradale.
     *
     * @return street
     */
    @NotNull
    @Size(min = 1)
    @Schema(
            name = "street",
            description = "Via, piazza o altra denominazione stradale.",
            requiredMode = Schema.RequiredMode.REQUIRED)
    @JsonProperty("street")
    public String getStreet() {
        return street;
    }

    @JsonProperty("street")
    public void setStreet(String street) {
        this.street = street;
    }

    public Destination streetNumber(String streetNumber) {
        this.streetNumber = streetNumber;
        return this;
    }

    /**
     * Numero civico, inclusi suffissi o SNC.
     *
     * @return streetNumber
     */
    @NotNull
    @Size(min = 1)
    @Schema(
            name = "streetNumber",
            description = "Numero civico, inclusi suffissi o SNC.",
            requiredMode = Schema.RequiredMode.REQUIRED)
    @JsonProperty("streetNumber")
    public String getStreetNumber() {
        return streetNumber;
    }

    @JsonProperty("streetNumber")
    public void setStreetNumber(String streetNumber) {
        this.streetNumber = streetNumber;
    }

    public Destination postalCode(String postalCode) {
        this.postalCode = postalCode;
        return this;
    }

    /**
     * CAP italiano, inclusi gli eventuali zeri iniziali.
     *
     * @return postalCode
     */
    @NotNull
    @Pattern(regexp = "^[0-9]{5}$")
    @Schema(
            name = "postalCode",
            description = "CAP italiano, inclusi gli eventuali zeri iniziali.",
            requiredMode = Schema.RequiredMode.REQUIRED)
    @JsonProperty("postalCode")
    public String getPostalCode() {
        return postalCode;
    }

    @JsonProperty("postalCode")
    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public Destination city(String city) {
        this.city = city;
        return this;
    }

    /**
     * Comune.
     *
     * @return city
     */
    @NotNull
    @Size(min = 1)
    @Schema(name = "city", description = "Comune.", requiredMode = Schema.RequiredMode.REQUIRED)
    @JsonProperty("city")
    public String getCity() {
        return city;
    }

    @JsonProperty("city")
    public void setCity(String city) {
        this.city = city;
    }

    public Destination provinceCode(String provinceCode) {
        this.provinceCode = provinceCode;
        return this;
    }

    /**
     * Sigla provincia, normalizzata in maiuscolo dal server.
     *
     * @return provinceCode
     */
    @NotNull
    @Pattern(regexp = "^[A-Za-z]{2}$")
    @Schema(
            name = "provinceCode",
            description = "Sigla provincia, normalizzata in maiuscolo dal server.",
            requiredMode = Schema.RequiredMode.REQUIRED)
    @JsonProperty("provinceCode")
    public String getProvinceCode() {
        return provinceCode;
    }

    @JsonProperty("provinceCode")
    public void setProvinceCode(String provinceCode) {
        this.provinceCode = provinceCode;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        Destination destination = (Destination) o;
        return Objects.equals(this.id, destination.id)
                && Objects.equals(this.name, destination.name)
                && Objects.equals(this.street, destination.street)
                && Objects.equals(this.streetNumber, destination.streetNumber)
                && Objects.equals(this.postalCode, destination.postalCode)
                && Objects.equals(this.city, destination.city)
                && Objects.equals(this.provinceCode, destination.provinceCode);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, street, streetNumber, postalCode, city, provinceCode);
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("class Destination {\n");
        sb.append("    id: ").append(toIndentedString(id)).append("\n");
        sb.append("    name: ").append(toIndentedString(name)).append("\n");
        sb.append("    street: ").append(toIndentedString(street)).append("\n");
        sb.append("    streetNumber: ").append(toIndentedString(streetNumber)).append("\n");
        sb.append("    postalCode: ").append(toIndentedString(postalCode)).append("\n");
        sb.append("    city: ").append(toIndentedString(city)).append("\n");
        sb.append("    provinceCode: ").append(toIndentedString(provinceCode)).append("\n");
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
