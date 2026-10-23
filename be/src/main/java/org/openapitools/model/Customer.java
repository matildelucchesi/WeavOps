package org.openapitools.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.annotation.Generated;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import org.springframework.lang.Nullable;

/** Customer */
@JsonTypeName("customer")
@Generated(
        value = "org.openapitools.codegen.languages.SpringCodegen",
        date = "2026-10-09T15:12:17.023382100+02:00[Europe/Rome]",
        comments = "Generator version: 7.23.0")
public class Customer {

    private @Nullable String id;

    private String name;

    private List<@Valid Referent> referents = new ArrayList<>();

    private List<@Valid Item> items = new ArrayList<>();

    private @Nullable String note;

    private String email;

    private String vatNumber;

    private List<String> destinationIds = new ArrayList<>();

    private @Nullable String street;

    private @Nullable String streetNumber;

    private @Nullable String postalCode;

    private @Nullable String city;

    private @Nullable String provinceCode;
    private @Nullable String country;

    public Customer country(@Nullable String country) {
        this.country = country;
        return this;
    }

    @JsonProperty("country")
    @Size(max = 100)
    @Schema(description = "Nazione del cliente; assente se non specificata.")
    public @Nullable String getCountry() {
        return country;
    }

    public void setCountry(@Nullable String country) {
        this.country = country;
    }

    @com.fasterxml.jackson.annotation.JsonIgnore
    @Schema(hidden = true)
    @AssertTrue(
            message =
                    "Per gli indirizzi italiani il CAP deve avere 5 cifre e la provincia 2 lettere")
    public boolean isAddressFormatValid() {
        String normalized =
                country == null ? "" : country.trim().toUpperCase(java.util.Locale.ROOT);
        boolean italian =
                normalized.isEmpty()
                        || java.util.Set.of("ITALIA", "IT", "ITA", "ITALY").contains(normalized);
        return !italian
                || ((postalCode == null
                                || postalCode.isBlank()
                                || postalCode.trim().matches("[0-9]{5}"))
                        && (provinceCode == null
                                || provinceCode.isBlank()
                                || provinceCode.trim().matches("[A-Za-z]{2}")));
    }

    public Customer() {
        super();
    }

    /** Constructor with only required parameters */
    public Customer(String name, String email, String vatNumber) {
        this.name = name;
        this.email = email;
        this.vatNumber = vatNumber;
    }

    public Customer id(@Nullable String id) {
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

    public Customer name(String name) {
        this.name = name;
        return this;
    }

    /**
     * Get name
     *
     * @return name
     */
    @NotNull
    @Schema(name = "name", requiredMode = Schema.RequiredMode.REQUIRED)
    @JsonProperty("name")
    public String getName() {
        return name;
    }

    @JsonProperty("name")
    public void setName(String name) {
        this.name = name;
    }

    public Customer referents(List<@Valid Referent> referents) {
        this.referents = referents;
        return this;
    }

    public Customer addReferentsItem(Referent referentsItem) {
        if (this.referents == null) {
            this.referents = new ArrayList<>();
        }
        this.referents.add(referentsItem);
        return this;
    }

    /**
     * Get referents
     *
     * @return referents
     */
    @Valid
    @Schema(name = "referents", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @JsonProperty("referents")
    public List<@Valid Referent> getReferents() {
        return referents;
    }

    @JsonProperty("referents")
    public void setReferents(List<@Valid Referent> referents) {
        this.referents = referents;
    }

    public Customer items(List<@Valid Item> items) {
        this.items = items;
        return this;
    }

    public Customer addItemsItem(Item itemsItem) {
        if (this.items == null) {
            this.items = new ArrayList<>();
        }
        this.items.add(itemsItem);
        return this;
    }

    /**
     * Get items
     *
     * @return items
     */
    @Valid
    @Schema(name = "items", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @JsonProperty("items")
    public List<@Valid Item> getItems() {
        return items;
    }

    @JsonProperty("items")
    public void setItems(List<@Valid Item> items) {
        this.items = items;
    }

    public Customer note(@Nullable String note) {
        this.note = note;
        return this;
    }

    /**
     * Get note
     *
     * @return note
     */
    @Schema(name = "note", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @JsonProperty("note")
    public @Nullable String getNote() {
        return note;
    }

    @JsonProperty("note")
    public void setNote(@Nullable String note) {
        this.note = note;
    }

    public Customer email(String email) {
        this.email = email;
        return this;
    }

    /**
     * Get email
     *
     * @return email
     */
    @NotNull
    @Schema(name = "email", requiredMode = Schema.RequiredMode.REQUIRED)
    @JsonProperty("email")
    public String getEmail() {
        return email;
    }

    @JsonProperty("email")
    public void setEmail(String email) {
        this.email = email;
    }

    public Customer vatNumber(String vatNumber) {
        this.vatNumber = vatNumber;
        return this;
    }

    /**
     * Partita IVA alfanumerica obbligatoria, senza limite di 11 caratteri.
     *
     * @return vatNumber
     */
    @NotNull
    @Pattern(regexp = "^[A-Za-z0-9]+$")
    @Schema(
            name = "vatNumber",
            description = "Partita IVA alfanumerica obbligatoria, senza limite di 11 caratteri.",
            requiredMode = Schema.RequiredMode.REQUIRED)
    @JsonProperty("vatNumber")
    public String getVatNumber() {
        return vatNumber;
    }

    @JsonProperty("vatNumber")
    public void setVatNumber(String vatNumber) {
        this.vatNumber = vatNumber;
    }

    public Customer destinationIds(List<String> destinationIds) {
        this.destinationIds = destinationIds;
        return this;
    }

    public Customer addDestinationIdsItem(String destinationIdsItem) {
        if (this.destinationIds == null) {
            this.destinationIds = new ArrayList<>();
        }
        this.destinationIds.add(destinationIdsItem);
        return this;
    }

    /**
     * Destinazioni condivise associate al cliente.
     *
     * @return destinationIds
     */
    @Schema(
            name = "destinationIds",
            description = "Destinazioni condivise associate al cliente.",
            requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @JsonProperty("destinationIds")
    public List<String> getDestinationIds() {
        return destinationIds;
    }

    @JsonProperty("destinationIds")
    public void setDestinationIds(List<String> destinationIds) {
        this.destinationIds = destinationIds;
    }

    public Customer street(@Nullable String street) {
        this.street = street;
        return this;
    }

    /**
     * Via o piazza del cliente.
     *
     * @return street
     */
    @Schema(
            name = "street",
            description = "Via o piazza del cliente.",
            requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @JsonProperty("street")
    public @Nullable String getStreet() {
        return street;
    }

    @JsonProperty("street")
    public void setStreet(@Nullable String street) {
        this.street = street;
    }

    public Customer streetNumber(@Nullable String streetNumber) {
        this.streetNumber = streetNumber;
        return this;
    }

    /**
     * Numero civico, inclusi suffissi o SNC.
     *
     * @return streetNumber
     */
    @Schema(
            name = "streetNumber",
            description = "Numero civico, inclusi suffissi o SNC.",
            requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @JsonProperty("streetNumber")
    public @Nullable String getStreetNumber() {
        return streetNumber;
    }

    @JsonProperty("streetNumber")
    public void setStreetNumber(@Nullable String streetNumber) {
        this.streetNumber = streetNumber;
    }

    public Customer postalCode(@Nullable String postalCode) {
        this.postalCode = postalCode;
        return this;
    }

    /**
     * Codice postale; cinque cifre per gli indirizzi italiani.
     *
     * @return postalCode
     */
    @Size(max = 20)
    @Schema(
            name = "postalCode",
            description = "Codice postale; cinque cifre per gli indirizzi italiani.",
            requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @JsonProperty("postalCode")
    public @Nullable String getPostalCode() {
        return postalCode;
    }

    @JsonProperty("postalCode")
    public void setPostalCode(@Nullable String postalCode) {
        this.postalCode = postalCode;
    }

    public Customer city(@Nullable String city) {
        this.city = city;
        return this;
    }

    /**
     * Comune del cliente.
     *
     * @return city
     */
    @Schema(
            name = "city",
            description = "Comune del cliente.",
            requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @JsonProperty("city")
    public @Nullable String getCity() {
        return city;
    }

    @JsonProperty("city")
    public void setCity(@Nullable String city) {
        this.city = city;
    }

    public Customer provinceCode(@Nullable String provinceCode) {
        this.provinceCode = provinceCode;
        return this;
    }

    /**
     * Provincia o regione; due lettere per gli indirizzi italiani.
     *
     * @return provinceCode
     */
    @Size(max = 100)
    @Schema(
            name = "provinceCode",
            description = "Provincia o regione; due lettere per gli indirizzi italiani.",
            requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @JsonProperty("provinceCode")
    public @Nullable String getProvinceCode() {
        return provinceCode;
    }

    @JsonProperty("provinceCode")
    public void setProvinceCode(@Nullable String provinceCode) {
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
        Customer customer = (Customer) o;
        return Objects.equals(this.id, customer.id)
                && Objects.equals(this.name, customer.name)
                && Objects.equals(this.referents, customer.referents)
                && Objects.equals(this.items, customer.items)
                && Objects.equals(this.note, customer.note)
                && Objects.equals(this.email, customer.email)
                && Objects.equals(this.vatNumber, customer.vatNumber)
                && Objects.equals(this.destinationIds, customer.destinationIds)
                && Objects.equals(this.street, customer.street)
                && Objects.equals(this.streetNumber, customer.streetNumber)
                && Objects.equals(this.postalCode, customer.postalCode)
                && Objects.equals(this.city, customer.city)
                && Objects.equals(this.provinceCode, customer.provinceCode)
                && Objects.equals(this.country, customer.country);
    }

    @Override
    public int hashCode() {
        return Objects.hash(
                id,
                name,
                referents,
                items,
                note,
                email,
                vatNumber,
                destinationIds,
                street,
                streetNumber,
                postalCode,
                city,
                provinceCode,
                country);
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("class Customer {\n");
        sb.append("    id: ").append(toIndentedString(id)).append("\n");
        sb.append("    name: ").append(toIndentedString(name)).append("\n");
        sb.append("    referents: ").append(toIndentedString(referents)).append("\n");
        sb.append("    items: ").append(toIndentedString(items)).append("\n");
        sb.append("    note: ").append(toIndentedString(note)).append("\n");
        sb.append("    email: ").append(toIndentedString(email)).append("\n");
        sb.append("    vatNumber: ").append(toIndentedString(vatNumber)).append("\n");
        sb.append("    destinationIds: ").append(toIndentedString(destinationIds)).append("\n");
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
